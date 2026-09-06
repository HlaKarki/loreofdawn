import { Hono } from "hono";
import type { Env } from "@/types";
import { createDb } from "@/db";
import { requireSyncToken } from "@/middleware/syncToken";
import { runMlSync } from "@/services/ml-sync/run";

export const internalRouter = new Hono<Env>();

internalRouter.post("/sync", requireSyncToken, async (c) => {
	const run = runMlSync(createDb(c.env.HYPERDRIVE.connectionString), c.env);
	c.executionCtx.waitUntil(run);
	const summary = await run;
	return c.json(summary, summary.ok ? 200 : 500);
});
