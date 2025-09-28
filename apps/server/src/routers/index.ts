import { router } from "@/lib/trpc";
import { testRouter } from "@/routers/testing.router";
import { scrape } from "@/routers/scrape.router";
import { dbRouter } from "@/routers/db.router";

export const appRouter = router({
	testRouter,
	scrape,
	dbRouter,
});
export type AppRouter = typeof appRouter;
