import { createDb } from "@/db";
import {
	heroProfileTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroGraphDataTable,
	heroesListTable,
} from "@repo/database";
import { and, eq, ilike } from "drizzle-orm";
import type { Bindings } from "@/types";

export class HeroService {
	private db: ReturnType<typeof createDb>;

	constructor(private env: Bindings) {
		this.db = createDb(this.env.HYPERDRIVE.connectionString);
	}

	/**
	 * Get hero list - either all heroes or a single hero by url_name
	 */
	async getHeroList(query: string) {
		const [hero] = await this.db
			.select()
			.from(heroesListTable)
			.where(eq(heroesListTable.url_name, query))
			.limit(1);

		if (!hero) {
			throw new Error("Hero not found");
		}

		return hero;
	}

	/**
	 * Get consolidated hero profile with matchups, meta, and graph data (LEFT JOIN version)
	 */
	async getHeroProfile(name: string, rank: string) {
		const normalizedName = name.trim().toLowerCase().replaceAll("_", " ");

		const result = await this.db
			.select()
			.from(heroProfileTable)
			.leftJoin(
				heroMatchupTable,
				and(ilike(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank)),
			)
			.leftJoin(
				heroMetaDataTable,
				and(ilike(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank)),
			)
			.leftJoin(
				heroGraphDataTable,
				and(
					ilike(heroProfileTable.name, heroGraphDataTable.name),
					ilike(heroGraphDataTable.rank, rank),
				),
			)
			.where(ilike(heroProfileTable.name, normalizedName))
			.limit(1);

		if (!result[0]) {
			throw new Error("Hero not found");
		}

		return {
			...result[0].hero_profiles,
			...result[0].hero_matchups,
			...result[0].hero_metas,
			...result[0].hero_graphs,
		};
	}

	/**
	 * Seed KV cache with hero data for a specific hero and rank
	 */
	async seedHeroCache(heroName: string, rank: string): Promise<void> {
		const normalizedName = heroName.trim().toLowerCase().replaceAll("_", " ");

		const result = await this.db
			.select()
			.from(heroProfileTable)
			.leftJoin(
				heroMatchupTable,
				and(ilike(heroProfileTable.name, heroMatchupTable.name), eq(heroMatchupTable.rank, rank)),
			)
			.leftJoin(
				heroMetaDataTable,
				and(ilike(heroProfileTable.name, heroMetaDataTable.name), eq(heroMetaDataTable.rank, rank)),
			)
			.leftJoin(
				heroGraphDataTable,
				and(
					ilike(heroProfileTable.name, heroGraphDataTable.name),
					ilike(heroGraphDataTable.rank, rank),
				),
			)
			.where(ilike(heroProfileTable.name, normalizedName))
			.limit(1);

		if (result[0]) {
			const data = {
				...result[0].hero_profiles,
				...result[0].hero_matchups,
				...result[0].hero_metas,
				...result[0].hero_graphs,
			};

			const cacheKey = `hero:${heroName}:${rank}`;
			await this.env.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 3600 });
		}
	}

	/**
	 * Get all heroes for seeding purposes
	 */
	async getAllHeroes() {
		return this.db.select().from(heroesListTable);
	}
}
