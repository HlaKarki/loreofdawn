import { z } from "zod";

const envSchema = z.object({
	VITE_SERVER_URL: z.url(),
	VITE_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

export const env = envSchema.parse({
	VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
	VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
});
