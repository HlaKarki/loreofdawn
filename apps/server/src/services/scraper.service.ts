import fs from "node:fs";
import path from "node:path";
import wtf from "wtf_wikipedia";
import TurndownService from "turndown";
import { z } from "zod";
import { hero_page_ids } from "@/data/wiki/page_ids";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

interface WikiHTMLResponse {
	parse: {
		title: string;
		pageid: number;
		text: {
			"*": string;
		};
	};
}

interface WikiResponseComplete {
	batchcomplete: boolean;
	query: {
		pages: {
			pageid: number;
			ns: number;
			title: string;
			revisions: {
				slots: {
					main: {
						contentmodel: string;
						contentformat: string;
						content: string;
					};
				};
			}[];
		}[];
	};
}

export const WikiJSONSchema = z.object({
	title: z.string().optional(),
	categories: z.array(z.string()).optional(),
	sections: z
		.array(
			z
				.object({
					title: z.string().optional(),
					depth: z.number().optional(),
					paragraphs: z
						.array(
							z
								.object({
									sentences: z
										.array(
											z
												.object({
													text: z.string().optional(),
												})
												.optional(),
										)
										.optional(),
								})
								.optional(),
						)
						.optional(),
					infoboxes: z
						.array(
							z
								.object({
									chinese_name: z.object({ text: z.string().optional() }).optional(),
									alias: z.object({ text: z.string().optional() }).optional(),
									born: z
										.object({
											text: z.string().optional(),
											link: z
												.array(
													z
														.object({
															text: z.string().optional(),
															links: z
																.array(
																	z
																		.object({
																			type: z.string().optional(),
																			page: z.string().optional(),
																		})
																		.optional(),
																)
																.optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									species: z.object({ text: z.string().optional() }).optional(),
									gender: z.object({ text: z.string().optional() }).optional(),
									occupation: z.object({ text: z.string().optional() }).optional(),
									affiliation: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									weapons: z.object({ text: z.string().optional() }).optional(),
									abilities: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
															anchor: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									religion: z.object({ text: z.string().optional() }).optional(),
									battles_fought: z.object({ text: z.string().optional() }).optional(),
									relationships: z.object({ text: z.string().optional() }).optional(),
									en_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									in_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									jp_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									ar_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									pt_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									ru_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									tk_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									es_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
									zh_va: z
										.object({
											text: z.string().optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
								})
								.optional(),
						)
						.optional(),
					templates: z
						.array(
							z
								.object({
									base: z.string().optional(),
									"total-pa": z.string().optional(),
									list: z.array(z.string()).optional(),
									template: z.string().optional(),
									"variations-1": z.string().optional(),
									name: z.string().optional(),
									"skill-effect-1": z.string().optional(),
									"skill-effect-2": z.string().optional(),
									"skill-type-1": z.string().optional(),
									description: z.string().optional(),
									"atk-effects": z.string().optional(),
									"lifesteal-ratio": z.string().optional(),
									"spell-vamp-ratio": z.string().optional(),
									"level-scaling": z.string().optional(),
									"stack-scaling": z.string().optional(),
									"term-1": z.string().optional(),
									"term-2": z.string().optional(),
									"term-3": z.string().optional(),
									notes: z.string().optional(),
									cooldown: z.string().optional(),
									"mana-cost": z.string().optional(),
								})
								.optional(),
						)
						.optional(),
					lists: z
						.array(
							z
								.array(
									z
										.object({
											text: z.string().optional(),
											formatting: z
												.object({
													bold: z.array(z.string()).optional(),
													italic: z.array(z.string()).optional(),
												})
												.optional(),
											links: z
												.array(
													z
														.object({
															text: z.string().optional(),
															type: z.string().optional(),
															site: z.string().optional(),
															page: z.string().optional(),
														})
														.optional(),
												)
												.optional(),
										})
										.optional(),
								)
								.optional(),
						)
						.optional(),
				})
				.optional(),
		)
		.optional(),
});
type WikiJSON = z.infer<typeof WikiJSONSchema>;
export type WikiSection = NonNullable<NonNullable<WikiJSON["sections"]>[number]>;

class WikiScraper {
	private readonly jsonDefaultQuery = {
		action: "query",
		titles: "",
		prop: "revisions",
		rvprop: "content",
		rvslots: "*",
		format: "json",
		formatversion: "2",
		origin: "*",
	};

	private readonly excludedSectionTitles = new Set([
		"videos",
		"battle emotes",
		"avatar icons",
		"splash art",
		"gallery",
		"navigation",
		"references",
	]);

	private readonly markdownSystemPrompt =
		"Turn the JSON input into markdown document. Do not embed image links. Format dialogs for characters as quote blocks";

	private buildQuery(titles: string) {
		return { ...this.jsonDefaultQuery, titles };
	}

	private normalizeTitle(rawTitle: string) {
		return rawTitle.trim().replace(/\s+/g, "_");
	}

	private shouldKeepSection(section: WikiSection) {
		const title = section?.title?.toLowerCase() ?? "";
		return title.length === 0 || !this.excludedSectionTitles.has(title);
	}

	private collectSideStoryLinks(sections: WikiSection[]) {
		const links = new Set<string>();
		for (const section of sections) {
			if ((section.title ?? "").toLowerCase() !== "side story") {
				continue;
			}
			for (const template of section.templates ?? []) {
				if (!template?.list) {
					continue;
				}
				for (const entry of template.list) {
					const trimmed = entry?.trim();
					if (trimmed) {
						links.add(trimmed);
					}
				}
			}
		}
		return [...links];
	}

	private async hydrateSideStory(sections: WikiSection[]) {
		const links = this.collectSideStoryLinks(sections);
		if (links.length === 0) {
			return;
		}

		const paragraphs = (
			await Promise.all(
				links.map(async (link) => {
					const normalized = this.normalizeTitle(link);
					const wikiMarkup = await this.fetchWikiMarkup(this.buildQuery(normalized));
					const sentences = wikiMarkup
						.split(".")
						.map((text) => text.trim())
						.filter(Boolean)
						.map((text) => ({ text }));
					return sentences.length ? { sentences } : null;
				}),
			)
		).filter((paragraph): paragraph is { sentences: { text: string }[] } => Boolean(paragraph));

		if (paragraphs.length === 0) {
			return;
		}

		for (const section of sections) {
			if ((section.title ?? "").toLowerCase() === "side story") {
				section.paragraphs = paragraphs;
			}
		}
	}

	private async prepareSections(wikiJson: WikiJSON) {
		const sections = (wikiJson.sections ?? [])
			.filter((section): section is WikiSection => Boolean(section))
			.filter((section) => this.shouldKeepSection(section))
			.map((section) => ({ ...section }));
		await this.hydrateSideStory(sections);
		return sections;
	}

	async scrapeStory(title: string) {
		const response = await fetch(
			`https://mobile-legends.fandom.com/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&origin=*`,
		);
		const data = (await response.json()) as WikiHTMLResponse;
		const idk = data.parse;
		return { parse: idk };
	}

	async fetchWikiMarkup(queryOptions: {
		action: string;
		titles: string;
		prop: string;
		rvprop: string;
		rvslots: string;
		format: string;
		formatversion: string;
		origin: string;
	}) {
		let query = `https://mobile-legends.fandom.com/api.php?`;

		Object.entries(queryOptions).forEach(([key, value]) => {
			query += `&${key}=${encodeURIComponent(value)}`;
		});

		const response = await fetch(query, {
			headers: {
				Accept: "application/json",
				"User-Agent": "LoreOfDawn/1.0 (+https://loreofdawn.com; contact: hla.dev)",
				Referer: "https://loreofdawn.com",
			},
		});
		const raw_data = await response.json();
		const wiki_markup = raw_data as WikiResponseComplete;
		return wiki_markup.query.pages[0].revisions[0].slots.main.content;
	}

	async getMarkdown(title: string) {
		const data = await this.scrapeStory(title);
		const turndown = new TurndownService();
		return turndown.turndown(data.parse.text["*"]);
	}

	async getJSON(titles: string) {
		const query = this.buildQuery(titles);

		const wiki_response = await this.fetchWikiMarkup(query);
		const wtf_response = wtf(wiki_response).json() as WikiJSON;
		return this.prepareSections(wtf_response);
	}

	async getMarkdownFromJSON(titles: string) {
		const json = await this.getJSON(titles);

		const ai_response = await generateText({
			model: openai("gpt-5-mini"),
			system: this.markdownSystemPrompt,
			prompt: `${JSON.stringify(json, null, 2)}`,
		});

		return ai_response.text;
	}

	async batchMarkupWrites() {
		for (const [_key, value] of Object.entries(hero_page_ids)) {
			const title = value.title.replaceAll(" ", "_");
			const query = this.buildQuery(title);
			const wiki_response = await this.fetchWikiMarkup(query);
			const filepath = path.join(
				process.cwd(),
				"src",
				"data",
				"wiki",
				"markups",
				`${title.toLowerCase()}.md`,
			);

			try {
				await fs.promises.writeFile(filepath, wiki_response, "utf-8");
			} catch (error) {
				console.error(`Failed to write markup for ${title}:`, error);
			}
		}
	}

	async batchJsonWrites() {
		const markupDir = path.join(process.cwd(), "src", "data", "wiki", "markups");
		const outputDir = path.join(process.cwd(), "src", "data", "wiki", "jsons");

		await fs.promises.mkdir(outputDir, { recursive: true });
		const files = await fs.promises.readdir(markupDir);

		for (const filename of files) {
			if (!filename.endsWith(".md")) {
				continue;
			}

			const markupPath = path.join(markupDir, filename);
			const fileContents = await fs.promises.readFile(markupPath, "utf-8");
			const wikiJson = wtf(fileContents).json() as WikiJSON;
			const sections = await this.prepareSections(wikiJson);
			const outputPath = path.join(outputDir, `${path.basename(filename, ".md")}.json`);

			await fs.promises.writeFile(outputPath, JSON.stringify(sections, null, 2), "utf-8");
		}
	}

	async batchAiMarkdownWrites() {
		// get all files from src/data/wiki/jsons/{files.json}
		const jsonDir = path.join(process.cwd(), "src", "data", "wiki", "jsons");
		const outputDir = path.join(process.cwd(), "src", "data", "wiki", "markdowns");

		await fs.promises.mkdir(outputDir, { recursive: true });
		const entries = await fs.promises.readdir(jsonDir);
		const files = entries.filter((name) => name.endsWith(".json"));

		const limit = 3;
		const queue = [...files];

		const workers = Array.from({ length: limit }, async () => {
			while (queue.length) {
				const filename = queue.pop();
				if (!filename) break;

				try {
					const jsonPath = path.join(jsonDir, filename);
					const fileContents = await fs.promises.readFile(jsonPath, "utf-8");
					const prompt = JSON.stringify(JSON.parse(fileContents), null, 2);

					// generateText from openai to get the markdown format
					const ai_response = await generateText({
						model: openai("gpt-5-mini"),
						system: this.markdownSystemPrompt,
						prompt,
					});

					// write to file
					const outputPath = path.join(outputDir, `${path.basename(filename, ".json")}.md`);
					await fs.promises.writeFile(outputPath, ai_response.text, "utf-8");
				} catch (error) {
					console.error(`Failed to process ${filename}: `, error);
				}
			}
		});

		await Promise.all(workers);
	}

	async updateHeroMarkdown(title: string) {
		const normalizedTitle = this.normalizeTitle(title);
		const query = this.buildQuery(normalizedTitle);
		const wikiMarkup = await this.fetchWikiMarkup(query);
		const wikiJson = wtf(wikiMarkup).json() as WikiJSON;
		const sections = await this.prepareSections(wikiJson);
		const prompt = JSON.stringify(sections, null, 2);

		const [jsonDir, markdownDir] = [
			path.join(process.cwd(), "src", "data", "wiki", "jsons"),
			path.join(process.cwd(), "src", "data", "wiki", "markdowns"),
		];

		await Promise.all([
			fs.promises.mkdir(jsonDir, { recursive: true }),
			fs.promises.mkdir(markdownDir, { recursive: true }),
		]);

		const ai_response = await generateText({
			model: openai("gpt-5-mini"),
			system: this.markdownSystemPrompt,
			prompt,
		});

		const fileBase = normalizedTitle.toLowerCase();
		await Promise.all([
			fs.promises.writeFile(
				path.join(jsonDir, `${fileBase}.json`),
				JSON.stringify(sections, null, 2),
				"utf-8",
			),
			fs.promises.writeFile(path.join(markdownDir, `${fileBase}.md`), ai_response.text, "utf-8"),
		]);

		return ai_response.text;
	}
}

export const wikiScraper = new WikiScraper();
