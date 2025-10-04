import { z } from "zod";
import { publicProcedure, router } from "@/lib/trpc";
import { HeroNameEnumZ } from "@/data/ml/hero_ids";
import { persistService } from "@/services/persist.service";
import { mlDbService } from "@/services/db/ml_db.service";

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
		const profile = await persistService.getNormalizedHeroProfile(input);
		const [result] = await mlDbService.upsertHeroProfile(profile);
		return result;
	}),

	updateAllHeroProfiles: publicProcedure.mutation(async () => {
		const profiles = await persistService.getNormalizedHeroProfiles();
		const updated = [];
		for (const profile of profiles) {
			const result = await mlDbService.upsertHeroProfile(profile);
			updated.push(result[0].id);
		}
		return { updated };
	}),

	updateHeroMatchup: publicProcedure.input(standardInput).mutation(async ({ input }) => {
		const matchup = (await persistService.getNormalizedMatchupSummaries(input))[0];
		return await mlDbService.upsertHeroMatchup(matchup, input.counter);
	}),

	updateAllHeroMatchups: publicProcedure.input(optionalInput).mutation(async ({ input }) => {
		const matchups = await persistService.getNormalizedMatchupSummaries(input);
		for (const matchup of matchups) {
			await mlDbService.upsertHeroMatchup(matchup, input.counter);
		}
		return { updated: matchups.length };
	}),

	updateHeroMetaData: publicProcedure.input(standardInput).mutation(async ({ input }) => {
		const metadata = (await persistService.getNormalizedMetaSummaries(input))[0];
		return await mlDbService.upsertHeroMetaData(metadata);
	}),

	updateAllHeroMetaData: publicProcedure.input(optionalInput).mutation(async ({ input }) => {
		const metadata = await persistService.getNormalizedMetaSummaries(input);
		for (const meta of metadata) {
			await mlDbService.upsertHeroMetaData(meta);
		}
		return { updated: metadata.length };
	}),

	updateHeroGraphData: publicProcedure.input(standardInput).mutation(async ({ input }) => {
		const graphData = (await persistService.getNormalizedGraphSeries(input))[0];
		return await mlDbService.upsertHeroGraphData(graphData);
	}),

	updateAllHeroGraphData: publicProcedure.input(optionalInput).mutation(async ({ input }) => {
		const graphData = await persistService.getNormalizedGraphSeries(input);
		for (const graph of graphData) {
			await mlDbService.upsertHeroGraphData(graph);
		}
		return { updated: graphData.length };
	}),

	updateDb: publicProcedure.mutation(async () => {
		const ranks = [9, 101] as const;
		const counterOptions = [true, false] as const;

		// Update all hero profiles
		const profiles = await persistService.getNormalizedHeroProfiles();
		for (const profile of profiles) {
			await mlDbService.upsertHeroProfile(profile);
		}

		// Update matchups for all rank + counter combinations
		for (const rank of ranks) {
			for (const counter of counterOptions) {
				const matchups = await persistService.getNormalizedMatchupSummaries({ rank, counter });
				for (const matchup of matchups) {
					await mlDbService.upsertHeroMatchup(matchup, counter);
				}
			}
		}

		// Update metadata for all ranks
		for (const rank of ranks) {
			const metadata = await persistService.getNormalizedMetaSummaries({ rank, counter: true });
			for (const meta of metadata) {
				await mlDbService.upsertHeroMetaData(meta);
			}
		}

		// Update graph data for all ranks
		for (const rank of ranks) {
			const graphData = await persistService.getNormalizedGraphSeries({ rank, counter: true });
			for (const graph of graphData) {
				await mlDbService.upsertHeroGraphData(graph);
			}
		}

		return { success: true, message: "Database updated successfully" };
	}),
});
