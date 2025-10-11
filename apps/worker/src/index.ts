import { Hono } from "hono";
import { createDb } from "@/db";
import {
	heroProfileTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroGraphDataTable,
} from "@repo/database";
import { HeroNameKeys } from "@/data/hero_ids";
import { and, eq, ilike } from "drizzle-orm";
import { cacheKvLayer } from "@/layers/cache_kv";
import { registerHeroEndpoints } from "@/endpoints/heroes";

type Bindings = {
	HYPERDRIVE: Hyperdrive;
	KV: KVNamespace;
};

type Env = {
	Bindings: Bindings;
};

export const app = new Hono<Env>();

registerHeroEndpoints(app);

// Health check
app.get("/", (c) => c.json({ status: "ok" }));

// Simple hero data endpoint: GET /hero/:name/:rank
app.get("/heroes/:name/:rank", async (c) => {
	const hero = c.req.param("name");
	const rank = c.req.param("rank");
	const cacheKey = `hero:${hero}:${rank}`;

	try {
		return cacheKvLayer.respond(c, cacheKey, async () => {
			const db = createDb(c.env.HYPERDRIVE.connectionString);

			const result = await db
				.select()
				.from(heroProfileTable)
				.leftJoin(
					heroMatchupTable,
					and(eq(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank)),
				)
				.leftJoin(
					heroMetaDataTable,
					and(eq(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank)),
				)
				.leftJoin(
					heroGraphDataTable,
					and(
						eq(heroProfileTable.name, heroGraphDataTable.name),
						eq(heroGraphDataTable.rank, rank),
					),
				)
				.where(ilike(heroProfileTable.name, hero))
				.limit(1);

			if (!result[0]) {
				return c.json({ error: "Hero not found" }, 404);
			}

			return {
				...result[0].hero_profiles,
				...result[0].hero_matchups,
				...result[0].hero_metas,
				...result[0].hero_graphs,
			};
		});
	} catch (error) {
		console.error("Error:", error);
		return c.json({ error: "Internal error" }, 500);
	}
});

// Cron job: Seed KV with all hero data
const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (_event, env, _ctx) => {
	console.log("🔄 Starting KV seed job...");

	const db = createDb(env.HYPERDRIVE.connectionString);
	const ranks = ["overall", "glory"];
	let seeded = 0;
	let failed = 0;

	for (const hero of HeroNameKeys) {
		for (const rank of ranks) {
			try {
				const result = await db
					.select()
					.from(heroProfileTable)
					.leftJoin(
						heroMatchupTable,
						and(eq(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank)),
					)
					.leftJoin(
						heroMetaDataTable,
						and(
							eq(heroProfileTable.name, heroMetaDataTable.name),
							eq(heroMetaDataTable.rank, rank),
						),
					)
					.leftJoin(
						heroGraphDataTable,
						and(
							eq(heroProfileTable.name, heroGraphDataTable.name),
							eq(heroGraphDataTable.rank, rank),
						),
					)
					.where(ilike(heroProfileTable.name, hero))
					.limit(1);

				if (result[0]) {
					const data = {
						...result[0].hero_profiles,
						...result[0].hero_matchups,
						...result[0].hero_metas,
						...result[0].hero_graphs,
					};

					const cacheKey = `hero:${hero}:${rank}`;
					await env.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 3600 });
					seeded++;
				}
			} catch (error) {
				console.error(`❌ Failed to seed ${hero}:${rank}`, error);
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
