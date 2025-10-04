import { router } from "@/lib/trpc";
import { scrape } from "@/routers/scrape.router";
import { dbRouter } from "@/routers/db.router";
import { persist } from "@/routers/persist.router";

export const appRouter = router({
	scrape,
	dbRouter,
	persist,
});
export type AppRouter = typeof appRouter;
