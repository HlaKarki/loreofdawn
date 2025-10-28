export type Bindings = {
	HYPERDRIVE: Hyperdrive;
	HYPERDRIVE_READONLY: Hyperdrive;
	KV: KVNamespace;
	RateLimiter: DurableObjectNamespace;
};

export type Variables = {
	cacheKey?: string;
};

export type Env = {
	Bindings: Bindings;
	Variables: Variables;
};
