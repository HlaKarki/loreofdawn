import type { HeroNameKey, RankNameKey } from "@/data/ml/hero_ids";

export class CacheService {
	private readonly TTL_SECONDS = 60 * 5; // 5 minutes
	private readonly CACHE_NAME = "api-cache";

	/**
	 * Generate a consistent cache key for hero data requests
	 */
	private getKey(hero: HeroNameKey, rank: RankNameKey): string {
		return `https://cache.loreofdawn.com/hero/${hero}/${rank}`;
	}

	/**
	 * Get cached response from Cache API
	 */
	async getResponse(opts: {
		hero: HeroNameKey;
		rank: RankNameKey;
	}): Promise<Response | null> {
		try {
			const cacheKey = this.getKey(opts.hero, opts.rank);
			const cache = await caches.open(this.CACHE_NAME);
			const cachedResponse = await cache.match(cacheKey);

			if (cachedResponse) {
				console.log(`✓ Cache API hit: ${opts.hero}:${opts.rank}`);
				return cachedResponse;
			}

			console.log(`✗ Cache API miss: ${opts.hero}:${opts.rank}`);
			return null;
		} catch (error) {
			console.error("Cache API get error:", error);
			return null;
		}
	}

	/**
	 * Store response in Cache API with 5-minute TTL
	 */
	async setResponse(
		opts: { hero: HeroNameKey; rank: RankNameKey },
		response: Response,
	): Promise<void> {
		try {
			const cacheKey = this.getKey(opts.hero, opts.rank);
			const cache = await caches.open(this.CACHE_NAME);

			// Clone the response since it can only be read once
			const responseToCache = response.clone();

			// Add cache headers
			const headers = new Headers(responseToCache.headers);
			headers.set("Cache-Control", `public, max-age=${this.TTL_SECONDS}`);
			headers.set("X-Cache-Status", "HIT");
			headers.set("X-Cache-Time", new Date().toISOString());

			const cachedResponse = new Response(responseToCache.body, {
				status: responseToCache.status,
				statusText: responseToCache.statusText,
				headers,
			});

			await cache.put(cacheKey, cachedResponse);
			console.log(`✓ Cache API stored: ${opts.hero}:${opts.rank}`);
		} catch (error) {
			console.error("Cache API set error:", error);
			// Don't throw - cache failures shouldn't break the app
		}
	}
}