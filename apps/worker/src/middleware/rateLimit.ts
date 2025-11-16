import { createMiddleware } from "hono/factory";
import type { Env } from "@/types";
import { Context } from "hono";
import { createDb } from "@/db";
import { usersTable, getTierConfig } from "@repo/database";
import { eq } from "drizzle-orm";

/**
 * Token bucket rate limiter using Cloudflare Durable Objects
 *
 * Creates Hono middleware that enforces rate limits per IP address and endpoint.
 * Each unique actor (IP + endpoint combination) gets its own persistent Durable Object
 * instance that maintains a token bucket for smooth rate limiting.
 *
 * @param config - Rate limit configuration
 * @param config.capacity - Maximum tokens in bucket (default: 5)
 * @param config.windowSecond - Time window in seconds to refill bucket (default: 60)
 * @param config.actorKey - Custom function to generate actor key (default: `ip:${ip}:endpoint:${endpoint}`)
 *
 * @returns Hono middleware that returns 429 when rate limit is exceeded
 *
 * @example
 * ```ts
 * const limiter = rateLimiter({ capacity: 10, windowSecond: 60 });
 * app.post('/api/endpoint', limiter, handler);
 * ```
 */
export function rateLimiter(config?: {
	capacity?: number;
	windowSecond?: number;
	actorKey?: (c: Context) => string;
}) {
	const capacity = config?.capacity ?? 5;
	const windowSecond = config?.windowSecond ?? 60;

	return createMiddleware<Env>(async (c, next) => {
		const endpoint = new URL(c.req.url).pathname;
		const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "anonymous";
		const actorKey = config?.actorKey?.(c) ?? `ip:${ip}:endpoint:${endpoint}`;

		if (ip === "anonymous") {
			console.warn("Rate limit: Unknown IP, skipping");
			await next();
			return;
		}

		// create one durable object instance with the actor key
		const id = c.env.RateLimiter.idFromName(actorKey);
		const stub = c.env.RateLimiter.get(id);

		// call the durable object instance
		const doUrl = `https://do?capacity=${capacity}&windowSecond=${windowSecond}`;
		const result = await stub.fetch(doUrl, { method: "POST" });

		// relay helpful headers set by DO
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
	});
}

/**
 * Tier-based rate limiter that applies different rate limits based on user's subscription tier
 * Requires authentication middleware to be applied first (to set clerkUserId)
 *
 * @returns Hono middleware that returns 429 when rate limit is exceeded
 *
 * @example
 * ```ts
 * app.post('/api/endpoint', requireAuth, tierBasedRateLimiter(), handler);
 * ```
 */
export function tierBasedRateLimiter() {
	return createMiddleware<Env>(async (c, next) => {
		const clerkUserId = c.get("clerkUserId");
		const endpoint = new URL(c.req.url).pathname;

		if (!clerkUserId) {
			console.warn("Tier-based rate limit: No clerkUserId, using IP-based default");
			// Fall back to IP-based rate limiting with default capacity
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

		// Get user's tier from database
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

		// Get tier-specific rate limit configuration
		const tierConfig = getTierConfig(user.tier);
		const capacity = tierConfig.rate_limit_capacity;
		const windowSecond = tierConfig.rate_limit_window_seconds;

		// Use user ID as actor key (rate limit per user, not per IP)
		const actorKey = `user:${clerkUserId}:endpoint:${endpoint}`;

		const id = c.env.RateLimiter.idFromName(actorKey);
		const stub = c.env.RateLimiter.get(id);

		const doUrl = `https://do?capacity=${capacity}&windowSecond=${windowSecond}`;
		const result = await stub.fetch(doUrl, { method: "POST" });

		// relay helpful headers set by DO
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
