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
