import { Hono } from "hono";
import { HeroService } from "@/services/heroes.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";

export const heroesRouter = new Hono<Env>();

/**
 * GET /v1/heroes/list/:name
 * Get hero list - either all heroes or a single hero by url_name
 */
heroesRouter.get("/list/:name", async (c) => {
	const name = c.req.param("name")?.trim().toLowerCase();

	if (!name) {
		return c.json({ error: "Hero name is required" }, 400);
	}

	const cacheKey = `hero:list:${name}`;

	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(c.env);
		return await heroService.getHeroList(name);
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
