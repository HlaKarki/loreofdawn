import { initTRPC } from "@trpc/server";
import type { MlDbService } from "@/services/ml-db.service";

interface Context {
	mlDbService: MlDbService;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;