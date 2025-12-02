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
import type { WikiTableData } from "@repo/database";

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

	sampleFullWikiData: publicProcedure.query(async () => {
		const pageid = "7897";
		const normalizedName = "badang";
		const query = wikiScraper.buildQueryByPageId(pageid);
		const { timestamp, markup } = await wikiScraper.fetchWikiMarkup(query);
		const json = wtf(markup).json() as WikiJSON;
		const sections = await wikiScraper.prepareSections(json);
		const final_json = JSON.stringify(sections, null, 2);

		const aiResponse = await wikiScraper.getAiMarkdown(final_json);
		const wikiMetadata = wikiScraper.buildFullMetadata(
			aiResponse.partialMetadata,
			aiResponse.sections,
		);
		const fullWikiData: WikiTableData = {
			hero: normalizedName,
			urlName: normalizedName.toLowerCase().replaceAll(" ", "_"),
			sections: aiResponse.sections,
			markdown: aiResponse.markdown,
			metadata: wikiMetadata,
			lastUpdated: timestamp,
		};

		// ** Persist complete WikiTableData to batch_ai directory **
		const batchAiDir = path.join(process.cwd(), "src", "data", "wiki", "batch_ai");
		await fs.promises.mkdir(batchAiDir, { recursive: true });

		const outputPath = path.join(batchAiDir, `${normalizedName}.json`);
		await fs.promises.writeFile(outputPath, JSON.stringify(fullWikiData, null, 2), "utf-8");

		return fullWikiData;
	}),

	batchPersistWikiDataLocal: publicProcedure.query(async () => {
		const startTime = Date.now();

		// Fetch valid pages
		const valid_pages_response = await fetch("http://localhost:1202/trpc/scrape.getWikiValidPages");
		const valid_pages = (await valid_pages_response.json()) as {
			result: { data: { id: number; name: string }[] };
		};
		const pages = valid_pages.result.data;

		// Setup output directory
		const batchAiDir = path.join(process.cwd(), "src", "data", "wiki", "batch_ai");
		await fs.promises.mkdir(batchAiDir, { recursive: true });

		// Check for existing files to support resumability
		const existingFiles = new Set(
			(await fs.promises.readdir(batchAiDir)).map((f) => f.replace(".json", "")),
		);

		// Filter out already processed heroes
		const pendingPages = pages.filter((page) => {
			const urlName = page.name.replaceAll(" ", "_").toLowerCase();
			return !existingFiles.has(urlName);
		});

		console.log(`Total heroes: ${pages.length}`);
		console.log(`Already processed: ${pages.length - pendingPages.length}`);
		console.log(`Remaining: ${pendingPages.length}`);

		if (pendingPages.length === 0) {
			return {
				message: "All heroes already processed!",
				total: pages.length,
				skipped: pages.length,
				processed: 0,
				failed: 0,
			};
		}

		// Results tracking
		const results = {
			success: [] as string[],
			failed: [] as { hero: string; error: string }[],
		};

		// Concurrent processing with worker pool pattern
		const CONCURRENCY_LIMIT = 15;
		const queue = [...pendingPages];
		let completed = 0;

		const workers = Array.from({ length: CONCURRENCY_LIMIT }, async (_, workerId) => {
			while (queue.length > 0) {
				const page = queue.pop();
				if (!page) break;

				const urlName = page.name.replaceAll(" ", "_").toLowerCase();
				const pageid = String(page.id);

				try {
					// Fetch and prepare data
					const query = wikiScraper.buildQueryByPageId(pageid);
					const { timestamp, markup } = await wikiScraper.fetchWikiMarkup(query);
					const json = wtf(markup).json() as WikiJSON;
					const sections = await wikiScraper.prepareSections(json);
					const final_json = JSON.stringify(sections, null, 2);

					// Generate AI content
					const aiResponse = await wikiScraper.getAiMarkdown(final_json);
					const wikiMetadata = wikiScraper.buildFullMetadata(
						aiResponse.partialMetadata,
						aiResponse.sections,
					);

					// Build complete wiki data
					const fullWikiData: WikiTableData = {
						hero: urlName,
						urlName: urlName.toLowerCase().replaceAll(" ", "_"),
						sections: aiResponse.sections,
						markdown: aiResponse.markdown,
						metadata: wikiMetadata,
						lastUpdated: timestamp,
					};

					// Persist to file
					const outputPath = path.join(batchAiDir, `${urlName}.json`);
					await fs.promises.writeFile(outputPath, JSON.stringify(fullWikiData, null, 2), "utf-8");

					results.success.push(urlName);
					completed++;
					console.log(`[Worker ${workerId}] ✓ ${urlName} (${completed}/${pendingPages.length})`);
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					results.failed.push({ hero: urlName, error: errorMessage });
					completed++;
					console.error(
						`[Worker ${workerId}] ✗ ${urlName} failed: ${errorMessage} (${completed}/${pendingPages.length})`,
					);
				}
			}
		});

		// Wait for all workers to complete
		await Promise.all(workers);

		const duration = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log(`\n✅ Batch processing complete in ${duration}s`);
		console.log(`Success: ${results.success.length}`);
		console.log(`Failed: ${results.failed.length}`);

		return {
			total: pages.length,
			skipped: pages.length - pendingPages.length,
			processed: pendingPages.length,
			succeeded: results.success.length,
			failed: results.failed.length,
			duration: `${duration}s`,
			results,
		};
	}),

	/**
	 * Seed wikis table from batch_ai JSON files
	 */
	seedWikisFromBatchAi: publicProcedure.query(async () => {
		const batchAiDir = path.join(process.cwd(), "src", "data", "wiki", "batch_ai");

		// Read all JSON files from batch_ai directory
		const files = await fs.promises.readdir(batchAiDir);
		const jsonFiles = files.filter((file) => file.endsWith(".json"));

		const results = {
			success: [] as string[],
			failed: [] as { hero: string; error: string }[],
		};

		for (const filename of jsonFiles) {
			try {
				const filePath = path.join(batchAiDir, filename);
				const fileContent = await fs.promises.readFile(filePath, "utf-8");
				const wikiData = JSON.parse(fileContent) as WikiTableData;

				// Insert to database using dbService
				await dbService.insertWiki(wikiData);

				results.success.push(wikiData.hero);
			} catch (error) {
				results.failed.push({
					hero: filename.replace(".json", ""),
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		return {
			total: jsonFiles.length,
			succeeded: results.success.length,
			failed: results.failed.length,
			results,
		};
	}),
});
