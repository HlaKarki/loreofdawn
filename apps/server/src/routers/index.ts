import { router } from "@/lib/trpc";
import { testRouter } from "@/routers/testing.router";
import { scrape } from "@/routers/scrape.router";

export const appRouter = router({
	testRouter,
	scrape,
});
export type AppRouter = typeof appRouter;
