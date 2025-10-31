import { Context } from "hono";
import { Logger } from "@repo/utils";

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

		console.log("✓️ Cache hit: ", cacheKey);
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

		console.log("✓ KV hit: ", cacheKey);

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
		const pathname = new URL(c.req.url).pathname;
		const cacheHit = await this.readCache(cacheKey);
		if (cacheHit) return cacheHit;
		Logger.info(pathname, { message: "Cache missed!" });

		const kvHit = await this.readKv(cacheKey, c);
		if (kvHit) return kvHit;
		Logger.info(pathname, { message: "KV missed!" });

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

	async tryFetch<T>(
		c: Context,
		cacheKey: string,
		compute: () => Promise<T>,
		{ ttlSeconds }: { ttlSeconds?: number } = {},
	) {
		const pathname = new URL(c.req.url).pathname;
		const cacheHit = await this.readCache(cacheKey);
		if (cacheHit) return (await cacheHit.json()) as T;
		Logger.info(pathname, { message: `Cache missed: ${cacheKey}` });

		const kvHit = await this.readKv(cacheKey, c);
		if (kvHit) return (await kvHit.json()) as T;
		Logger.info(pathname, { message: `KV missed: ${cacheKey}` });

		const fresh = await compute();

		await c.env.KV.put(cacheKey, JSON.stringify(fresh), {
			expirationTtl: ttlSeconds ?? this.ttlSeconds,
		});
		await this.writeCache(cacheKey, fresh);

		return fresh;
	}

	async delete(cacheKey: string, c: Context) {
		const cache = await caches.open(this.namespace);
		await cache.delete(this.cacheUrlFor(cacheKey));
		await c.env.KV.delete(cacheKey);
	}

	async shaCacheKey(context: string, slice: number = 0, opts?: object): Promise<string> {
		const normalized = context.normalize("NFC").trim().replace(/\s+/g, " ");

		const payload = JSON.stringify({ q: normalized, ...opts });

		// hash with SHA-256
		const encoder = new TextEncoder();
		const data = encoder.encode(payload);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);

		// convert to base64url for compact readability
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const base64url = btoa(String.fromCharCode(...hashArray))
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=+$/, "");

		const key = slice > 0 ? base64url.slice(0, slice) : base64url;

		return `cache:${key}`;
	}
}

export const cacheKvLayer = new CacheKvLayer();
