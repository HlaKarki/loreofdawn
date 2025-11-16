import { Hono } from "hono";
import { v1Router } from "./v1";
import type { Env } from "@/types";
import { webhooksRouter } from "./webhooks/webhooks";

export const apiRouter = new Hono<Env>();

// versioned routes
apiRouter.route("/v1", v1Router);

// webhook routes (clerk)
apiRouter.route("/webhooks", webhooksRouter);

apiRouter.get("/", (c) =>
	c.json({
		status: "ok",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
	}),
);
