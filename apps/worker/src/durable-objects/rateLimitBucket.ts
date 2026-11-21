type Bucket = {
	tokens: number;
	lastMs: number;
};

export class RateLimitBucket {
	constructor(
		private state: DurableObjectState,
		private env: Env,
	) {}

	async fetch(request: Request) {
		const url = new URL(request.url);

		const capacity = Number(url.searchParams.get("capacity") ?? 5);
		const windowSeconds = Number(url.searchParams.get("windowSecond") ?? 60);
		const refillMs = capacity / (windowSeconds * 1000);

		let bucket = await this.state.storage.get<Bucket>("bucket");

		const now = Date.now();
		if (!bucket) {
			bucket = {
				tokens: capacity,
				lastMs: now,
			};
		} else {
			const elapsed = Math.max(0, now - bucket.lastMs);
			const refill = elapsed * refillMs;
			bucket.tokens = Math.min(capacity, bucket.tokens + refill);
			bucket.lastMs = now;
		}

		const isValid = bucket.tokens >= 1;
		if (isValid) {
			bucket.tokens -= 1;
		}

		await this.state.storage.put("bucket", bucket);

		const secondsToCapacity = (capacity - bucket.tokens) / (refillMs * 1000);
		const retryAfter = isValid ? 0 : Math.ceil((1 - bucket.tokens) / (refillMs * 1000));
		const headers = new Headers({
			"X-RateLimit-Policy": `token-bucket; capacity=${capacity}; window=${windowSeconds}s`,
			"X-RateLimit-Limit": String(capacity),
			"X-RateLimit-Remaining": String(Math.floor(bucket.tokens)),
			"X-RateLimit-Reset": String(Math.ceil(now / 1000 + secondsToCapacity)),
			"Retry-After": String(retryAfter),
		});

		return isValid
			? new Response(JSON.stringify({ allowed: true, remaining: Math.floor(bucket.tokens) }), {
					status: 200,
					headers,
				})
			: new Response(JSON.stringify({ allowed: false, retryAfter }), {
					status: 429,
					headers,
				});
	}
}
