import { Hono } from "hono";
import { HeroService } from "@/services/heroes.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";
import { createDb } from "@/db";
import { heroRolesEnum } from "@repo/database";

export const heroesRouter = new Hono<Env>();

heroesRouter.get("/", async (c) => {
	// /v1/heroes?name=miya
	// /v1/heroes?limit=3&filter.roles=fighter,mage&sort=-win_rate,pick_rate
	// /v1/heroes?include=meta,matchups,graph,full&rank=mythic
	const { name, limit, sort, ["filter.roles"]: rolesParam, rank, include } = c.req.query();

	const roles = rolesParam ? (rolesParam.split(",") as heroRolesEnum[]) : undefined;
	const limitNum = limit ? parseInt(limit, 10) : 10;
	const includeFields = include ? include.split(",") : [];

	const shaKey = await cacheKvLayer.shaCacheKey("heroes:query", undefined, c.req.query);
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	return cacheKvLayer.respond(c, shaKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
		return heroService.queryHeroes({
			name,
			roles,
			limit: limitNum,
			sort,
			rank,
			include: includeFields,
		});
	});
});

/**
 * GET /v1/heroes/list/:name
 * Get the entire data list
 */
heroesRouter.get("/list", async (c) => {
	const cacheKey = `wiki:list:all`;
	const db = createDb(c.env.HYPERDRIVE.connectionString);
	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
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
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
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

	const db = createDb(c.env.HYPERDRIVE.connectionString);

	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
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

	const db = createDb(c.env.HYPERDRIVE.connectionString);

	if (name === "all") {
		const heroService = new HeroService(db, c.env.KV);
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
