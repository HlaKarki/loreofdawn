import { publicProcedure, router } from "@/lib/trpc";
import path from "node:path";
import fs from "node:fs";
import { z } from "zod";
import { wikiScraper } from "@/services/scraper.service";
import { heroIdKeys, type HeroIdKey } from "@/data/ml/hero_ids";

const heroKeyEnum = z.enum(heroIdKeys as [HeroIdKey, ...HeroIdKey[]]);

export const scrape = router({
	heroStory: publicProcedure
		.input(z.object({ title: z.string().default("Miya") }))
		.mutation(async ({ input }) => {
			return await wikiScraper.scrapeStory(input.title);
		}),

	getMarkdown: publicProcedure
		.input(z.object({ title: z.string().default("Miya") }))
		.mutation(async ({ input }) => {
			return await wikiScraper.getMarkdown(input.title);
		}),

	getJSON: publicProcedure
		.input(z.object({ hero: z.string().default("Miya") }))
		.mutation(async ({ input }) => {
			return await wikiScraper.getJSON(input.hero);
		}),

	getMdFromJSON: publicProcedure
		.input(z.object({ hero: z.string().default("Miya") }))
		.mutation(async ({ input }) => {
			const markdown_string = await wikiScraper.getMarkdownFromJSON(input.hero);
			const filepath = path.join(process.cwd(), "src", "data", "temp.md");

			fs.writeFile(filepath, markdown_string, "utf8", function (err) {
				if (err) throw err;
			});
		}),

	batchMarkupWrites: publicProcedure.query(async () => {
		return await wikiScraper.batchMarkupWrites();
	}),

	batchJsonWrites: publicProcedure.query(async () => {
		return await wikiScraper.batchJsonWrites();
	}),

	batchAiMarkdownWrites: publicProcedure.query(async () => {
		return await wikiScraper.batchAiMarkdownWrites();
	}),

	updateHeroMarkdown: publicProcedure
		.input(z.object({ hero: z.string().default("Miya") }))
		.mutation(async ({ input }) => {
			return await wikiScraper.updateHeroMarkdown(input.hero);
		}),

	getAllHeroInfo: publicProcedure.query(async () => {
		const heroes = await wikiScraper.getAllHeroInfo();
		const ml_hero_ids: Record<string, number> = {};
		for (const hero of heroes.data.records) {
			const n = hero.data.hero.data.name.toLowerCase().replaceAll(" ", "_");
			ml_hero_ids[n] = hero.data.hero.data.heroid;
		}
		return ml_hero_ids;
	}),

	getHeroInfo: publicProcedure
		.input(z.object({ hero: heroKeyEnum }))
		.mutation(async ({ input }) => {
			const response = await wikiScraper.getHeroInfo(input.hero);

			if (response?.data?.records?.length) {
				return response.data.records[0];
			}
			return undefined;
		}),
});
