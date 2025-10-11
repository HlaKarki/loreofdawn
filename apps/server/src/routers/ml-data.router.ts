import { publicProcedure, router } from "@/lib/trpc";
import { z } from "zod";
import { mlDbService } from "@/services/ml/ml-db.service";

// this fetches strictly from the db
export const mlData = router({
	consolidated: publicProcedure
		.input(z.object({ hero: z.string(), rank: z.enum(["glory", "overall"]) }))
		.query(async ({ input }) => {
			return await mlDbService.getConsolidatedData(input);
		}),

	heroList: publicProcedure.query(async () => {
		return await mlDbService.getHeroList();
	}),
});
