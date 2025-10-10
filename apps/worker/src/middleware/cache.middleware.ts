import { CacheService } from "@/services/cache.service";
import type { Context, Next } from "hono";
import { HeroNameKey, RankNameKey } from "@/data/ml/hero_ids";

/**
 * Cache middleware for tRPC endpoints
 * Checks Cache API before routing to tRPC handlers
 */
export async function cacheMiddleware(c: Context, next: Next) {
	const url = new URL(c.req.url);

	// Only cache mlData.consolidated endpoint
	if (!url.pathname.includes("mlData.consolidated")) {
		return next();
	}

	// Only cache POST requests (tRPC queries/mutations)
	if (c.req.method !== "POST") {
		return next();
	}

	try {
		// Clone the request to parse body without consuming it
		const clonedRequest = c.req.raw.clone();
		const body = (await clonedRequest.json()) as { hero: HeroNameKey; rank: RankNameKey };
		const hero = body?.hero;
		const rank = body?.rank;

		if (!hero || !rank) {
			// Invalid params, skip caching
			return next();
		}

		// Initialize cache service
		const cacheService = new CacheService();

		// Check cache first
		const cachedResponse = await cacheService.getResponse({ hero, rank });
		if (cachedResponse) {
			console.log("cache hit!");
			// Cache hit - return immediately
			return cachedResponse;
		}

		// Cache miss - continue to tRPC handler
		console.log("cache miss, moving to kv");
		await next();

		// After tRPC responds, cache the response
		const response = c.res;
		if (response.ok) {
			await cacheService.setResponse({ hero, rank }, response);
		}
	} catch (error) {
		// On error, just continue to tRPC (cache failures shouldn't break requests)
		console.error("Cache middleware error:", error);
		return next();
	}
}
