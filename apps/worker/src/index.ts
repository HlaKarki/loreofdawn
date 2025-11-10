import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiRouter } from "@/routes";
import { errorHandler } from "@/middleware/error";
import { HeroService } from "@/services/heroes.service";
import type { Env, Bindings } from "@/types";
import { createDb } from "@/db";
export { RateLimitBucket } from "@/durable-objects/rateLimitBucket";

const allowedOrigins = new Set([
	"https://loreofdawn.com",
	"https://www.loreofdawn.com",
	"https://cf-api.loreofdawn.com",
	"https://clerk.auth.loreofdawn.com",
	"https://api.clerk.com",
	"https://clerk.auth.loreofdawn.com/.well-known/jwks.json",
	"http://localhost:1201",
]);

export const app = new Hono<Env>();

// Global middleware
app.use("*", logger());
app.use(
	"*",
	cors({
		origin: (origin) => (origin && allowedOrigins.has(origin) ? origin : "https://loreofdawn.com"),
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization", "User-Agent", "user-agent"],
	}),
);
app.use("*", errorHandler);

// Mount API routes
app.route("/", apiRouter);

/**
 * Cron job: Seed KV cache with all data data
 * Runs on a schedule to pre-populate the cache
 */
const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (_event, env, _ctx) => {
	console.log("🔄 Starting KV seed job...");
	const db = createDb(env.HYPERDRIVE.connectionString);
	const heroService = new HeroService(db, env.KV);
	const heroes_list = await heroService.getHeroList();

	const ranks = ["overall", "glory"];
	let seeded = 0;
	let failed = 0;

	for (const hero of heroes_list) {
		for (const rank of ranks) {
			try {
				await heroService.seedHeroCache(hero.display_name, rank);
				seeded++;
			} catch (error) {
				console.error(`❌ Failed to seed ${hero.display_name}:${rank}`, error);
				failed++;
			}
		}
	}

	console.log(`✅ KV seed complete: ${seeded} seeded, ${failed} failed`);
};

export default {
	fetch: app.fetch,
	scheduled,
};
