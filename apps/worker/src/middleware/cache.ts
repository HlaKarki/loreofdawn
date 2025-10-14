import { createMiddleware } from "hono/factory";
import type { Env } from "@/types";
import { Context } from "hono";

class CacheKvLayer {
	private readonly namespace: string;
	private readonly ttlSeconds: number;

	constructor(opts?: { namespace?: string; ttlSeconds?: number }) {
		this.namespace = opts?.namespace ?? "api-cache";
		this.ttlSeconds = opts?.ttlSeconds ?? 3600;
	}

	private cacheUrlFor(cacheKey: string) {
		return `https://cache.loreofdawn.com/${cacheKey}`;
	}

	private async readCache(cacheKey: string) {
		const cache = await caches.open(this.namespace);
		const cached = await cache.match(this.cacheUrlFor(cacheKey));
		if (!cached) return null;

		console.log("✓️ Cache hit");
		return cached;
	}

	private async writeCache(cacheKey: string, payload: unknown, headers?: HeadersInit) {
		const cache = await caches.open(this.namespace);
		const response = new Response(JSON.stringify(payload), {
			headers: {
				"Cache-Control": "public, max-age=300",
				...headers,
			},
		});

		await cache.put(this.cacheUrlFor(cacheKey), response);
	}

	private async readKv(cacheKey: string, c: Context) {
		const kvData = await c.env.KV.get(cacheKey, "json");
		if (!kvData) return null;

		console.log("✓ KV hit");

		const response = c.json(kvData);
		await this.writeCache(cacheKey, kvData, response.headers);
		return response;
	}

	async respond<T>(
		c: Context,
		cacheKey: string,
		compute: () => Promise<T | Response | null>,
		{ ttlSeconds }: { ttlSeconds?: number } = {},
	): Promise<Response | undefined> {
		const cacheHit = await this.readCache(cacheKey);
		if (cacheHit) return cacheHit;
		console.log("Cache missed!");

		const kvHit = await this.readKv(cacheKey, c);
		if (kvHit) return kvHit;
		console.log("KV missed!");

		const fresh = await compute();
		if (fresh instanceof Response) {
			if (fresh.ok) {
				const body = await fresh.clone().json();
				await c.env.KV.put(cacheKey, JSON.stringify(body), {
					expirationTtl: ttlSeconds ?? this.ttlSeconds,
				});
				await this.writeCache(cacheKey, body, fresh.headers);
			}
			return fresh;
		}

		if (fresh == null) return;

		await c.env.KV.put(cacheKey, JSON.stringify(fresh), {
			expirationTtl: ttlSeconds ?? this.ttlSeconds,
		});
		await this.writeCache(cacheKey, fresh);

		return c.json(fresh);
	}
}

export const cacheKvLayer = new CacheKvLayer();

/**
 * Middleware that automatically caches responses using both Cloudflare Cache API and KV
 * Set c.set('cacheKey', 'your-key') in your route to enable caching for that route
 */
export const withCache = createMiddleware<Env>(async (c, next) => {
	const cacheKey = c.get("cacheKey");

	// If no cache key is set, skip caching
	if (!cacheKey) {
		await next();
		return;
	}

	// Try to get from cache
	const cached = await cacheKvLayer.respond(c, cacheKey, async () => {
		await next();
		return c.res.ok ? c.res : null;
	});

	if (cached) {
		return cached;
	}
});
