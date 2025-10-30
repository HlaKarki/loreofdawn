import { Context } from "hono";
import { Logger } from "@repo/utils";
import { HeroService } from "@/services/heroes.service";
import { AiService, models_enum } from "@/services/ai.service";
import { DbService } from "@/services/db.service";
import { z } from "zod";
import type { Env } from "@/types";
import { cacheKvLayer } from "@/middleware/cache";

const input_schema = z.object({
	question: z.string().min(1).max(500),
	model: z.enum(models_enum).default("deepseek"),
	debug: z.boolean().default(false),
	ai: z.boolean().default(false),
	stream: z.boolean().default(true),
});

/**
 * Converts natural language questions into SQL queries using AI, executes them safely
 * on a read-only database connection, and optionally returns AI-generated natural language responses.
 *
 * @param {Context} c - Hono Context
 */
export const askQuestionsHandler = async (c: Context<Env>) => {
	const pathname = new URL(c.req.url).pathname;

	const validation = input_schema.safeParse(await c.req.json());
	if (!validation.success) {
		return c.json({ error: "Invalid request", details: validation.error.errors }, 400);
	}

	const ip = c.req.header("CF-Connecting-IP") || "unknown";
	const { question, model, debug, ai, stream } = validation.data;

	Logger.info(pathname, { ip, ...validation.data });
	const heroNames = await cacheKvLayer.tryFetch(
		c,
		"hero-names:v1",
		async () => {
			const list = await new HeroService(c.env).getHeroList();
			return list.map((hero) => hero.url_name);
		},
		{ ttlSeconds: 60 * 60 * 24 }, // 24 hours
	);
	const aiService = new AiService(model);

	const sqlResult = await aiService.generateSqlQuery(pathname, question, JSON.stringify(heroNames));

	if ("error" in sqlResult) {
		Logger.error(pathname, { ip, sqlResult });
		return c.json({ error: "Invalid query", details: sqlResult.error }, 400);
	}

	const queryResult = await DbService.executeSqlQuery(
		sqlResult.sql,
		c.env.HYPERDRIVE_READONLY.connectionString,
	);
	if ("error" in queryResult) {
		Logger.error(pathname, { ip, queryResult });
		return c.json({ error: "Query failed", details: queryResult.error }, 500);
	}

	if (ai) {
		const prompt = buildResponsePrompt(queryResult);

		const response = await aiService.generateResponse(
			pathname,
			stream,
			prompt,
			question,
			aiService.get_model(),
		);
		if ("error" in response) {
			Logger.error(pathname, { ip, response });
			return c.json({ error: response.error }, 500);
		}

		if (stream && "toTextStreamResponse" in response) {
			return response.toTextStreamResponse({
				headers: { model: aiService.modelToString() },
			});
		}

		Logger.info(pathname, { ip, model: aiService.modelToString(), usage: response.usage });

		return c.json({
			response: response.text,
			model: debug ? aiService.modelToString() : undefined,
			sql: debug ? sqlResult.sql : undefined,
			query_usage: debug ? sqlResult.usage : undefined,
			response_usage: debug ? response.usage : undefined,
		});
	}

	return c.json({
		sqlResult: sqlResult,
		queryResult: queryResult,
	});
};

const buildResponsePrompt = (queryResults: unknown) => `
You are answering questions about Mobile Legends: Bang Bang heroes using SQL query results.
You respond in markdown syntax.

Keep responses brief wherever possible. Do not be lengthier than 1000 words.

### Response Style Rules:
1. **Be conversational and natural** - Answer like you're talking to a friend, not reading from a database
2. **Never mention the context** - Don't say "Based on the context...", "According to the data...", or "The information shows..."
3. **Be specific and accurate** - Use exact numbers, names, and details from the query results
4. **Pick interesting details** - For lore/story questions, choose surprising or noteworthy facts, not generic info
5. **Keep it concise** - If asked for "one fact", give one fact. Don't over-explain.

### Examples:

❌ BAD: "Of course! Based on the context provided, Bruno has the highest win rate with 52.3%."
✅ GOOD: "Bruno has the highest win rate at 52.3%."

❌ BAD: "According to the query results, Miya is a hero in the game with various attributes..."
✅ GOOD: "Miya is the game's very first hero and appears on every MLBB app icon as the official mascot."

❌ BAD: "The database shows that Fanny's win rate is..."
✅ GOOD: "Fanny has a 48.5% win rate in Glory rank."

### CONTEXT
${JSON.stringify(queryResults)}
`;
