import { Hono } from "hono";
import { v1Router } from "./v1";
import type { Env } from "@/types";

export const apiRouter = new Hono<Env>();

// Mount versioned API routers
apiRouter.route("/v1", v1Router);

// Health check at root
apiRouter.get("/", (c) =>
	c.json({
		status: "ok",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
	}),
);
