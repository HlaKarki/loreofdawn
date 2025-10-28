import { createMiddleware } from "hono/factory";
import type { Env } from "@/types";
import { Context } from "hono";

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
