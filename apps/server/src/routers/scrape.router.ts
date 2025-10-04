import { publicProcedure, router } from "@/lib/trpc";
import path from "node:path";
import fs from "node:fs";
import { z } from "zod";
import { wikiScraper } from "@/services/scraper.service";
import { mlService } from "@/services/ml.service";
import { mlRawService } from "@/services/ml_raw.service";
import { HeroNameEnumZ } from "@/data/ml/hero_ids";

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
		const heroes = await mlRawService.fetchAllHeroRecords();
		const ml_hero_ids: Record<string, number> = {};
		for (const hero of heroes.data.records) {
			const n = hero.data.hero.data.name.toLowerCase().replaceAll(" ", "_");
			ml_hero_ids[n] = hero.data.hero.data.heroid;
		}
		return ml_hero_ids;
	}),

	getHeroInfo: publicProcedure
		.input(z.object({ hero: HeroNameEnumZ }))
		.mutation(async ({ input }) => {
			const response = await mlRawService.fetchHeroRecord(input.hero);

			if (response?.data?.records?.length) {
				return response.data.records[0];
			}
			return undefined;
		}),

	getHeroMatchups: publicProcedure
		.input(
			z.object({
				hero: HeroNameEnumZ.optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			const response = await mlRawService.fetchMatchupRecords(input);

			if (response?.data?.records?.length) {
				return response.data.records;
			}
			return undefined;
		}),

	getMetaData: publicProcedure
		.input(
			z.object({
				hero: HeroNameEnumZ.optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			const response = await mlRawService.fetchMetaRecords(input);

			if (response?.data?.records?.length) {
				return response.data.records;
			}

			return undefined;
		}),

	getGraphData: publicProcedure
		.input(
			z.object({
				hero: HeroNameEnumZ.optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			const response = await mlRawService.fetchGraphRecords(input);

			if (response?.data?.records?.length) {
				return response.data.records;
			}

			return undefined;
		}),

	normalizedGraphData: publicProcedure
		.input(
			z.object({
				hero: HeroNameEnumZ.optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlService.getNormalizedGraphSeries(input);
		}),

	normalizedHero: publicProcedure
		.input(
			z.object({
				hero: HeroNameEnumZ,
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlService.getNormalizedHeroProfile(input);
		}),

	normalizedMatchups: publicProcedure
		.input(
			z.object({
				hero: HeroNameEnumZ.optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlService.getNormalizedMatchupSummaries(input);
		}),

	normalizedMetaData: publicProcedure
		.input(
			z.object({
				hero: HeroNameEnumZ.optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlService.getNormalizedMetaSummaries(input);
		}),
});
