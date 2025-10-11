import { db } from "@/db";
import {
	heroesListTable,
	heroGraphDataTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroProfileTable,
	type MlGraphData,
	type MlHeroList,
	type MlHeroProfile,
	type MlMatchupSummary,
	type MlMetaSummary,
} from "@repo/database";
import { and, eq, ilike } from "drizzle-orm";

// all fetches are from db
class MlDbService {
	async getConsolidatedData(opts: { hero: string; rank: string }) {
		try {
			const result = await db
				.select()
				.from(heroProfileTable)
				.leftJoin(
					heroMatchupTable,
					and(
						eq(heroProfileTable.name, heroMatchupTable.name),
						eq(heroMatchupTable.rank, opts.rank),
					),
				)
				.leftJoin(
					heroMetaDataTable,
					and(
						eq(heroProfileTable.name, heroMetaDataTable.name),
						eq(heroMetaDataTable.rank, opts.rank),
					),
				)
				.leftJoin(
					heroGraphDataTable,
					and(
						eq(heroProfileTable.name, heroGraphDataTable.name),
						eq(heroGraphDataTable.rank, opts.rank),
					),
				)
				.where(ilike(heroProfileTable.name, opts.hero))
				.limit(1);

			if (!result[0]) return null;

			const { hero_profiles, hero_matchups, hero_metas, hero_graphs } = result[0];

			return {
				...hero_profiles,
				...hero_matchups,
				...hero_metas,
				...hero_graphs,
			};
		} catch (error) {
			console.error("MlDbService JOIN Error: ", error);
			throw error;
		}
	}

	async getHeroList() {
		try {
			const response = await db.select().from(heroesListTable);
			if (!response[0]) return null;
			return response;
		} catch (error) {
			console.error("MlDbService getHeroList Error: ", error);
			throw error;
		}
	}

	async getHeroById(id: number): Promise<MlHeroList> {
		try {
			const [response] = await db
				.select()
				.from(heroesListTable)
				.where(eq(heroesListTable.id, id))
				.limit(1);
			return response;
		} catch (error) {
			console.error("MlDbService getHeroName Error: ", error);
			throw error;
		}
	}

	async getHeroByName(name: string): Promise<MlHeroList> {
		try {
			const [response] = await db
				.select()
				.from(heroesListTable)
				.where(eq(heroesListTable.url_name, name))
				.limit(1);
			return response;
		} catch (error) {
			console.error("MlDbService getHeroName Error: ", error);
			throw error;
		}
	}

	async upsertHeroProfile(profile: MlHeroProfile) {
		return db
			.insert(heroProfileTable)
			.values(profile)
			.onConflictDoUpdate({
				target: heroProfileTable.id,
				set: {
					updatedAt: profile.updatedAt,
					images: profile.images,
					difficulty: profile.difficulty,
					skills: profile.skills,
					lanes: profile.lanes,
					roles: profile.roles,
					speciality: profile.speciality,
					tagline: profile.tagline,
					tale: profile.tale,
					relation: profile.relation,
					source_link: profile.source_link,
				},
			})
			.returning();
	}

	async upsertHeroMatchup(matchup: MlMatchupSummary, isCounter: boolean) {
		return db
			.insert(heroMatchupTable)
			.values(matchup)
			.onConflictDoUpdate({
				target: [heroMatchupTable.id, heroMatchupTable.rank],
				set: {
					updatedAt: matchup.updatedAt,
					most_compatible: isCounter ? undefined : matchup.most_compatible,
					least_compatible: isCounter ? undefined : matchup.least_compatible,
					best_counter: isCounter ? matchup.best_counter : undefined,
					worst_counter: isCounter ? matchup.worst_counter : undefined,
				},
			})
			.returning();
	}

	async upsertHeroMetaData(meta: MlMetaSummary) {
		return db
			.insert(heroMetaDataTable)
			.values(meta)
			.onConflictDoUpdate({
				target: [heroMetaDataTable.id, heroMetaDataTable.rank],
				set: {
					updatedAt: meta.updatedAt,
					pick_rate: meta.pick_rate,
					ban_rate: meta.ban_rate,
					win_rate: meta.win_rate,
				},
			})
			.returning();
	}

	async upsertHeroGraphData(graph: MlGraphData) {
		return db
			.insert(heroGraphDataTable)
			.values(graph)
			.onConflictDoUpdate({
				target: [heroGraphDataTable.id, heroGraphDataTable.rank],
				set: {
					updatedAt: graph.updatedAt,
					trend_start: graph.trend_start,
					trend_end: graph.trend_end,
					points: graph.points,
				},
			})
			.returning();
	}

	async upsertHeroList(list: MlHeroList) {
		return db
			.insert(heroesListTable)
			.values(list)
			.onConflictDoUpdate({
				target: heroesListTable.id,
				set: {
					id: list.id,
					display_name: list.display_name,
					url_name: list.url_name,
					updatedAt: list.updatedAt,
				},
			});
	}
}

export const mlDbService = new MlDbService();
