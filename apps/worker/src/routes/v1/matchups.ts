import { Hono } from "hono";
import type { Env } from "@/types";

export const matchupsRouter = new Hono<Env>();

/**
 * Placeholder for matchup endpoints
 * TODO: Implement matchup-specific routes here
 */
matchupsRouter.get("/", (c) => {
	return c.json({
		message: "Matchups API - Coming soon",
	});
});
