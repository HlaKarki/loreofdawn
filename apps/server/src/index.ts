import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "./lib/context";
import { appRouter } from "@/routers";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

const allowedOrigins = [
	"http://localhost:1201",
	"https://loreofdawn.com",
	"https://www.loreofdawn.com",
	process.env.CORS_ORIGIN,
];

app.use(
	"/*",
	cors({
		origin: (origin) => {
			if (!origin) return allowedOrigins[0]; // Default for non-browser requests
			return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

if (import.meta.main) {
	const port = Number(Bun.env.PORT ?? process.env.PORT ?? 3000);
	Bun.serve({
		fetch: app.fetch.bind(app),
		idleTimeout: 60 * 3,
		port,
	});
}

export { app };
