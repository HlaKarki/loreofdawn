import { Hono } from "hono";
import { WikiService } from "@/services/wikis.service";
import { cacheKvLayer } from "@/middleware/cache";
import type { Env } from "@/types";

export const wikisRouter = new Hono<Env>();

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
