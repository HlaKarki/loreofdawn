import { Hono } from "hono";
import type { Env } from "@/types";
import { tierBasedRateLimiter } from "@/middleware/rateLimit";
import { askQuestionsHandler } from "@/handlers/askQuestions.handler";
import { requireAuth } from "@/middleware/auth";

export const aiRouter = new Hono<Env>();

aiRouter.post("/ask", requireAuth, tierBasedRateLimiter(), askQuestionsHandler);
