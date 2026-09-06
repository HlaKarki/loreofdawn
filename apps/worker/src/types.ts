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
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
	STRIPE_PRICE_ID_MASTER: string;
	STRIPE_PRICE_ID_MYTHICAL: string;
	ML_BASE_URL: string;
	ML_FIRST_ID: string;
	ML_SECOND_ID_HERO: string;
	ML_SECOND_ID_MATCHUP: string;
	ML_SECOND_ID_META: string;
	ML_SECOND_ID_GRAPH: string;
	SYNC_SECRET_TOKEN: string;
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
