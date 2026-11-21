import { createMiddleware } from "hono/factory";
import type { Env } from "@/types";
import { createDb } from "@/db";
import { usersTable, getTierConfig } from "@repo/database";
import { eq } from "drizzle-orm";

// Mount after requireAuth, or every request falls back to the per-IP limit.
export function tierBasedRateLimiter() {
	return createMiddleware<Env>(async (c, next) => {
		const clerkUserId = c.get("clerkUserId");
		const endpoint = new URL(c.req.url).pathname;

		if (!clerkUserId) {
			console.warn("Tier-based rate limit: No clerkUserId, using IP-based default");
			const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "anonymous";
			const actorKey = `ip:${ip}:endpoint:${endpoint}`;
			const capacity = 5;
			const windowSecond = 60;

			const id = c.env.RateLimiter.idFromName(actorKey);
			const stub = c.env.RateLimiter.get(id);
			const doUrl = `https://do?capacity=${capacity}&windowSecond=${windowSecond}`;
			const result = await stub.fetch(doUrl, { method: "POST" });

			for (const h of [
				"X-RateLimit-Policy",
				"X-RateLimit-Limit",
				"X-RateLimit-Remaining",
				"X-RateLimit-Reset",
				"Retry-After",
			]) {
				const v = result.headers.get(h);
				if (v) c.header(h, v);
			}

			if (result.status === 429) {
				return c.text("Too Many Requests", 429);
			}

			await next();
			return;
		}

		const db = createDb(c.env.HYPERDRIVE.connectionString);
		const [user] = await db
			.select({ tier: usersTable.tier })
			.from(usersTable)
			.where(eq(usersTable.clerk_user_id, clerkUserId))
			.limit(1);

		if (!user) {
			console.warn("Tier-based rate limit: User not found, using default");
			await next();
			return;
		}

		const tierConfig = getTierConfig(user.tier);
		const capacity = tierConfig.rate_limit_capacity;
		const windowSecond = tierConfig.rate_limit_window_seconds;

		const actorKey = `user:${clerkUserId}:endpoint:${endpoint}`;

		const id = c.env.RateLimiter.idFromName(actorKey);
		const stub = c.env.RateLimiter.get(id);

		const doUrl = `https://do?capacity=${capacity}&windowSecond=${windowSecond}`;
		const result = await stub.fetch(doUrl, { method: "POST" });

		for (const h of [
			"X-RateLimit-Policy",
			"X-RateLimit-Limit",
			"X-RateLimit-Remaining",
			"X-RateLimit-Reset",
			"Retry-After",
		]) {
			const v = result.headers.get(h);
			if (v) c.header(h, v);
		}

		if (result.status === 429) {
			return c.json({
				error: "Too Many Requests",
				details: `You've exceeded the rate limit for your ${user.tier} tier. Please upgrade or wait before making more requests.`,
			}, 429);
		}

		await next();
	});
}
