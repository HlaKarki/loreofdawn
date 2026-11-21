import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Env } from "@/types";

export const errorHandler: ErrorHandler<Env> = (error, c) => {
	if (error instanceof HTTPException) {
		return c.json({ error: error.message }, error.status);
	}

	console.error("Error:", error);
	return c.json({ error: "Internal server error" }, 500);
};
