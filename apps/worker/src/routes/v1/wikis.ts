import { Hono } from "hono";
import { WikiService } from "@/services/wikis.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";
import { HeroService } from "@/services/heroes.service";
import { createDb } from "@/db";

export const wikisRouter = new Hono<Env>();

/**
 * GET /v1/wikis
 * List all wikis with metadata
 */
wikisRouter.get("/", async (c) => {
	const cacheKey = "wikis:all";

	return cacheKvLayer.respond(
		c,
		cacheKey,
		async () => {
			const wikiService = new WikiService(c.env);
			return await wikiService.getAllWikis();
		},
		{
			ttlSeconds: 60 * 60 * 6, // 2 hours
		},
	);
});

/**
 * GET /v1/wikis/:name
 * Get wiki content for a hero
 */
wikisRouter.get("/:name", async (c) => {
	const name = c.req.param("name")?.trim().toLowerCase();

	if (!name) {
		return c.json({ error: "Hero name is required" }, 400);
	}

	const cacheKey = `wiki:${name}`;

	return cacheKvLayer.respond(
		c,
		cacheKey,
		async () => {
			const wikiService = new WikiService(c.env);
			return await wikiService.getHeroWiki(name);
		},
		{
			ttlSeconds: 60 * 60 * 24,
		},
	);
});

wikisRouter.delete("/:name", async (c) => {
	const name = c.req.param("name")?.trim().toLowerCase();

	if (!name) {
		return c.json({ error: "Hero name is required" }, 400);
	}

	const db = createDb(c.env.HYPERDRIVE.connectionString);

	if (name === "all") {
		const heroService = new HeroService(db, c.env.KV);
		const heroes = await heroService.getHeroList();

		for (const hero of heroes) {
			console.log(`deleting cache for ${hero.display_name}`);
			const cacheKey = `wiki:${hero.display_name.toLowerCase()}`;
			await cacheKvLayer.delete(cacheKey, c);
		}
	} else {
		const cacheKey = `wiki:${name}`;
		await cacheKvLayer.delete(cacheKey, c);
	}

	return c.json({ success: true, message: `Cache deleted for ${name}` });
});
