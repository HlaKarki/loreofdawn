import { Hono } from "hono";
import { HeroService } from "@/services/heroes.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";
import { createDb } from "@/db";
import { heroRolesEnum } from "@repo/database";
import { requireSyncToken } from "@/middleware/syncToken";

const cv = "v1.0.1";

export const heroesRouter = new Hono<Env>();

heroesRouter.get("/", async (c) => {
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

heroesRouter.get("/list", async (c) => {
	const cacheKey = `wiki:list:all`;
	const db = createDb(c.env.HYPERDRIVE.connectionString);
	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
		return heroService.getHeroList();
	});
});

heroesRouter.get("/meta", async (c) => {
	const { name: n, rank: r } = c.req.query();
	const [name, rank] = [n.toLowerCase(), r.toLowerCase()];

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

heroesRouter.get("/assets/:name", async (c) => {
	const name = c.req.param("name");
	const cacheKey = `hero:assets:${name}`;
	const db = createDb(c.env.HYPERDRIVE.connectionString);

	return cacheKvLayer.respond(c, cacheKey, async () => {
		const heroService = new HeroService(db, c.env.KV);
		return heroService.getHeroAssets(name);
	});
});

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

heroesRouter.delete("/:name", requireSyncToken, async (c) => {
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

			for (const rank of ranks) {
				await cacheKvLayer.delete(`hero:${heroName}:${rank}`, c);
			}

			await cacheKvLayer.delete(`hero:assets:${heroName}`, c);
		}

		await cacheKvLayer.delete("wiki:list:all", c);
	} else {
		for (const rank of ranks) {
			await cacheKvLayer.delete(`hero:${name}:${rank}`, c);
		}

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
