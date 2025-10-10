import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@/routers";
import { createDb } from "@/db";
import { MlDbService } from "@/services/ml-db.service";
import { KvService } from "@/services/kv.service";
import { cacheMiddleware } from "@/middleware/cache.middleware";

type Bindings = {
	HYPERDRIVE: Hyperdrive;
	KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Health check endpoint
app.get("/", (c) => {
	return c.json({ message: "Worker API with Hyperdrive is running!" });
});

// Cache middleware - checks Cache API before tRPC
app.use("/trpc/*", cacheMiddleware);

// tRPC endpoint with Hyperdrive connection
app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (opts, c) => {
			// Get Hyperdrive connection string from binding
			const hyperdriveConnectionString = c.env.HYPERDRIVE.connectionString;

			// Create database connection
			const db = createDb(hyperdriveConnectionString);

			// Create KV service
			const kvService = new KvService(c.env.KV);

			// Create service with db and KV instances
			const mlDbService = new MlDbService(db, kvService);

			return {
				mlDbService,
			};
		},
	}),
);

export default app;