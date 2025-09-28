import { z } from "zod";
import { publicProcedure, router } from "@/lib/trpc";
import { hero_page_ids } from "@/data/wiki/page_ids";
import { dbService } from "@/services/db.service";

export const dbRouter = router({
	uploadMarkdown: publicProcedure
		.input(z.object({ hero: z.string().min(1) }))
		.mutation(async ({ input }) => {
			return await dbService.uploadMarkdown(input.hero);
		}),

	seedWikisTable: publicProcedure.query(async () => {
		const filenames = Object.entries(hero_page_ids).map(([_key, value]) => {
			if (!value.title.includes("/")) {
				return value.title.replaceAll(" ", "_").toLocaleLowerCase();
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
