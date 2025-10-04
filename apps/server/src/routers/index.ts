import { router } from "@/lib/trpc";
import { scrape } from "@/routers/scrape.router";
import { dbRouter } from "@/routers/db.router";
import { persist } from "@/routers/persist.router";
import { ml } from "@/routers/ml.router";

export const appRouter = router({
	scrape,
	dbRouter,
	persist,
	ml,
});
export type AppRouter = typeof appRouter;
