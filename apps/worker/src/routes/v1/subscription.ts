import { Hono } from "hono";
import type { Env } from "@/types";
import { requireAuth } from "@/middleware/auth";
import { StripeService } from "@/services/stripe.service";
import { UserService } from "@/services/users.service";
import { createDb } from "@/db";
import { Logger } from "@repo/utils";
import { z } from "zod";

export const subscriptionRouter = new Hono<Env>();

const checkoutSchema = z.object({
	tier: z.enum(["master", "mythical"]),
	successUrl: z.string().url(),
	cancelUrl: z.string().url(),
});

/**
 * POST /subscription/checkout
 * Create a Stripe checkout session for subscription
 */
subscriptionRouter.post("/checkout", requireAuth, async (c) => {
	const pathname = new URL(c.req.url).pathname;
	const clerkUserId = c.get("clerkUserId");

	if (!clerkUserId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const validation = checkoutSchema.safeParse(await c.req.json());
	if (!validation.success) {
		return c.json({ error: "Invalid request", details: validation.error.errors }, 400);
	}

	const { tier, successUrl, cancelUrl } = validation.data;

	try {
		const db = createDb(c.env.HYPERDRIVE.connectionString);
		const userService = new UserService(db);
		const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY);

		const user = await userService.getUserByClerkId(clerkUserId);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Check if user already has an active subscription
		if (user.stripe_subscription_status === "active") {
			return c.json(
				{
					error: "Active subscription exists",
					details:
						"Please use the customer portal to manage your subscription, including upgrades and cancellations.",
					usePortal: true,
				},
				400,
			);
		}

		// Get price ID based on tier
		const priceId =
			tier === "master" ? c.env.STRIPE_PRICE_ID_MASTER : c.env.STRIPE_PRICE_ID_MYTHICAL;

		// Create checkout session
		const session = await stripeService.createCheckoutSession({
			priceId,
			customerEmail: user.email,
			customerId: user.stripe_customer_id || undefined,
			userId: clerkUserId,
			successUrl,
			cancelUrl,
		});

		Logger.info(pathname, {
			clerkUserId,
			tier,
			sessionId: session.id,
			message: "Checkout session created",
		});

		return c.json({
			sessionId: session.id,
			url: session.url,
		});
	} catch (error) {
		Logger.error(pathname, { clerkUserId, error, message: "Failed to create checkout session" });
		return c.json(
			{
				error: "Failed to create checkout session",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

/**
 * GET /subscription/status
 * Get current subscription status
 */
subscriptionRouter.get("/status", requireAuth, async (c) => {
	const pathname = new URL(c.req.url).pathname;
	const clerkUserId = c.get("clerkUserId");

	if (!clerkUserId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	try {
		const db = createDb(c.env.HYPERDRIVE.connectionString);
		const userService = new UserService(db);

		const user = await userService.getUserByClerkId(clerkUserId);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		return c.json({
			tier: user.tier,
			stripe_subscription_status: user.stripe_subscription_status,
			stripe_subscription_id: user.stripe_subscription_id,
			credits_remaining: user.credits_remaining,
			credits_total: user.credits_total,
			credits_reset_at: user.credits_reset_at,
		});
	} catch (error) {
		Logger.error(pathname, { clerkUserId, error, message: "Failed to get subscription status" });
		return c.json(
			{
				error: "Failed to get subscription status",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

/**
 * POST /subscription/cancel
 * Cancel current subscription
 */
subscriptionRouter.post("/cancel", requireAuth, async (c) => {
	const pathname = new URL(c.req.url).pathname;
	const clerkUserId = c.get("clerkUserId");

	if (!clerkUserId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	try {
		const db = createDb(c.env.HYPERDRIVE.connectionString);
		const userService = new UserService(db);
		const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY);

		const user = await userService.getUserByClerkId(clerkUserId);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		if (!user.stripe_subscription_id) {
			return c.json({ error: "No active subscription" }, 400);
		}

		// Cancel subscription in Stripe
		await stripeService.cancelSubscription(user.stripe_subscription_id);

		Logger.info(pathname, {
			clerkUserId,
			subscriptionId: user.stripe_subscription_id,
			message: "Subscription canceled",
		});

		return c.json({
			success: true,
			message: "Subscription canceled successfully",
		});
	} catch (error) {
		Logger.error(pathname, { clerkUserId, error, message: "Failed to cancel subscription" });
		return c.json(
			{
				error: "Failed to cancel subscription",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

/**
 * POST /subscription/portal
 * Get Stripe customer portal link
 */
subscriptionRouter.post("/portal", requireAuth, async (c) => {
	const pathname = new URL(c.req.url).pathname;
	const clerkUserId = c.get("clerkUserId");

	if (!clerkUserId) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const { returnUrl } = await c.req.json<{ returnUrl: string }>();
	if (!returnUrl) {
		return c.json({ error: "returnUrl is required" }, 400);
	}

	try {
		const db = createDb(c.env.HYPERDRIVE.connectionString);
		const userService = new UserService(db);
		const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY);

		const user = await userService.getUserByClerkId(clerkUserId);
		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		if (!user.stripe_customer_id) {
			return c.json({ error: "No Stripe customer found" }, 400);
		}

		const session = await stripeService.createPortalSession(user.stripe_customer_id, returnUrl);

		Logger.info(pathname, {
			clerkUserId,
			customerId: user.stripe_customer_id,
			message: "Portal session created",
		});

		return c.json({
			url: session.url,
		});
	} catch (error) {
		Logger.error(pathname, { clerkUserId, error, message: "Failed to create portal session" });
		return c.json(
			{
				error: "Failed to create portal session",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});
