import { router } from "@/lib/trpc";
import { scrape } from "@/routers/scrape.router";
import { dbRouter } from "@/routers/db.router";
import { mlSync } from "@/routers/ml-sync.router";
import { mlData } from "@/routers/ml-data.router";

export const appRouter = router({
	scrape,
	dbRouter,
	mlSync,
	mlData,
});
export type AppRouter = typeof appRouter;
