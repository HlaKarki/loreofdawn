export type Bindings = {
	HYPERDRIVE: Hyperdrive;
	KV: KVNamespace;
};

export type Variables = {
	cacheKey?: string;
};

export type Env = {
	Bindings: Bindings;
	Variables: Variables;
};