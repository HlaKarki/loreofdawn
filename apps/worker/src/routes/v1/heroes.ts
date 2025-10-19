import { Hono } from "hono";
import { HeroService } from "@/services/heroes.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";

export const heroesRouter = new Hono<Env>();

/**
 * GET /v1/heroes/list/:name
 * Get the entire hero list
 */
heroesRouter.get("/list", async (c) => {
	const cacheKey = `wiki:list:all`;

	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(c.env);
		return heroService.getHeroList();
	});
});

/**
 * GET /v1/heroes/assets/:name
 * Get all assets (images, icons, skills) related to a hero from database
 */
heroesRouter.get("/assets/:name", async (c) => {
	const name = c.req.param("name");
	const cacheKey = `hero:assets:${name}`;

	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(c.env);
		return heroService.getHeroAssets(name);
	});
});

/**
 * GET /v1/heroes/:name/:rank
 * Get consolidated hero profile with matchups, meta, and graph data (LEFT JOIN)
 */
heroesRouter.get("/:name/:rank", async (c) => {
	const name = c.req.param("name");
	const rank = c.req.param("rank");
	const cacheKey = `hero:${name}:${rank}`;

	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(c.env);
		return await heroService.getHeroProfile(name, rank);
	});
});
