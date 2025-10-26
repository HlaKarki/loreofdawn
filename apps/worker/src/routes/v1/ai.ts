import { Hono } from "hono";
import type { Env } from "@/types";
import { generateObject, generateText, streamText } from "ai";
import { AiService, models_enum } from "@/services/ai.service";
import { createDb } from "@/db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { HeroService } from "@/services/heroes.service";
import { rateLimiter } from "@/middleware/rateLimit";

const input_schema = z.object({
	question: z.string().min(1).max(500),
	model: z.enum(models_enum).default("deepseek"),
	debug: z.boolean().default(false),
	ai: z.boolean().default(false),
	stream: z.boolean().default(true),
});

export const aiRouter = new Hono<Env>();

// Apply rate limiting to AI endpoint (20/min, 200/day)
const aiRateLimiter = rateLimiter({
	requestsPerMinute: 5,
	requestsPerDay: 100,
	keyPrefix: "ratelimit:ai",
});

/**
 * POST /ask - AI-powered natural language to SQL query endpoint
 *
 * Converts natural language questions into SQL queries using AI, executes them safely
 * on a read-only database connection, and optionally returns AI-generated natural language responses.
 *
 * Rate Limited: 20 requests/minute, 200 requests/day per IP
 *
 * @param {string} question - Natural language question (1-500 chars)
 * @param {string} model - AI model to use: "google" (default) or "openai"
 * @param {boolean} debug - Include debug info (query details) in response
 * @param {boolean} ai - Return AI-generated natural language response instead of raw SQL results
 */
aiRouter.post("/ask", aiRateLimiter, async (c) => {
	const validation = input_schema.safeParse(await c.req.json());

	if (!validation.success) {
		return c.json(
			{
				error: "Invalid request",
				details: validation.error.errors,
			},
			400,
		);
	}

	const { question, model, debug, ai, stream } = validation.data;
	const startTime = Date.now();
	const ip = c.req.header("CF-Connecting-IP") || "unknown";

	// Log incoming request
	console.log(
		`[AI Request] IP: ${ip}, Model: ${model}, Question Length: ${question.length}, AI Mode: ${ai}`,
	);

	const heroService = new HeroService(c.env);
	const list_of_heroes = await heroService.getHeroList();
	const cleaned_list = list_of_heroes.map((hero) => hero.url_name);

	const aiService = new AiService(model);
	try {
		const ai_query_response = await generateObject({
			model: aiService.get_model(),
			schema: aiService.sql_z_schema(),
			system: aiService.sql_system_prompt(JSON.stringify(cleaned_list)),
			prompt: question,
			temperature: 0,
		});
		const query_response = ai_query_response.object;

		if ("error" in query_response) {
			const duration = Date.now() - startTime;
			console.log(
				`[AI Rejected] IP: ${ip}, Duration: ${duration}ms, Reason: ${query_response.error.substring(0, 100)}`,
			);
			return c.json(
				{
					error: "Invalid query",
					details: query_response.error,
				},
				400,
			);
		}

		if ("sql" in query_response) {
			const db = createDb(c.env.HYPERDRIVE_READONLY.connectionString);
			try {
				// execute the ai-made query
				const result = await db.execute(sql.raw(query_response.sql));

				if (ai) {
					if (stream) {
						const worded_answer = streamText({
							model: aiService.get_model(),
							system: `
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
						${JSON.stringify(result)}
						`,
							prompt: question,
							maxOutputTokens: 1000,
						});

						const duration = Date.now() - startTime;
						console.log(
							`[AI Success] IP: ${ip}, Duration: ${duration}ms, Model: ${model}, Rows: ${result.length}, AI Mode: streaming`,
						);

						return worded_answer.toTextStreamResponse({
							headers: {
								model: aiService.modelToString(),
								sql: debug ? query_response.sql : "",
								query_usage: JSON.stringify(ai_query_response.usage),
								response_usage: JSON.stringify(worded_answer.usage),
							},
						});
					}

					const worded_answer = await generateText({
						model: aiService.get_model(),
						system: `
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
						${JSON.stringify(result)}
						`,
						prompt: question,
						maxOutputTokens: 1000,
					});

					const duration = Date.now() - startTime;
					console.log(
						`[AI Success] IP: ${ip}, Duration: ${duration}ms, Model: ${model}, Rows: ${result.length}, AI Mode: streaming`,
					);

					return c.json({
						response: worded_answer.text,
						model: debug ? aiService.modelToString() : undefined,
						sql: debug ? query_response.sql : undefined,
						query_usage: debug ? ai_query_response.usage : undefined,
						response_usage: debug ? worded_answer.usage : undefined,
					});
				}

				const duration = Date.now() - startTime;
				console.log(
					`[AI Success] IP: ${ip}, Duration: ${duration}ms, Model: ${model}, Rows: ${result.length}, AI Mode: false`,
				);

				return c.json({
					norm: debug ? { ...query_response } : undefined,
					question: debug ? question : undefined,
					results: result,
					rowCount: result.length,
				});
			} catch (error) {
				const duration = Date.now() - startTime;
				console.error(
					`[AI DB Error] IP: ${ip}, Duration: ${duration}ms, Error: ${error instanceof Error ? error.message : String(error)}`,
				);
				return c.json(
					{
						...query_response,
						question: question,
						error: "Query execution failed",
						details: error instanceof Error ? error.message : String(error),
					},
					500,
				);
			}
		}

		return c.json(
			{
				error: "Unexpected AI response format",
				details: "Response matched neither sql nor error schema",
			},
			500,
		);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(
			`[AI Generation Error] IP: ${ip}, Duration: ${duration}ms, Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		return c.json(
			{
				error: "AI generation failed",
				details: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});
