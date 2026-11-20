import { Hono } from "hono";
import type { Env } from "@/types";
import { tierBasedRateLimiter } from "@/middleware/rateLimit";
import { askQuestionsHandler } from "@/handlers/askQuestions.handler";
import { requireAuth } from "@/middleware/auth";

export const aiRouter = new Hono<Env>();

/**
 * POST /ask - AI-powered natural language to SQL query endpoint
 * Uses tier-based rate limiting that adjusts limits based on user's subscription
 */
aiRouter.post("/ask", requireAuth, tierBasedRateLimiter(), askQuestionsHandler);
