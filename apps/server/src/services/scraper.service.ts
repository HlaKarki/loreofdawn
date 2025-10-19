import fs from "node:fs";
import path from "node:path";
import wtf from "wtf_wikipedia";
import TurndownService from "turndown";
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, jsonSchema } from "ai";
import type {
	WikiHTMLResponse,
	WikiJSON,
	WikiResponseComplete,
	WikiSection,
} from "@/types/scraper.types";
import { mlDbService } from "@/services/ml/ml-db.service";
import type { AiMarkdownResponse } from "@repo/database";

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

	private readonly markdownSystemPrompt = `
		Turn the JSON input into markdown document. Do not embed image links. Format dialogs for characters as quote blocks
		
		YOU ARE NOT ALLOWED TO USE THE FOLLOWING SYMBOLS: '{', '}', "="
		
		Split up the content into the following sections
		* Profile
		* Story
		* Bio
		* Side Story
			* Title each section of the side story meaningfully
		* Abilities
			* Abilities's subsections
		* Trivia (MUST HAVE)
			
		RULES:
		
		* To start a section, the title should start with "# {title is here}"
		* To start a subsection, the subtitle should start with "## {subtitle is here}"
		* To start a section under the subsection, the trend will continue with "### {text here}"
		`;

	private schema = jsonSchema({
		$schema: "https://json-schema.org/draft/2020-12/schema",
		$id: "https://example.com/mlbb-hero.schema.json",
		type: "object",
		additionalProperties: false,
		unevaluatedProperties: false,

		properties: {
			name: {
				type: "string",
				description: "Canonical hero name, e.g., 'Miya'.",
				examples: ["Miya", "Lapu-Lapu", "Brody"],
			},

			profile: { $ref: "#/$defs/markdownBlock" },
			story: { $ref: "#/$defs/markdownBlock" },
			bio: { $ref: "#/$defs/markdownBlock" },

			side_story: {
				type: "object",
				additionalProperties: false,
				properties: {
					chapters: {
						type: "array",
						description: "Side story chapters, each a titled Markdown section.",
						minItems: 1,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								title: { type: "string", description: "Meaningful chapter title." },
								content: { $ref: "#/$defs/markdownBlock" },
							},
							required: ["title", "content"],
						},
					},
				},
				required: ["chapters"],
			},

			abilities: {
				type: "array",
				description: "Structured ability breakdown with full Markdown details.",
				minItems: 3,
				maxItems: 6,
				items: {
					type: "object",
					additionalProperties: false,
					properties: {
						slot: {
							type: "string",
							enum: ["Passive", "Skill 1", "Skill 2", "Skill 3", "Morph", "Ultimate"],
						},
						name: { type: "string" },
						cooldown: { type: "number", minimum: 0, description: "Seconds; 0/omit for passives." },
						cost: { type: "number", minimum: 0, description: "Mana/energy cost; omit if N/A." },
						role: {
							type: "string",
							enum: ["Damage", "Control", "Mobility", "Defense", "Utility"],
							description: "Primary function.",
						},
						details: { $ref: "#/$defs/markdownBlock" },
					},
					required: ["slot", "name", "details"],
				},
			},

			trivia: {
				type: "array",
				description: "Fun facts. Each item can be a line or a small Markdown paragraph.",
				minItems: 1,
				items: { $ref: "#/$defs/markdownBlock" },
			},
		},

		required: ["name", "profile", "story", "bio", "side_story", "abilities", "trivia"],

		$defs: {
			markdownBlock: {
				type: "object",
				additionalProperties: false,
				properties: {
					markdown: {
						type: "string",
						description:
							"Full Markdown content. Use clear headings, paragraphs, and formatting as needed. No need to be brief.",
					},
				},
				required: ["markdown"],
			},
		},
	});

	private SYSTEM_PROMPT = `
	You are formatting source content into structured Markdown sections — not rewriting it.

	Guidelines:
	- Preserve the original tone, voice, and phrasing of the content. Do NOT change point of view or retell it in your own words.
	- Do NOT add introductory sentences like "According to the lore..." or "This hero is known for...".
	- If the input already contains Markdown formatting (headings, lists, etc.), keep it as-is and organize it neatly.
	- If content clearly belongs to a field (Profile, Story, Bio, etc.), place it there — but do not merge unrelated sections together.
	- If there is side story content, make sure that each chapter that you divide is given meaningful title.
	- Do NOT invent, summarize, or narrate. Just cleanly organize the existing information into the correct fields.
	- ❌ **Never include irrelevant metadata such as "Gallery:", image file paths, redirects, external links, file thumbnails, wiki references, or source citations.** These must be dropped entirely.
	- ❌ **Omit fields like 'Birthday', 'Quote', or 'Gallery' unless they are explicitly part of the narrative text itself.**
	- If a field has no relevant content, leave it empty ("").
	- Always return a valid JSON object that matches the provided schema.

	⭐ Paragraph Construction (CRITICAL):
	- **Group related sentences into proper paragraphs.** Only create a new paragraph when the topic, scene, time, or speaker shifts significantly.
	- Story and Bio sections should read like natural prose with logical paragraph breaks, NOT like a bulleted timeline with each sentence on its own line.
	- Profile sections can use lists for structured data (name, species, abilities, etc.), but introductory/contextual sentences should be grouped into paragraphs.

	⭐ Side Story Chapter Titles:
	- Use **concise, meaningful titles** for each chapter without repeating the side story name.
	- If the source has chapter names like "Time of Lunar Eclipse — Part One: The Beginning", extract only the meaningful part: "The Beginning" or "Chapter One: The Beginning".
	- Avoid redundancy. Don't repeat the side story title in every chapter heading.

	❌ BAD (repetitive):
	## Time of Lunar Eclipse — One: Moonless Night
	## Time of Lunar Eclipse — Two: Journey Out
	## Time of Lunar Eclipse — Three: Farewell at the Edge

	✅ GOOD (concise):
	## Moonless Night
	## Journey Out
	## Farewell at the Edge

	Alternative (if numbering adds clarity):
	## Chapter One: Moonless Night
	## Chapter Two: Journey Out

	❌ BAD (each sentence as separate paragraph):
	Born at the end of the Era of Strife, Miya bore witness to the unspeakable tragedies.

	She saw how the Abyss defiled the Shadow Swamp.

	It was not until the Moon Goddess created the Lunar Aegis that the Moon Elves were able to thrive.

	✅ GOOD (related sentences grouped):
	Born at the end of the Era of Strife, Miya bore witness to the unspeakable tragedies that befell the elves during the Endless War. She saw how the Abyss defiled the Shadow Swamp and corrupted many of her people into Dark Elves. It was not until the Moon Goddess created the Lunar Aegis over Azrya that the Moon Elves were able to thrive again under its protection.

	⭐ Dialogue Formatting (CRITICAL):
	- **ALL spoken dialogue** in Story, Bio, and Side Story sections MUST use Markdown blockquote format (\`>\`). Never use inline quotes like "text" for dialogue.
	- Each line of dialogue gets its own blockquote line starting with \`>\`.
	- To visually separate different speakers or dialogue beats, add a blank line between blockquote lines.
	- After dialogue ends, return to regular narrative prose (no \`>\`).

	❌ BAD (inline quotes):
	"Run! Get out of the forest!" Miya heard the desperate cries, and before she could act, most of her people were already fleeing in panic.

	✅ GOOD (blockquote format):
	> "Run! Get out of the forest!"

	Miya heard the desperate cries, and before she could act, most of her people were already fleeing in panic.

	Example with conversation:
	> "What is war, brother?"

	> "When the races of the Land of Dawn turned on one another instead of embracing unity and mutual prosperity, that is war."

	> "Peace, benevolence, and purity... is that your wish for the world?"

	Estes did not reply. The outstretched branches of the Tree of Life wrapped around him, and he fell back into deep slumber.

	⭐ Abilities Formatting:
	- If numerical data (damage values, cooldowns, costs) is missing or uses placeholder text like "{{damage}}" or blank spaces, write a descriptive placeholder like "damage based on level and stats" or "scaling damage".
	- **Never leave incomplete phrases** like "deals to the target" or "healing for seconds".
	- Include all relevant details: cooldown, mana cost, damage type, effects, scaling values if available.
	- Use simple, clean markdown lists with \`-\` or \`*\` for bullets. **Never use special characters like \`•\` or \`◦\`**.
	- Avoid over-structuring with subsections like "Effect summary:", "Stats and scaling:", "Additional notes:". Just use natural paragraphs and lists.
	- Don't repeat information. If something is mentioned in the description, don't restate it again later.

	⭐ Markdown Syntax Only:
	- **ONLY use standard markdown syntax**: \`#\` for headings, \`-\` or \`*\` for lists, \`>\` for blockquotes, \`**bold**\`, \`*italic*\`.
	- **NEVER use special characters** like \`•\`, \`◦\`, \`→\`, \`▪\`, or other Unicode symbols for formatting.
	- Keep formatting clean and simple.

	⭐ MDX-Safe Formatting (CRITICAL):
	- **NEVER use curly braces \`{}\` or square brackets \`[]\` except for proper markdown links.**
	- Curly braces \`{}\` are JSX expression delimiters and will break MDX compilation.
	- Square brackets \`[]\` should ONLY be used as part of proper markdown link syntax \`[text](url)\`.

	❌ BAD (breaks MDX):
	- \`[top-notch]\` — square brackets used for emphasis
	- \`{4%, 8%, 12%}\` — curly braces used for grouping
	- \`{damage}\` — curly braces in placeholder text

	✅ GOOD (MDX-safe alternatives):
	- \`"top-notch"\` or just \`top-notch\` (use quotes or nothing)
	- \`(4%, 8%, 12%)\` or \`4%, 8%, 12%\` (use parentheses or nothing)
	- \`damage based on level\` (write it out clearly without braces)
	`;

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
		const list = await mlDbService.getHeroList();
		if (!list) return;

		for (const [_key, value] of Object.entries(list)) {
			const query = this.buildQuery(value.url_name);
			const wiki_response = await this.fetchWikiMarkup(query);
			const filepath = path.join(
				process.cwd(),
				"src",
				"data",
				"wiki",
				"markups",
				`${value.url_name}.md`,
			);

			try {
				await fs.promises.writeFile(filepath, wiki_response, "utf-8");
			} catch (error) {
				console.error(`Failed to write markup for ${value.url_name}:`, error);
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

		const limit = 15;
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
					const markdown = await this.getAiMarkdown(prompt);

					// write to file
					const outputPath = path.join(outputDir, `${path.basename(filename, ".json")}.md`);
					await fs.promises.writeFile(outputPath, markdown, "utf-8");
				} catch (error) {
					console.error(`Failed to process ${filename}: `, error);
				}
			}
		});

		await Promise.all(workers);
	}

	async updateHeroMarkdown(title: string): Promise<string> {
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

		const markdown = await this.getAiMarkdown(prompt);

		const fileBase = normalizedTitle.toLowerCase();
		await Promise.all([
			fs.promises.writeFile(
				path.join(jsonDir, `${fileBase}.json`),
				JSON.stringify(sections, null, 2),
				"utf-8",
			),
			fs.promises.writeFile(path.join(markdownDir, `${fileBase}.md`), markdown, "utf-8"),
		]);

		return markdown;
	}

	private async getAiMarkdown(markup_content: string) {
		const object_response = await generateObject({
			model: openai("gpt-5-mini"),
			schema: this.schema,
			messages: [
				{ role: "system", content: this.SYSTEM_PROMPT },
				{ role: "user", content: markup_content },
			],
		});

		const ai_response = object_response.object as AiMarkdownResponse;

		let markdown: string = "";
		markdown += this.appendFront("#", ai_response.name);
		if (ai_response.profile.markdown) {
			markdown += this.appendSection("#", "Profile", ai_response.profile.markdown);
		}
		if (ai_response.bio.markdown) {
			markdown += this.appendSection("#", "Bio", ai_response.bio.markdown);
		}
		if (ai_response.story.markdown) {
			markdown += this.appendSection("#", "Story", ai_response.story.markdown);
		}
		if (ai_response.side_story?.chapters?.length > 0) {
			markdown += this.appendFront("#", "Side Story");
			for (const chapter of ai_response.side_story.chapters) {
				markdown += this.appendSection("##", chapter.title, chapter.content.markdown);
			}
		}
		if (ai_response.abilities && ai_response.abilities.length > 0) {
			markdown += this.appendFront("#", "Abilities");
			for (const ability of ai_response.abilities) {
				markdown += this.appendSection("##", ability.name, ability.details.markdown);
			}
		}
		if (ai_response.trivia && ai_response.trivia.length > 0) {
			markdown += this.appendFront("#", "Trivia");
			for (const trivia of ai_response.trivia) {
				markdown += `- ${trivia.markdown}\n`;
			}
		}

		return markdown;
	}

	private appendFront(append: string, text: string): string {
		return `${append} ${text}\n\n`;
	}

	private appendSection(append: string, title: string, markdown: string): string {
		let content: string = "";
		content += this.appendFront(append, title);
		content += markdown + "\n\n";
		return content;
	}

	async getHeroPages() {
		const response = await fetch(
			`https://mobile-legends.fandom.com/api.php?action=query&list=categorymembers&cmtitle=Category:Heroes&cmlimit=max&format=json&origin=*`,
			{
				headers: {
					Accept: "application/json",
					"User-Agent": "LoreOfDawn/1.0 (+https://loreofdawn.com; contact: hla.dev)",
					Referer: "https://loreofdawn.com",
				},
			},
		);

		const data = (await response.json()) as {
			query: {
				categorymembers: {
					pageid: number;
					title: string;
				}[];
			};
		};

		return data.query.categorymembers;
	}
}

export const wikiScraper = new WikiScraper();
