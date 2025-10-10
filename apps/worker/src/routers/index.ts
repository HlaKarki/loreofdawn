import { router } from "@/lib/trpc";
import { mlData } from "./ml-data.router";

export const appRouter = router({
	mlData,
});

export type AppRouter = typeof appRouter;