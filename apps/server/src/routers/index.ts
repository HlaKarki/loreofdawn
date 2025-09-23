import { protectedProcedure, publicProcedure, router } from "@/lib/trpc";
import { testRouter } from "@/routers/testing.router";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	testRouter,
});
export type AppRouter = typeof appRouter;
