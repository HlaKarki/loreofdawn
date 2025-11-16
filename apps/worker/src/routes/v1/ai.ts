import { Hono } from "hono";
import type { Env } from "@/types";
import { rateLimiter, tierBasedRateLimiter } from "@/middleware/rateLimit";
import { askQuestionsHandler } from "@/handlers/askQuestions.handler";
import { requireAuth } from "@/middleware/auth";

export const aiRouter = new Hono<Env>();

const ipRateLimiter = rateLimiter({
	capacity: 100,
	windowSecond: 60,
});

aiRouter.post("/test/ratelimit", ipRateLimiter, async (c) => {
	const ip = c.req.header("CF-Connecting-IP") || "unknown";

	return c.json({
		ip: ip,
		pathname: new URL(c.req.url).pathname,
	});
});

/**
 * POST /ask - AI-powered natural language to SQL query endpoint
 * Uses tier-based rate limiting that adjusts limits based on user's subscription
 */
aiRouter.post("/ask", requireAuth, tierBasedRateLimiter(), askQuestionsHandler);
