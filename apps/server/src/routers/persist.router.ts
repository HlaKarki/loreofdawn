import { z } from "zod";
import { db } from "@/db";
import { publicProcedure, router } from "@/lib/trpc";
import { HeroNameEnumZ } from "@/data/ml/hero_ids";
import { mlService } from "@/services/ml.service";
import { heroMatchupTable, heroProfileTable } from "@/db/schema/ml";

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
				.values({
					...profile,
				})
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
				.values({ ...matchup })
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
					.values({ ...matchup })
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
});
