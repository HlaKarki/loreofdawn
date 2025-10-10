import { z } from "zod";
import { publicProcedure, router } from "@/lib/trpc";
import { HeroNameEnumZ, RankNameEnumZ } from "@/data/ml/hero_ids";

// Router definition - service instantiated per-request in context
export const mlData = router({
	consolidated: publicProcedure
		.input(z.object({ hero: HeroNameEnumZ, rank: RankNameEnumZ }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.mlDbService.getConsolidatedData(input);
		}),
});
