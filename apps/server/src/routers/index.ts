import { router } from "@/lib/trpc";
import { scrape } from "@/routers/scrape.router";
import { dbRouter } from "@/routers/db.router";

export const appRouter = router({
	scrape,
	dbRouter,
});
export type AppRouter = typeof appRouter;
