import { Hono } from "hono";
import type { Env } from "@/types";
import { requireAuth } from "@/middleware/auth";
import { UserService } from "@/services/users.service";
import { createDb } from "@/db";

export const usersRouter = new Hono<Env>();

/**
 *
 * GET /v1/users/me
 */
usersRouter.get("/me", requireAuth, async (c) => {
	const clerkUserId = c.get("clerkUserId");
	if (!clerkUserId) return c.json({ error: "User not found" }, 404);

	const userService = new UserService(createDb(c.env.HYPERDRIVE.connectionString));
	const user = await userService.getUserByClerkId(clerkUserId);
	if (!user) return c.json({ error: "User not found" }, 404);

	return c.json(user);
});
