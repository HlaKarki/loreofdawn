import { createMiddleware } from "hono/factory";
import { Env } from "@/types";
import { verifyToken } from "@clerk/backend";

export const requireAuth = createMiddleware<Env>(async (c, next) => {
	// Skip auth for OPTIONS requests (CORS preflight)
	if (c.req.method === "OPTIONS") {
		return next();
	}

	const token = c.req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		return c.json(
			{
				error: "Authentication required",
				message: "Sign in to use AI features",
			},
			401,
		);
	}
	try {
		const payload = await verifyToken(token, {
			secretKey: c.env.CLERK_SECRET_KEY,
		});

		const userId = payload.sub;

		if (!userId) {
			return c.json({ error: "invalid token" }, 401);
		}

		c.set("clerkUserId", userId);
		await next();
	} catch (error) {
		return c.json(
			{
				error: "Invalid token",
				details: error instanceof Error ? error.message : "Token verification failed",
			},
			401,
		);
	}
});
