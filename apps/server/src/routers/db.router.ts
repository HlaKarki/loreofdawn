import { z } from "zod";
import { publicProcedure, router } from "@/lib/trpc";
import { dbService } from "@/services/db/db.service";
import { mlDbService } from "@/services/ml/ml-db.service";

export const dbRouter = router({
	uploadMarkdown: publicProcedure
		.input(z.object({ hero: z.string().min(1) }))
		.mutation(async ({ input }) => {
			return await dbService.uploadMarkdown(input.hero);
		}),

	seedWikisTable: publicProcedure.query(async () => {
		const list = await mlDbService.getHeroList();
		if (!list) return "failed";

		const filenames = Object.entries(list).map(([_key, value]) => {
			if (!value.url_name.includes("/")) {
				return value.url_name.replaceAll(" ", "_").toLocaleLowerCase();
			}
		});

		for (const filename of filenames) {
			if (filename) {
				await dbService.uploadMarkdown(filename);
			}
		}

		return "success";
	}),

	fetchMarkdown: publicProcedure
		.input(z.object({ hero: z.string().min(1) }))
		.query(async ({ input }) => {
			return dbService.fetchMarkdown(input.hero);
		}),
});
