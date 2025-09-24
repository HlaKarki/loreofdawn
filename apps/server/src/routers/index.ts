import { router } from "@/lib/trpc";
import { testRouter } from "@/routers/testing.router";

export const appRouter = router({
	testRouter,
});
export type AppRouter = typeof appRouter;
