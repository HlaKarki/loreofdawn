import { Context } from "hono";
import { Logger } from "@repo/utils";
import { HeroService } from "@/services/heroes.service";
import { AiService, models_enum } from "@/services/ai.service";
import { DbService } from "@/services/db.service";
import { z } from "zod";
import type { Env } from "@/types";
import { cacheKvLayer } from "@/middleware/cache";
import { CreditService } from "@/services/credits.service";

const cV = "v1.0.2";

const input_schema = z.object({
	question: z.string().min(1).max(500),
	model: z.enum(models_enum).default("deepseek"),
	debug: z.boolean().default(false),
	ai: z.boolean().default(true),
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

	// Define services
	const creditService = new CreditService(c.env.HYPERDRIVE.connectionString);

	const ip = c.req.header("CF-Connecting-IP") || "unknown";
	const input = validation.data;
	Logger.info(pathname, { ip, ...validation.data });

	// Check if user has credits (non-deducting check)
	const hasCredits = await creditService.hasCredits(clerkUserId);
	if (!hasCredits) {
		Logger.warn(pathname, { ip, clerkUserId, message: "Insufficient credits" });
		return c.json(
			{
				error: "Insufficient credits",
				details: "You don't have enough credits to make this request. Please upgrade your plan.",
			},
			402,
		);
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

	// Generate AI response
	let aiResponse;
	if (input.ai) {
		const prompt = buildResponsePrompt(queryResult);

		aiResponse = await aiService.generateResponse(
			pathname,
			input.stream,
			prompt,
			input.question,
			aiService.get_model(),
		);
		if ("error" in aiResponse) {
			Logger.error(pathname, { ip, response: aiResponse });
			return c.json({ error: aiResponse.error }, 500);
		}
	}

	// charge the credit - all operations succeeded
	let creditsRemaining: number;
	try {
		const result = await creditService.useCredit(clerkUserId);
		creditsRemaining = result.credits_remaining;
		Logger.info(pathname, {
			clerkUserId,
			creditsRemaining,
			message: "Credit deducted successfully",
		});
	} catch (error) {
		// Race condition: User had credits initially but now doesn't
		// This is rare but can happen with concurrent requests
		Logger.error(pathname, {
			ip,
			clerkUserId,
			message: "Failed to deduct credit (likely concurrent requests)",
			error,
		});
		return c.json(
			{
				error: "Credit deduction failed",
				details: "Please try again. Your request was not charged.",
			},
			409,
		);
	}

	if (input.ai && aiResponse) {
		Logger.info(pathname, { sqlQuery: sqlResult.sql, queryResult: queryResult });

		if (input.stream && "toTextStreamResponse" in aiResponse) {
			return aiResponse.toTextStreamResponse({
				headers: {
					"X-Credits-Remaining": String(creditsRemaining),
				},
			});
		}

		Logger.info(pathname, { ip, model: aiService.modelToString(), usage: aiResponse.usage });

		return c.json({
			response: aiResponse.text,
			credits_remaining: creditsRemaining,
			model: input.debug ? aiService.modelToString() : undefined,
			sql: input.debug ? sqlResult.sql : undefined,
			queryResult: input.debug ? queryResult : undefined,
			query_usage: input.debug ? sqlResult.usage : undefined,
			response_usage: input.debug ? aiResponse.usage : undefined,
		});
	}

	return c.json({
		sqlResult: sqlResult,
		queryResult: queryResult,
		credits_remaining: creditsRemaining,
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
