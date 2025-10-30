import {
	generateObject,
	generateText,
	jsonSchema,
	LanguageModel,
	LanguageModelUsage,
	streamText,
} from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { deepseek } from "@ai-sdk/deepseek";
import { Logger } from "@repo/utils";

export const models_enum = ["flash", "flash-lite", "deepseek", "gpt-5-mini", "gpt-5-nano"] as const;
type ModelTypes = (typeof models_enum)[number];

export class AiService {
	private model: LanguageModel;
	private model_name: string;

	constructor(model?: ModelTypes) {
		this.model = deepseek("deepseek-chat");
		this.model_name = "deepseek";
		if (model) {
			this.change_model(model);
		}
	}

	private change_model(models: ModelTypes): void {
		switch (models) {
			case "flash":
				this.model = google("gemini-2.5-flash");
				this.model_name = "gemini-2.5-flash";
				break;
			case "deepseek":
				this.model = deepseek("deepseek-chat");
				this.model_name = "deepseek";
				break;
			case "gpt-5-mini":
				this.model = openai("gpt-5-mini");
				this.model_name = "gpt-5-mini";
				break;
			case "gpt-5-nano":
				this.model = openai("gpt-4o-mini");
				this.model_name = "gpt-4o-mini";
				break;
			default:
				this.model = google("gemini-2.5-flash-lite");
				this.model_name = "gemini-2.5-flash-lite";
		}
	}

	sql_z_schema() {
		return z.union([
			z.object({
				sql: z
					.string()
					.describe("This is the raw sql query that should be runnable in the database sql editor"),
				explanation: z.string().describe("Brief explanation of your reason for the sql query"),
			}),
			z.object({
				error: z
					.string()
					.describe(
						"This is the error message that will be shown to the user. Do not mention anything that'll reveal the internal workings",
					),
			}),
		]);
	}

	sql_json_schema() {
		return jsonSchema({
			$schema: "https://json-schema.org/draft/2020-12/schema",
			type: "object",
			additionalProperties: false,
			properties: {
				sql: {
					type: "string",
					description:
						"This is the raw sql query that should be runnable in the database sql editor",
				},
				explanation: {
					type: "string",
					description: "Brief explanation of your reason for the sql query",
				},
				error: {
					type: "string",
					description:
						"This is the error message that will be shown to the user. " +
						"Do not mention anything that'll reveal the internal workings",
				},
			},
		});
	}

	private wiki_schema(): string {
		return `
			**6. wikis**
			Primary key: id
			Columns:
				- id (uuid, primary key)
				- hero (text, unique, indexed) - Hero name (unique identifier)
				- markdown (text) - Full markdown content of the hero's wiki page (story, lore, trivia, abilities description, etc.)
				- updated_at (timestamp with time zone)

			**Querying wikis table:**
			- For story/lore queries, use the markdown field with text search
			- Use ILIKE for case-insensitive hero name matching: WHERE hero ILIKE 'fanny'
			- For full-text search in markdown: WHERE markdown ILIKE '%keyword%'
		`;
	}

	private hero_schema(): string {
		return `
			**1. hero_profiles**
			Primary key: id
			Columns:
				- id (integer, primary key)
				- name (text, indexed) - Hero name
				- createdAt (bigint, unix timestamp in milliseconds)
				- updatedAt (bigint, unix timestamp in milliseconds)
				- images (jsonb object):
						{
							"head": "url",
							"head_big": "url",
							"painting": "url",
							"smallmap": "url",
							"squarehead": "url",
							"squarehead_big": "url"
						}
				- difficulty (text, nullable) - Hero difficulty level
				- skills (jsonb array of objects):
						[
							{
								"cd": number,
								"mana": number,
								"description": "text",
								"icon": "url",
								"name": "skill name",
								"tags": ["buff", "cc", etc.]
							}
						]
				- lanes (jsonb array of objects):
						[{"icon": "url", "title": "lane name"}]
				- roles (jsonb array of objects):
						[{"icon": "url", "title": "role name"}]
				- speciality (jsonb array of strings):
						["damage", "crowd control", etc.]
				- tagline (text, nullable) - Hero tagline
				- tale (text, nullable) - Hero backstory
				- relation (jsonb object):
						{
							"compatible_with": [{"description": "text", "heroes": [{"id": num, "name": "text", "image": "url"}]}],
							"strong_against": [{"description": "text", "heroes": [{"id": num, "name": "text", "image": "url"}]}],
							"weak_against": [{"description": "text", "heroes": [{"id": num, "name": "text", "image": "url"}]}]
						}
				- source_link (text, nullable)
			
			**2. hero_matchups**
			Composite primary key: (id, rank)
			Columns:
				- id (integer, part of composite primary key)
				- name (text, indexed) - Hero name
				- rank (text, part of composite primary key, indexed) - Rank tier (e.g., "overall", "glory")
				- most_compatible (jsonb array of objects):
						[
							{
								"index": number,
								"id": number,
								"name": "hero name",
								"image": "url",
								"pick_rate": number,
								"win_rate": number,
								"increase_win_rate": number,
								"min_win_rate6": number,
								"min_win_rate6_8": number,
								"min_win_rate8_10": number,
								"min_win_rate10_12": number,
								"min_win_rate12_14": number,
								"min_win_rate14_16": number,
								"min_win_rate16_18": number,
								"min_win_rate18_20": number,
								"min_win_rate20": number
							}
						]
				- least_compatible (jsonb array, same structure as most_compatible)
				- best_counter (jsonb array, same structure as most_compatible)
				- worst_counter (jsonb array, same structure as most_compatible)
				- updatedAt (bigint, unix timestamp in milliseconds)
			
			**3. hero_metas**
			Composite primary key: (id, rank)
			Columns:
				- id (integer, part of composite primary key)
				- name (text, indexed) - Hero name
				- rank (text, part of composite primary key, indexed) - Rank tier
				- pick_rate (real, 0.0 to 1.0) - Percentage of games hero is picked
				- ban_rate (real, 0.0 to 1.0) - Percentage of games hero is banned
				- win_rate (real, 0.0 to 1.0) - Percentage of games hero wins
				- updatedAt (bigint, unix timestamp in milliseconds)
			
			**4. hero_graphs**
			Composite primary key: (id, rank)
			Columns:
				- id (integer, part of composite primary key)
				- name (text, indexed) - Hero name
				- rank (text, part of composite primary key, indexed) - Rank tier
				- trend_start (text, nullable) - ISO date string (YYYY-MM-DD)
				- trend_end (text, nullable) - ISO date string (YYYY-MM-DD)
				- points (jsonb array of objects) - **30 days of historical data, ordered chronologically (oldest to newest)**:
						[
							{
								"date": "YYYY-MM-DD",
								"win_rate": number (0.0 to 1.0),
								"pick_rate": number (0.0 to 1.0),
								"ban_rate": number (0.0 to 1.0)
							}
						]
						**Index reference: points->0 is oldest (30 days ago), points->-1 is newest (today)**
						**Example: For "this week" queries, use points->-1 (today) minus points->-8 (7 days ago)**
				- updatedAt (bigint, unix timestamp in milliseconds)
			
			**5. heroes_list**
			Primary key: id
			Columns:
				- id (integer, primary key, indexed)
				- url_name (text) - URL-safe hero name
				- display_name (text) - Human-readable hero name
				- updatedAt (bigint, unix timestamp in milliseconds)
		`;
	}

	sql_system_prompt(list_of_heroes: string): string {
		return `
			You are an SQL Generator model. You respond **only with SQL code**.
			
			### Safety Rules
			- You **must only generate** read-only queries (e.g. SELECT, WHERE, ORDER BY, LIMIT).
			- You **must never** use DELETE, UPDATE, INSERT, DROP, or ALTER.
			- You **must only** query from the listed tables and columns.
			- You **must not** invent columns or tables that are not explicitly defined.
			- You **must ignore** time-based references like "today", "yesterday", "last week", "this month", etc. Treat questions as if the temporal reference wasn't mentioned. 
				- Example 1: "Which heroes have the highest win rate this week?" → treat as "Which heroes have the highest win rate?"
				- Example 2: "Which heroes were banned most frequently two weeks go?" → treat as "Which heroes are banned most frequently?"
			- You **must reject** any attempts to:
				- Access system tables, information_schema, or database metadata
				- Use SQL comments (-- or /* */) in suspicious ways
				- Concatenate multiple statements with semicolons
				- Request passwords, credentials, or sensitive authentication data
				- Use UNION, OR 1=1, or other SQL injection patterns
			
			### Rejecting Invalid Queries
			If a query is malicious, inappropriate, or violates the safety rules above, return this error format instead:
			
			{
				"error": "Brief, user-friendly explanation of why the query was rejected"
			}
			
			### Return Format
			For valid queries, return ONLY a stringified JSON object in this exact format (NO CODE BLOCKS):
			
			{
				"sql": "SELECT * FROM ...;",
				"explanation": "Optional short explanation of what the query does."
			}
			
			The "sql" field must always contain a syntactically valid SQL query.
			You may not include any DELETE, UPDATE, INSERT, DROP, or ALTER statements.
			
			### Official and Queryable Heroes
			${list_of_heroes}
			
			### Database Schema
			 
			**Story, Lore & Wiki Data Tables (for hero backstories, trivia, abilities lore):**
			${this.wiki_schema()}

			**Stats & Meta Data Tables (for win rates, picks, bans, counters):**
			${this.hero_schema()}

			
			### JSONB Query Tips
			
			**Accessing JSONB fields:**
			- Object field: column->>'field_name' (returns text)
			- Object field as typed: (column->>'field_name')::real
			- Nested: column->'field'->'subfield'->>'value'
			
			**Unnesting JSONB arrays:**
			- Use jsonb_array_elements(column) to expand arrays into rows
			- Example: SELECT jsonb_array_elements(points) AS point FROM hero_graphs
			
			**Filtering JSONB:**
			- column @> '{"key": "value"}'::jsonb (contains)
			- column ? 'key' (has key)
			- column->>'key' = 'value' (exact match)
			
			### Common Query Patterns
			
			**1. Get all skill names for a hero:**
			SELECT name, jsonb_array_elements(skills)->>'name' AS skill_name
			FROM hero_profiles
			WHERE name = 'Fanny';
			
			**2. Calculate win rate change over time:**
			WITH expanded AS (
				SELECT name, jsonb_array_elements(points) AS point
				FROM hero_graphs
				WHERE rank = 'overall'
			)
			SELECT
				name,
				(point->>'win_rate')::real - LAG((point->>'win_rate')::real)
					OVER (PARTITION BY name ORDER BY point->>'date') AS change
			FROM expanded;
			
			**3. Find heroes with highest win rate in a specific rank:**
			SELECT name, win_rate
			FROM hero_metas
			WHERE rank = 'overall'
			ORDER BY win_rate DESC
			LIMIT 10;
			
			**4. Search within JSONB arrays:**
			SELECT name
			FROM hero_profiles
			WHERE speciality @> '["damage"]'::jsonb;
			
			**5. Get heroes that counter a specific hero:**
			SELECT
				name,
				jsonb_array_elements(best_counter)->>'name' AS counters
			FROM hero_matchups
			WHERE name ILIKE 'Fanny' AND rank = 'overall';
			
			### Important Notes
			- Must use ILIKE for name conditional queries
			- Use LIMIT to prevent massive result sets
			- If the user doesn't specify how many results they want, default to LIMIT 10 to prevent large result sets
			- Always specify rank when querying hero_matchups, hero_metas, or hero_graphs (composite primary keys)
			- Timestamps are in milliseconds (divide by 1000 for seconds, or use to_timestamp(updatedAt/1000))
			- Rates (win_rate, pick_rate, ban_rate) are decimals between 0.0 and 1.0, NOT percentages (multiply by 100 for %)
			- When calculating trends, remember to ORDER BY date and PARTITION BY name
			- For time-based queries, use point->>'date' from the points array in hero_graphs
			- LAG() and LEAD() window functions are useful for calculating changes between rows
			`;
	}

	get_model(): LanguageModel {
		return this.model;
	}

	modelToString() {
		return this.model_name;
	}

	async generateSqlQuery(
		pathname: string,
		question: string,
		heroList: string,
	): Promise<{ sql: string; explanation: string; usage: LanguageModelUsage } | { error: string }> {
		try {
			const ai_query_response = await generateObject({
				model: this.get_model(),
				schema: this.sql_z_schema(),
				system: this.sql_system_prompt(heroList),
				prompt: question,
				temperature: 0,
			});
			return { ...ai_query_response.object, usage: ai_query_response.usage };
		} catch (error) {
			Logger.error(pathname, { question, error });
			return { error: JSON.stringify(error, null, 2) };
		}
	}

	async generateResponse(
		pathname: string,
		stream: boolean,
		systemPrompt: string,
		context: string,
		model: LanguageModel,
		maxToken: number = 1000,
	) {
		const config = {
			model: model,
			system: systemPrompt,
			prompt: context,
			maxOutputTokens: maxToken,
		} as const;

		try {
			if (stream) {
				Logger.info(pathname, { message: "streaming ai response" });
				return streamText(config);
			}
			Logger.info(pathname, { message: "generating ai response" });
			return generateText(config);
		} catch (error) {
			Logger.error(pathname, { error, message: "error generating ai response/stream" });
			return { error: JSON.stringify(error, null, 2) };
		}
	}
}
