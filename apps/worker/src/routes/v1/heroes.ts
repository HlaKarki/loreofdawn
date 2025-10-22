import { Hono } from "hono";
import { HeroService } from "@/services/heroes.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";

export const heroesRouter = new Hono<Env>();

/**
 * GET /v1/heroes/list/:name
 * Get the entire data list
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
 * Get all assets (images, icons, skills) related to a data from database
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
 * Get consolidated data profile with matchups, meta, and graph data (LEFT JOIN)
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

/**
 * DELETE /v1/heroes/:name
 * Delete cache for a hero (all ranks) or all heroes
 */
heroesRouter.delete("/:name", async (c) => {
	const name = c.req.param("name")?.trim().toLowerCase();

	if (!name) {
		return c.json({ error: "Hero name is required" }, 400);
	}

	const ranks = ["overall", "mythic"];

	if (name === "all") {
		const heroService = new HeroService(c.env);
		const heroes = await heroService.getHeroList();

		for (const hero of heroes) {
			console.log(`deleting cache for ${hero.display_name}`);
			const heroName = hero.display_name.toLowerCase();

			// Delete all rank caches for this hero
			for (const rank of ranks) {
				await cacheKvLayer.delete(`hero:${heroName}:${rank}`, c);
			}

			// Delete assets cache
			await cacheKvLayer.delete(`hero:assets:${heroName}`, c);
		}

		// Delete hero list cache
		await cacheKvLayer.delete("wiki:list:all", c);
	} else {
		// Delete all rank caches for specific hero
		for (const rank of ranks) {
			await cacheKvLayer.delete(`hero:${name}:${rank}`, c);
		}

		// Delete assets cache
		await cacheKvLayer.delete(`hero:assets:${name}`, c);
	}

	return c.json({ success: true, message: `Cache deleted for ${name}` });
});
