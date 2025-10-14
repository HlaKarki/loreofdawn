import { createMiddleware } from "hono/factory";
import type { Env } from "@/types";

/**
 * Global error handling middleware
 * Catches all errors and returns a consistent JSON error response
 */
export const errorHandler = createMiddleware<Env>(async (c, next) => {
	try {
		await next();
	} catch (error) {
		console.error("Error:", error);

		const message = error instanceof Error ? error.message : "Internal server error";
		const status = message === "Hero not found" ? 404 : 500;

		return c.json(
			{
				error: message,
				timestamp: new Date().toISOString(),
			},
			status,
		);
	}
});
