import { Hono } from "hono";
import { HeroService } from "@/services/heroes.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";
import { createDb } from "@/db";
import { heroRolesEnum } from "@repo/database";

const cv = "v1.0.1";

export const heroesRouter = new Hono<Env>();

heroesRouter.get("/", async (c) => {
	// /v1/heroes?name=miya
	// /v1/heroes?limit=3&filter.roles=fighter,mage&sort=-pick_rate,win_rate&include=meta
	// /v1/heroes?sort=-win_rate&rank=mythic&include=full
	const queryParams = c.req.query();
	const {
		name,
		limit,
		sort,
		["filter.roles"]: rolesParam,
		["filter.min_ban_rate"]: minBanRate,
		["filter.min_win_rate"]: minWinRate,
		["filter.min_pick_rate"]: minPickRate,
		["filter.max_ban_rate"]: maxBanRate,
		["filter.max_win_rate"]: maxWinRate,
		["filter.max_pick_rate"]: maxPickRate,
		rank,
		include,
	} = queryParams;

	const roles = rolesParam ? (rolesParam.split(",") as heroRolesEnum[]) : undefined;
	const limitNum = limit ? parseInt(limit, 10) : 10;
	const includeFields = include ? include.split(",") : [];

	const shaKey = await cacheKvLayer.shaCacheKey("heroes:query:v1", undefined, queryParams);
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	return cacheKvLayer.respond(c, shaKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
		return heroService.queryHeroes({
			name,
			roles,
			limit: limitNum,
			sort,
			rank: rank ?? "overall",
			include: includeFields,
			minBanRate: minBanRate ? parseFloat(minBanRate) : undefined,
			minWinRate: minWinRate ? parseFloat(minWinRate) : undefined,
			minPickRate: minPickRate ? parseFloat(minPickRate) : undefined,
			maxBanRate: maxBanRate ? parseFloat(maxBanRate) : undefined,
			maxWinRate: maxWinRate ? parseFloat(maxWinRate) : undefined,
			maxPickRate: maxPickRate ? parseFloat(maxPickRate) : undefined,
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
 * GET /v1/heroes/meta?name
 */
heroesRouter.get("/meta", async (c) => {
	const { name: n, rank: r } = c.req.query();
	const [name, rank] = [n.toLowerCase(), r.toLowerCase()]; // TODO: validate rank type

	const cacheKey = `${cv}:heroes:meta:${name}`;
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	const data = await cacheKvLayer.tryFetch(
		c,
		cacheKey,
		async () => {
			const heroService = new HeroService(db, c.env.KV);
			return await heroService.getMetaProfile(name, rank);
		},
		{ ttlSeconds: 60 * 15 },
	);

	return c.json(data);
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

heroesRouter.get("/stats_by_role", async (c) => {
	const { rank } = c.req.query();
	const resolvedRank = rank ?? "overall";
	const cacheKey = `heroes:stats_by_role:${resolvedRank}`;
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	const payload = await cacheKvLayer.tryFetch(c, cacheKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
		return await heroService.getStatsByRoles(resolvedRank);
	});

	return c.json(payload);
});

heroesRouter.get("/quadrant_data", async (c) => {
	const { rank } = c.req.query();

	const db = createDb(c.env.HYPERDRIVE.connectionString);
	const heroService = new HeroService(db, c.env.KV);
	const payload = await heroService.getQuadrantData(rank);

	return c.json(payload);
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

heroesRouter.get("/table", async (c) => {
	const { rank } = c.req.query();
	const cacheKey = `${cv}:heroes:table:${rank.toLowerCase()}`;

	const db = createDb(c.env.HYPERDRIVE.connectionString);
	const payload = await cacheKvLayer.tryFetch(
		c,
		cacheKey,
		async () => {
			const heroService = new HeroService(db, c.env.KV);
			return await heroService.getTableData(rank);
		},
		{ ttlSeconds: 60 * 30 },
	);

	return c.json(payload);
});
