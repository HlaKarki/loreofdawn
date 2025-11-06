import { Context } from "hono";
import { Logger } from "@repo/utils";
import { HeroService } from "@/services/heroes.service";
import { AiService, models_enum } from "@/services/ai.service";
import { DbService } from "@/services/db.service";
import { z } from "zod";
import type { Env } from "@/types";
import { cacheKvLayer } from "@/middleware/cache";
import { CreditService } from "@/services/credits.service";
import { UserService } from "@/services/users.service";

const cV = "v1.0.2";

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
	// authenticating middleware which gives me userId
	const pathname = new URL(c.req.url).pathname;

	const clerkUserId = c.get("clerkUserId");

	if (!clerkUserId) {
		Logger.info(pathname, { message: "No clerkUserId found!" });
		return c.json(
			{ error: "Invalid request", details: "No authenticated credentials provided" },
			400,
		);
	}

	const validation = input_schema.safeParse(await c.req.json());
	if (!validation.success) {
		return c.json({ error: "Invalid request", details: validation.error.errors }, 400);
	}

	// Define services in one place?
	const userService = new UserService(c.env.HYPERDRIVE.connectionString);
	const creditService = new CreditService(c.env.HYPERDRIVE.connectionString);

	const ip = c.req.header("CF-Connecting-IP") || "unknown";
	const input = validation.data;
	Logger.info(pathname, { ip, ...validation.data });

	// check if user has enough credit to proceed
	const userData = await userService.getUserByClerkId(clerkUserId);

	if (userData.credits_remaining < 1) {
		return c.json({ error: "Invalid request", details: "You don't have enough credit!" });
	}

	const shaQuestion = await cacheKvLayer.shaCacheKey(input.question, 16, { model: input.model });
	const heroMetadata = await cacheKvLayer.tryFetch(
		c,
		`heroMetadata:askQuestionsHandler:${cV}`,
		async () => {
			return await new HeroService(c.env).getHeroListForAi();
		},
		{ ttlSeconds: 60 * 60 * 24 }, // 24 hours
	);
	const aiService = new AiService(input.model);

	const sqlResult = await cacheKvLayer.tryFetch(c, `sqlResult:${cV}:${shaQuestion}`, async () => {
		return await aiService.generateSqlQuery(pathname, input.question, heroMetadata);
	});

	if ("error" in sqlResult) {
		Logger.error(pathname, { ip, sqlResult });
		return c.json({ error: "Invalid query", details: sqlResult.error }, 400);
	}

	const shaSqlResult = await cacheKvLayer.shaCacheKey(sqlResult.sql, 16);
	const queryResult = await cacheKvLayer.tryFetch(
		c,
		`queryResult:${shaSqlResult}`,
		async () => {
			// TODO: Using regular HYPERDRIVE instead of READONLY due to connection issues
			return await DbService.executeSqlQuery(sqlResult.sql, c.env.HYPERDRIVE.connectionString);
		},
		{ ttlSeconds: 60 * 60 }, // 1 hour,
	);

	if ("error" in queryResult) {
		Logger.error(pathname, { ip, queryResult });
		return c.json({ error: "Query failed", details: queryResult.error }, 500);
	}

	if (input.ai) {
		const prompt = buildResponsePrompt(queryResult);

		const response = await aiService.generateResponse(
			pathname,
			input.stream,
			prompt,
			input.question,
			aiService.get_model(),
		);
		if ("error" in response) {
			Logger.error(pathname, { ip, response });
			return c.json({ error: response.error }, 500);
		}

		Logger.info(pathname, { sqlQuery: sqlResult.sql, queryResult: queryResult });

		// use up credit
		const balance = await creditService.useCredit(clerkUserId);

		if (input.stream && "toTextStreamResponse" in response) {
			return response.toTextStreamResponse({
				headers: { model: aiService.modelToString(), balance: String(balance.credits_remaining) },
			});
		}

		Logger.info(pathname, { ip, model: aiService.modelToString(), usage: response.usage });

		return c.json({
			response: response.text,
			model: input.debug ? aiService.modelToString() : undefined,
			sql: input.debug ? sqlResult.sql : undefined,
			queryResult: input.debug ? queryResult : undefined,
			query_usage: input.debug ? sqlResult.usage : undefined,
			response_usage: input.debug ? response.usage : undefined,
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
