import { Hono } from "hono";
import type { Env } from "@/types";
import { generateObject, streamText } from "ai";
import { AiService } from "@/services/ai.service";
import { createDb } from "@/db";
import { sql } from "drizzle-orm";
import { z } from "zod";

const input_schema = z.object({
	question: z.string().min(1).max(500),
	model: z.enum(["openai", "google"]).default("google"),
	debug: z.boolean().default(false),
	ai: z.boolean().default(false),
});

export const aiRouter = new Hono<Env>();

/**
 * POST /ask - AI-powered natural language to SQL query endpoint
 *
 * Converts natural language questions into SQL queries using AI, executes them safely
 * on a read-only database connection, and optionally returns AI-generated natural language responses.
 *
 * @param {string} question - Natural language question (1-500 chars)
 * @param {string} model - AI model to use: "google" (default) or "openai"
 * @param {boolean} debug - Include debug info (query details) in response
 * @param {boolean} ai - Return AI-generated natural language response instead of raw SQL results
 */
aiRouter.post("/ask", async (c) => {
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

	const { question, model, debug, ai } = validation.data;

	const aiService = new AiService(model);
	try {
		const ai_query_response = await generateObject({
			model: aiService.get_model(),
			schema: aiService.sql_z_schema(),
			system: aiService.sql_system_prompt(),
			prompt: question,
			temperature: 0,
		});
		const query_response = ai_query_response.object;

		if ("error" in query_response) {
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
					const worded_answer = streamText({
						model: aiService.get_model(),
						system: `
						Only using the context provided, answer the user question.
						The game in talks is Mobile Legends: Bang Bang.
		
						Example Perfect Response:
						question: "Which heroes have the highest win rate currently?",
						answer: "Currently, bruno has the highest win rate with {actual data from context if applicable}.
		
						A bad response for the same question would be:
						bad_answer: "Of course! Based on the context provided, bruno has the highest win rate with {context}"
		
						### CONTEXT
						${JSON.stringify(result)}
						`,
						prompt: question,
					});

					return worded_answer.toTextStreamResponse({
						headers: {
							model: aiService.modelToString(),
						},
					});
				}

				return c.json({
					norm: debug ? { ...query_response } : undefined,
					question: debug ? question : undefined,
					results: result,
					rowCount: result.length,
				});
			} catch (error) {
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
		return c.json(
			{
				error: "AI generation failed",
				details: error instanceof Error ? error.message : String(error),
			},
			500,
		);
	}
});
