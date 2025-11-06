import {
	heroProfileTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroGraphDataTable,
	heroesListTable,
	HeroAssets,
} from "@repo/database";
import { and, eq, ilike } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Bindings } from "@/types";

export class HeroService {
	private db: PostgresJsDatabase;
	private KV: Bindings["KV"];

	constructor(db: PostgresJsDatabase, KV: Bindings["KV"]) {
		this.db = db;
		this.KV = KV;
	}

	/**
	 * Get all heroes for seeding purposes
	 */
	async getHeroList() {
		const heroes = await this.db.select().from(heroesListTable);

		if (!heroes) {
			throw new Error("Could not fetch data list from the database");
		}

		return heroes;
	}

	/**
	 * Get comprehensive list of heroes with their roles, lanes, and specialities
	 * Returns a formatted string that helps AI understand hero classifications
	 * e.g. "Miya (marksman, gold lane, damage/push), Fanny (assassin, jungle, burst/mobility)"
	 */
	async getHeroListForAi(): Promise<string> {
		const heroes = await this.db
			.select({
				name: heroProfileTable.name,
				roles: heroProfileTable.roles,
				lanes: heroProfileTable.lanes,
				speciality: heroProfileTable.speciality,
			})
			.from(heroProfileTable);

		// Format: "HeroName (role1/role2, lane1/lane2, speciality1/speciality2)"
		const formatted = heroes.map((hero) => {
			const roles = (hero.roles as any[])?.map((r) => r.title?.toLowerCase()).filter(Boolean) || [];
			const lanes = (hero.lanes as any[])?.map((l) => l.title?.toLowerCase()).filter(Boolean) || [];
			const specs = (hero.speciality as string[])?.filter(Boolean) || [];

			const parts = [
				roles.length > 0 ? roles.join("/") : null,
				lanes.length > 0 ? lanes.join("/") : null,
				specs.length > 0 ? specs.join("/") : null,
			].filter(Boolean);

			return `${hero.name} (${parts.join(", ")})`;
		});

		return formatted.join(", ");
	}

	/**
	 * Get consolidated data profile with matchups, meta, and graph data (LEFT JOIN version)
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
			profile: result[0].hero_profiles,
			matchups: result[0].hero_matchups,
			meta: result[0].hero_metas,
			graph: result[0].hero_graphs,
		};
	}

	/**
	 * Seed KV cache with data data for a specific data and rank
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
			await this.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 3600 });
		}
	}

	/**
	 * Get all assets related to a data
	 */
	async getHeroAssets(name: string): Promise<{ images: HeroAssets }> {
		const [assets] = await this.db
			.select({
				images: heroProfileTable.images,
			})
			.from(heroProfileTable)
			.where(ilike(heroProfileTable.name, name))
			.limit(1);
		return assets;
	}
}
