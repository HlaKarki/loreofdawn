import { z } from "zod";
import { db } from "@/db";
import { publicProcedure, router } from "@/lib/trpc";
import { HeroNameEnumZ } from "@/data/ml/hero_ids";
import { mlService } from "@/services/ml.service";
import {
	heroGraphDataTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroProfileTable,
} from "@/db/schema/ml";

const standardInput = z.object({
	hero: HeroNameEnumZ,
	rank: z
		.enum(["glory", "overall"])
		.default("glory")
		.transform((d) => (d === "glory" ? 9 : 101)),
	counter: z.boolean().default(true),
});
const optionalInput = z.object({
	hero: HeroNameEnumZ.optional(),
	rank: z
		.enum(["glory", "overall"])
		.default("glory")
		.transform((d) => (d === "glory" ? 9 : 101)),
	counter: z.boolean().default(true),
});

export const persist = router({
	updateHeroProfile: publicProcedure.input(standardInput).mutation(async ({ input }) => {
		const profile = await mlService.getNormalizedHeroProfile(input);

		try {
			const response = await db
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
			return response[0];
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
	}),

	updateAllHeroProfiles: publicProcedure.mutation(async () => {
		const profiles = await mlService.getNormalizedHeroProfiles();
		const updated = [];

		try {
			for (const profile of profiles) {
				updated.push(
					await db
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
						.returning({ id: heroProfileTable.id }),
				);
			}
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
		return { updated: updated };
	}),

	updateHeroMatchup: publicProcedure.input(standardInput).mutation(async ({ input }) => {
		try {
			const matchup = (await mlService.getNormalizedMatchupSummaries(input))[0];
			return db
				.insert(heroMatchupTable)
				.values(matchup)
				.onConflictDoUpdate({
					target: [heroMatchupTable.id, heroMatchupTable.rank],
					set: {
						updatedAt: matchup.updatedAt,
						most_compatible: input.counter ? undefined : matchup.most_compatible,
						least_compatible: input.counter ? undefined : matchup.least_compatible,
						best_counter: input.counter ? matchup.best_counter : undefined,
						worst_counter: input.counter ? matchup.worst_counter : undefined,
					},
				})
				.returning();
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
	}),

	updateAllHeroMatchups: publicProcedure.input(optionalInput).mutation(async ({ input }) => {
		try {
			const matchups = await mlService.getNormalizedMatchupSummaries(input);

			for (const matchup of matchups) {
				await db
					.insert(heroMatchupTable)
					.values(matchup)
					.onConflictDoUpdate({
						target: [heroMatchupTable.id, heroMatchupTable.rank],
						set: {
							updatedAt: matchup.updatedAt,
							most_compatible: input.counter ? undefined : matchup.most_compatible,
							least_compatible: input.counter ? undefined : matchup.least_compatible,
							best_counter: input.counter ? matchup.best_counter : undefined,
							worst_counter: input.counter ? matchup.worst_counter : undefined,
						},
					});
			}
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
	}),

	updateHeroMetaData: publicProcedure.input(standardInput).mutation(async ({ input }) => {
		try {
			const metadata = (await mlService.getNormalizedMetaSummaries(input))[0];
			return db
				.insert(heroMetaDataTable)
				.values(metadata)
				.onConflictDoUpdate({
					target: [heroMetaDataTable.id, heroMetaDataTable.rank],
					set: {
						updatedAt: metadata.updatedAt,
						pick_rate: metadata.pick_rate,
						ban_rate: metadata.ban_rate,
						win_rate: metadata.win_rate,
					},
				})
				.returning();
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
	}),

	updateAllHeroMetaData: publicProcedure.input(optionalInput).mutation(async ({ input }) => {
		try {
			const metadata = await mlService.getNormalizedMetaSummaries(input);
			for (const meta of metadata) {
				await db
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
					});
			}
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
	}),

	updateHeroGraphData: publicProcedure.input(standardInput).mutation(async ({ input }) => {
		try {
			const graphData = (await mlService.getNormalizedGraphSeries(input))[0];
			return db
				.insert(heroGraphDataTable)
				.values(graphData)
				.onConflictDoUpdate({
					target: [heroGraphDataTable.id, heroGraphDataTable.rank],
					set: {
						updatedAt: graphData.updatedAt,
						trend_start: graphData.trend_start,
						trend_end: graphData.trend_end,
						points: graphData.points,
					},
				})
				.returning();
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
	}),

	updateAllHeroGraphData: publicProcedure.input(optionalInput).mutation(async ({ input }) => {
		try {
			const graphData = await mlService.getNormalizedGraphSeries(input);
			for (const graph of graphData) {
				await db
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
					});
			}
		} catch (error) {
			console.error("DB Error:", error);
			throw error;
		}
	}),
});
