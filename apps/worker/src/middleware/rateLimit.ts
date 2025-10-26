import { createMiddleware } from "hono/factory";
import type { Env } from "@/types";

interface RateLimitConfig {
	/**
	 * Maximum requests allowed per minute
	 */
	requestsPerMinute: number;

	/**
	 * Maximum requests allowed per day
	 */
	requestsPerDay: number;

	/**
	 * Key prefix for KV storage
	 */
	keyPrefix: string;
}

interface RateLimitData {
	minuteCount: number;
	dayCount: number;
	minuteReset: number; // timestamp
	dayReset: number; // timestamp
}

/**
 * Rate limiting middleware using Cloudflare KV
 * Tracks requests per IP address with minute and daily limits
 */
export function rateLimiter(config: RateLimitConfig) {
	return createMiddleware<Env>(async (c, next) => {
		const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";

		// Skip rate limiting for unknown IPs in development
		if (ip === "unknown") {
			console.warn("⚠️ Rate limit: Unknown IP, skipping");
			await next();
			return;
		}

		const kv = c.env.KV;
		const key = `${config.keyPrefix}:${ip}`;
		const now = Date.now();

		// Get current rate limit data
		const stored = await kv.get<RateLimitData>(key, "json");

		const minuteWindow = 60 * 1000; // 1 minute
		const dayWindow = 24 * 60 * 60 * 1000; // 24 hours

		let data: RateLimitData;

		if (!stored) {
			// First request from this IP
			data = {
				minuteCount: 1,
				dayCount: 1,
				minuteReset: now + minuteWindow,
				dayReset: now + dayWindow,
			};
		} else {
			// Check if windows have expired
			const minuteExpired = now >= stored.minuteReset;
			const dayExpired = now >= stored.dayReset;

			data = {
				minuteCount: minuteExpired ? 1 : stored.minuteCount + 1,
				dayCount: dayExpired ? 1 : stored.dayCount + 1,
				minuteReset: minuteExpired ? now + minuteWindow : stored.minuteReset,
				dayReset: dayExpired ? now + dayWindow : stored.dayReset,
			};
		}

		// Check limits
		const minuteLimitExceeded = data.minuteCount > config.requestsPerMinute;
		const dayLimitExceeded = data.dayCount > config.requestsPerDay;

		if (minuteLimitExceeded || dayLimitExceeded) {
			const retryAfter = minuteLimitExceeded
				? Math.ceil((data.minuteReset - now) / 1000)
				: Math.ceil((data.dayReset - now) / 1000);

			const limitType = minuteLimitExceeded ? "minute" : "day";

			return c.json(
				{
					error: "Rate limit exceeded",
					details: `Too many requests. Please try again in ${retryAfter} seconds.`,
					limit: limitType === "minute" ? config.requestsPerMinute : config.requestsPerDay,
					window: limitType,
					retryAfter,
				},
				429,
				{
					"Retry-After": retryAfter.toString(),
					"X-RateLimit-Limit": config.requestsPerMinute.toString(),
					"X-RateLimit-Remaining": "0",
					"X-RateLimit-Reset": data.minuteReset.toString(),
				},
			);
		}

		// Store updated counts
		const ttl = Math.max(
			Math.ceil((data.dayReset - now) / 1000),
			Math.ceil((data.minuteReset - now) / 1000),
		);
		await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });

		// Add rate limit headers to response
		c.header("X-RateLimit-Limit", config.requestsPerMinute.toString());
		c.header("X-RateLimit-Remaining", (config.requestsPerMinute - data.minuteCount).toString());
		c.header("X-RateLimit-Reset", data.minuteReset.toString());

		// Log request for monitoring
		console.log(
			`[Rate Limit] IP: ${ip}, Minute: ${data.minuteCount}/${config.requestsPerMinute}, Day: ${data.dayCount}/${config.requestsPerDay}`,
		);

		await next();
	});
}