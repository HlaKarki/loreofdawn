import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.SUPABASE_DATABASE_URL ?? process.env.RAILWAY_DATABASE_URL ?? "",
	},
});
