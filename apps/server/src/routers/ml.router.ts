import { publicProcedure, router } from "@/lib/trpc";
import { z } from "zod";
import { HeroNameEnumZ, RankNameEnumZ } from "@/data/ml/hero_ids";
import { mlDbService } from "@/services/db/ml_db.service";

// this fetches strictly from the db
export const ml = router({
	consolidated: publicProcedure
		.input(z.object({ hero: HeroNameEnumZ, rank: RankNameEnumZ }))
		.mutation(async ({ input }) => {
			return await mlDbService.getConsolidatedData(input);
		}),
});
