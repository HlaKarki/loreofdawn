import { Hono } from "hono";
import type { Env } from "@/types";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/backend";
import { UserService } from "@/services/users.service";
import { Logger } from "@repo/utils";

export const webhooksRouter = new Hono<Env>();

/**
 * Clerk webhook handler
 * Receives events from Clerk and syncs user data to database
 */
webhooksRouter.post("/clerk", async (c) => {
	const pathname = new URL(c.req.url).pathname;
	const WEBHOOK_SECRET = c.env.CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		Logger.error(pathname, { message: "Missing CLERK_WEBHOOK_SECRET" });
		return c.json({ error: "Webhook secret not configured" }, 500);
	}

	// Get headers for verification
	const svix_id = c.req.header("svix-id");
	const svix_timestamp = c.req.header("svix-timestamp");
	const svix_signature = c.req.header("svix-signature");

	if (!svix_id || !svix_timestamp || !svix_signature) {
		Logger.error(pathname, { message: "Missing svix headers" });
		return c.json({ error: "Missing svix headers" }, 400);
	}

	// Get raw body for verification
	const payload = await c.req.text();

	// Verify webhook signature
	const wh = new Webhook(WEBHOOK_SECRET);
	let evt: WebhookEvent;

	try {
		evt = wh.verify(payload, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		Logger.error(pathname, { message: `Webhook verification failed: ${err}` });
		return c.json({ error: "Invalid signature" }, 400);
	}

	const eventType = evt.type;

	const userService = new UserService(c.env);

	switch (eventType) {
		case "user.created": {
			const { id, email_addresses, image_url, first_name, last_name } = evt.data;

			Logger.info(pathname, { message: `📝 User created: ${id}` });
			try {
				await userService.createUser({
					clerk_user_id: id,
					email: email_addresses[0]?.email_address || "",
					name: `${first_name || ""} ${last_name || ""}`.trim() || "Anonymous",
					imageUrl: image_url || "",
					tier: "free",
					credits_remaining: 50,
					credits_total: 50,
					credits_reset_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
				});
				Logger.info(pathname, { message: "✅ User synced to database" });
			} catch (error) {
				Logger.error(pathname, { message: `❌ Failed to sync user: ${error}` });
				return c.json({ error: "Failed to create user" }, 500);
			}
			break;
		}

		case "user.updated": {
			const { id, email_addresses, image_url, first_name, last_name } = evt.data;

			try {
				await userService.updateUser(id, {
					email: email_addresses[0]?.email_address,
					name: `${first_name || ""} ${last_name || ""}`.trim(),
					imageUrl: image_url,
				});
				Logger.info(pathname, { message: `✅ User updated: ${id}` });
			} catch (error) {
				Logger.error(pathname, { message: `❌ Failed to update user: ${error}` });
				return c.json({ error: "Failed to update user" }, 500);
			}
			break;
		}

		case "user.deleted": {
			const { id } = evt.data;

			if (!id) {
				Logger.error(pathname, { message: "❌ Missing user ID" });
				return c.json({ error: "Missing user ID" }, 400);
			}
			try {
				await userService.deleteUser(id);
				Logger.warn(pathname, { message: `✅ User deleted from database: ${id}` });
			} catch (error) {
				Logger.error(pathname, { message: `❌ Failed to delete user: ${error}` });
				return c.json({ error: "Failed to delete user" }, 500);
			}
			break;
		}

		default:
			Logger.info(pathname, { message: `ℹ️ Unhandled event type: ${eventType}` });
	}

	return c.json({ success: true });
});
