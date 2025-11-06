export type Bindings = {
	HYPERDRIVE: Hyperdrive;
	HYPERDRIVE_READONLY: Hyperdrive;
	KV: KVNamespace;
	RateLimiter: DurableObjectNamespace;
	OPENAI_API_KEY: string;
	GOOGLE_GENERATIVE_AI_API_KEY: string;
	DEEPSEEK_API_KEY: string;
	CLERK_SECRET_KEY: string;
	CLERK_WEBHOOK_SECRET: string;
};

export type Variables = {
	cacheKey?: string;
	clerkUserId?: string;
	isAuthenticated?: boolean;
};

export type Env = {
	Bindings: Bindings;
	Variables: Variables;
};
