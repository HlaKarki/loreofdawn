import { Hono } from "hono";
import { createDb } from "@/db";
import { heroProfileTable, heroMatchupTable, heroMetaDataTable, heroGraphDataTable } from "@/db/schema/ml.schema";
import { and, eq, ilike } from "drizzle-orm";
import { HeroNameKeys } from "@/data/ml/hero_ids";

type Bindings = {
	HYPERDRIVE: Hyperdrive;
	KV: KVNamespace;
};

type Env = {
	Bindings: Bindings;
};

const app = new Hono<Env>();

// Health check
app.get("/", (c) => c.json({ status: "ok" }));

// Simple hero data endpoint: GET /hero/:name/:rank
app.get("/hero/:name/:rank", async (c) => {
	const hero = c.req.param("name");
	const rank = c.req.param("rank");
	const cacheKey = `hero:${hero}:${rank}`;

	try {
		// 1. Check Cache API (5 min TTL)
		const cache = await caches.open("api-cache");
		const cacheUrl = `https://cache.loreofdawn.com/${cacheKey}`;
		const cached = await cache.match(cacheUrl);

		if (cached) {
			console.log("✓ Cache hit");
			return cached;
		}

		// 2. Check KV (60 min TTL)
		const kvData = await c.env.KV.get(cacheKey, "json");
		if (kvData) {
			console.log("✓ KV hit");
			const response = c.json(kvData);

			// Backfill Cache API
			const headers = new Headers(response.headers);
			headers.set("Cache-Control", "public, max-age=300");
			const cachedResponse = new Response(JSON.stringify(kvData), { headers });
			await cache.put(cacheUrl, cachedResponse);

			return response;
		}

		// 3. Query DB via Hyperdrive
		console.log("✓ DB query");
		const db = createDb(c.env.HYPERDRIVE.connectionString);

		const result = await db
			.select()
			.from(heroProfileTable)
			.leftJoin(
				heroMatchupTable,
				and(eq(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank))
			)
			.leftJoin(
				heroMetaDataTable,
				and(eq(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank))
			)
			.leftJoin(
				heroGraphDataTable,
				and(eq(heroProfileTable.name, heroGraphDataTable.name), eq(heroGraphDataTable.rank, rank))
			)
			.where(ilike(heroProfileTable.name, hero))
			.limit(1);

		if (!result[0]) {
			return c.json({ error: "Hero not found" }, 404);
		}

		const data = {
			...result[0].hero_profiles,
			...result[0].hero_matchups,
			...result[0].hero_metas,
			...result[0].hero_graphs,
		};

		// 4. Backfill KV
		await c.env.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 3600 });

		// 5. Return and cache in Cache API
		const response = c.json(data);
		const headers = new Headers(response.headers);
		headers.set("Cache-Control", "public, max-age=300");
		const cachedResponse = new Response(JSON.stringify(data), { headers });
		await cache.put(cacheUrl, cachedResponse);

		return response;
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
						and(eq(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank))
					)
					.leftJoin(
						heroMetaDataTable,
						and(eq(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank))
					)
					.leftJoin(
						heroGraphDataTable,
						and(eq(heroProfileTable.name, heroGraphDataTable.name), eq(heroGraphDataTable.rank, rank))
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