import type { HeroNameKey, RankNameKey } from "@/data/ml/hero_ids";
import { db } from "@/db";
import {
	heroGraphDataTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroProfileTable,
} from "@/db/schema/ml.schema";
import type { MlGraphData, MlHeroProfile, MlMatchupSummary, MlMetaSummary } from "@/types/ml.types";
import { and, eq, ilike } from "drizzle-orm";

// all fetches are from db
class MlDbService {
	async getConsolidatedData(opts: { hero: HeroNameKey; rank: RankNameKey }) {
		try {
			const [[profile], [matchup], [meta], [graph]] = await Promise.all([
				await db.select().from(heroProfileTable).where(ilike(heroProfileTable.name, opts.hero)),
				await db
					.select()
					.from(heroMatchupTable)
					.where(
						and(ilike(heroMatchupTable.name, opts.hero), eq(heroMatchupTable.rank, opts.rank)),
					),
				await db
					.select()
					.from(heroMetaDataTable)
					.where(
						and(ilike(heroMetaDataTable.name, opts.hero), eq(heroMetaDataTable.rank, opts.rank)),
					),
				await db
					.select()
					.from(heroGraphDataTable)
					.where(
						and(ilike(heroGraphDataTable.name, opts.hero), eq(heroGraphDataTable.rank, opts.rank)),
					),
			]);
			return {
				...profile,
				...matchup,
				...meta,
				...graph,
			};
		} catch (error) {
			console.error("MlDbService Error: ", error);
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
}

export const mlDbService = new MlDbService();
