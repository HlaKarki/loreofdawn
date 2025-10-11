import { cacheKvLayer } from "@/layers/cache_kv";
import { createDb } from "@/db";
import { heroesListTable } from "@repo/database";
import { eq } from "drizzle-orm";
import type { Hono } from "hono";

type WorkerBindings = {
	HYPERDRIVE: Hyperdrive;
	KV: KVNamespace;
};

type WorkerEnv = {
	Bindings: WorkerBindings;
};

export function registerHeroEndpoints(app: Hono<WorkerEnv>) {
	app.get("/heroes/list/:name", async (c) => {
		const query = c.req.param("name")?.trim().toLowerCase();
		if (!query) {
			return c.json({ error: "Hero name is required" }, 400);
		}

		const cacheKey = `hero:list:${query}`;
		try {
			return cacheKvLayer.respond(c, cacheKey, async () => {
				const db = createDb(c.env.HYPERDRIVE.connectionString);
				let response;
				if (query === "all") {
					response = await db.select().from(heroesListTable);
				} else {
					const [single] = await db
						.select()
						.from(heroesListTable)
						.where(eq(heroesListTable.url_name, query))
						.limit(1);
					response = single;
				}

				if (!response) {
					return c.json({ error: "Hero not found" }, 404);
				}

				return response;
			});
		} catch (error) {
			console.error("Error at /data/:name: ", error);
			return c.json({ error: "Internal error" }, 500);
		}
	});
}
