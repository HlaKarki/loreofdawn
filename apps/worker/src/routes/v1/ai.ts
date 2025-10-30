import { Hono } from "hono";
import type { Env } from "@/types";
import { rateLimiter } from "@/middleware/rateLimit";
import { askQuestionsHandler } from "@/handlers/askQuestions.handler";

export const aiRouter = new Hono<Env>();

const aiRateLimiter = rateLimiter({
	capacity: 5,
	windowSecond: 60,
});

aiRouter.post("/test/ratelimit", aiRateLimiter, async (c) => {
	const ip = c.req.header("CF-Connecting-IP") || "unknown";

	return c.json({
		ip: ip,
		pathname: new URL(c.req.url).pathname,
	});
});

/**
 * POST /ask - AI-powered natural language to SQL query endpoint
 */
aiRouter.post("/ask", aiRateLimiter, askQuestionsHandler);
