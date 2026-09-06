import { createMiddleware } from "hono/factory";
import type { Env } from "@/types";

export const requireSyncToken = createMiddleware<Env>(async (c, next) => {
	const token = c.req.header("Authorization")?.replace("Bearer ", "");
	if (!c.env.SYNC_SECRET_TOKEN || token !== c.env.SYNC_SECRET_TOKEN) {
		return c.json({ error: "unauthorized" }, 401);
	}
	await next();
});
