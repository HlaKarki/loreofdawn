import { publicProcedure, router } from "@/lib/trpc";
import path from "node:path";
import fs from "node:fs";
import { z } from "zod";
import { wikiScraper } from "@/services/scraper.service";
import { mlApiService } from "@/services/ml/ml-api.service";
import { mlTransformService } from "@/services/ml/ml-transform.service";
import { mlDbService } from "@/services/ml/ml-db.service";
import { dbService } from "@/services/db/db.service";
import wtf from "wtf_wikipedia";
import type { WikiJSON } from "@/types/scraper.types";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export const scrape = router({
	getWikiValidPages: publicProcedure.query(async () => {
		const db_heroes = await dbService.fetchHeroList();
		const wiki_data = await wikiScraper.getHeroPages();

		const db_names = db_heroes.map((hero) => hero.display_name.toLowerCase());
		const set = new Set(db_names);

		let valid_pages: { id: number; name: string }[] = [];

		for (const wiki_pages of wiki_data) {
			const normalized = wiki_pages.title.toLowerCase();
			if (set.has(normalized)) {
				valid_pages.push({ id: wiki_pages.pageid, name: wiki_pages.title });
			}
		}

		return valid_pages;
	}),

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

	makeAiMarkdown: publicProcedure.query(async () => {
		// const valid_pages_response = await fetch("http://localhost:1202/trpc/scrape.getWikiValidPages");
		// const valid_pages = (await valid_pages_response.json()) as {
		// 	result: { data: { id: number; name: string }[] };
		// };
		// const pageids = valid_pages.result.data;
		// const normalizedName = pageids[10].name.replaceAll(" ", "_").toLowerCase();
		// const randomPageid = String(pageids[10].id);
		//
		const pageid = "7897";
		const normalizedName = "badang";
		const query = wikiScraper.buildQueryByPageId(pageid);
		const markup = await wikiScraper.fetchWikiMarkup(query);
		const json = wtf(markup).json() as WikiJSON;
		const sections = await wikiScraper.prepareSections(json);
		const final_json = JSON.stringify(sections, null, 2);

		const aiResponse = await wikiScraper.getAiMarkdown(final_json);

		const [jsonDir, markdownDir] = [
			path.join(process.cwd(), "src", "data", "wiki", "jsons"),
			path.join(process.cwd(), "src", "data", "wiki", "markdowns"),
		];

		await Promise.all([
			fs.promises.writeFile(
				path.join(jsonDir, `${normalizedName}.json`),
				JSON.stringify(sections, null, 2),
				"utf-8",
			),
			fs.promises.writeFile(
				path.join(markdownDir, `${normalizedName}.md`),
				aiResponse.markdown,
				"utf-8",
			),
		]);

		return aiResponse;
	}),

	testZodSchemaOpenAi: publicProcedure.query(async () => {
		const object_response = await generateObject({
			model: openai("gpt-5-mini"),
			schema: z.object({
				mood: z.string().min(1).describe("tell your random moood at this moment"),
				true: z.boolean().describe("This is a required field answer with true or false"),
			}),
			messages: [
				{ role: "system", content: "Respond by adhereing to the schema" },
				{ role: "user", content: "hi" },
			],
		});

		return object_response.object;
	}),

	updateHeroMarkdown: publicProcedure
		.input(z.object({ hero: z.string().default("Miya") }))
		.mutation(async ({ input }) => {
			return await wikiScraper.updateHeroMarkdown(input.hero);
		}),

	getAllHeroInfo: publicProcedure.query(async () => {
		const heroes = await mlApiService.fetchAllHeroRecords();
		const ml_hero_ids: Record<string, number> = {};
		for (const hero of heroes.data.records) {
			const n = hero.data.hero.data.name.toLowerCase().replaceAll(" ", "_");
			ml_hero_ids[n] = hero.data.hero.data.heroid;
		}
		return ml_hero_ids;
	}),

	getHeroInfo: publicProcedure.input(z.object({ hero: z.string() })).mutation(async ({ input }) => {
		const hero_db = await mlDbService.getHeroByName(input.hero);

		const response = await mlApiService.fetchHeroRecord(hero_db.id);

		if (response?.data?.records?.length) {
			return response.data.records[0];
		}
		return undefined;
	}),

	getHeroMatchups: publicProcedure
		.input(
			z.object({
				hero: z.string().optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			const response = await mlApiService.fetchMatchupRecords(input);

			if (response?.data?.records?.length) {
				return response.data.records;
			}
			return undefined;
		}),

	getMetaData: publicProcedure
		.input(
			z.object({
				hero: z.string().optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			const response = await mlApiService.fetchMetaRecords(input);

			if (response?.data?.records?.length) {
				return response.data.records;
			}

			return undefined;
		}),

	getGraphData: publicProcedure
		.input(
			z.object({
				hero: z.string().optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			let hero_db;
			if (input.hero) {
				hero_db = await mlDbService.getHeroByName(input.hero);
			}
			const response = await mlApiService.fetchGraphRecords({
				hero_id: hero_db?.id,
				counter: input.counter,
				rank: input.rank,
			});

			if (response?.data?.records?.length) {
				return response.data.records;
			}

			return undefined;
		}),

	normalizedGraphData: publicProcedure
		.input(
			z.object({
				hero: z.string().optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlTransformService.getNormalizedGraphSeries(input);
		}),

	normalizedHero: publicProcedure
		.input(
			z.object({
				hero: z.string(),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlTransformService.getNormalizedHeroProfile(input);
		}),

	normalizedMatchups: publicProcedure
		.input(
			z.object({
				hero: z.string().optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlTransformService.getNormalizedMatchupSummaries(input);
		}),

	normalizedMetaData: publicProcedure
		.input(
			z.object({
				hero: z.string().optional(),
				counter: z.boolean().default(true),
				rank: z
					.enum(["glory", "overall"])
					.default("glory")
					.transform((val) => (val === "glory" ? 9 : 101)),
			}),
		)
		.mutation(async ({ input }) => {
			return await mlTransformService.getNormalizedMetaSummaries(input);
		}),

	normalizedHeroList: publicProcedure.query(async () => {
		return await mlTransformService.getNormalizedHeroList();
	}),
});
