import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Authentication required",
			cause: "No session",
		});
	}
	return next({
		ctx: {
			...ctx,
			session: ctx.session,
		},
	});
});

export const workerProcedure = t.procedure.use(({ ctx, next }) => {
	const authHeader = ctx.headers.get("authorization");
	const token = authHeader?.replace("Bearer ", "");

	if (!token || token !== process.env.WORKER_SECRET_TOKEN) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Invalid worker token",
		});
	}

	return next({ ctx });
});
