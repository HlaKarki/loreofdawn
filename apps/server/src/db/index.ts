import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(
	process.env.SUPABASE_DATABASE_URL ?? process.env.RAILWAY_DATABASE_URL ?? "",
);
