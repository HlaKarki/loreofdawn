import { Hono } from "hono";
import type { Env } from "@/types";
import { clerkWebhookHandler } from "./clerk.webhook";
import { stripeWebhookHandler } from "./stripe.webhook";

export const webhooksRouter = new Hono<Env>();

webhooksRouter.post("/clerk", clerkWebhookHandler);
webhooksRouter.post("/stripe", stripeWebhookHandler);
