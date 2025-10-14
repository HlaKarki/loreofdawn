import { Hono } from "hono";
import type { Env } from "@/types";

export const metaRouter = new Hono<Env>();

/**
 * Placeholder for meta endpoints
 * TODO: Implement meta-specific routes here
 */
metaRouter.get("/", (c) => {
	return c.json({
		message: "Meta API - Coming soon",
	});
});
