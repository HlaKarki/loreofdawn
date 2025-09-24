import { publicProcedure, router } from "@/lib/trpc";
import { z } from "zod";
import { db } from "@/db";
import { testTable } from "@/db/schema/test";

export const testRouter = router({
	testing: publicProcedure.query(async () => {
		return "hello, world!";
	}),
	pullDB: publicProcedure
		.input(
			z.object({
				name: z.string(),
			}),
		)
		.mutation(async () => {
			const rows = await db.select().from(testTable);
			return {
				rows,
			};
		}),
	insertDB: publicProcedure
		.input(
			z.object({
				name: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			// insert into db test table
			const [id] = await db
				.insert(testTable)
				.values({ name: input.name })
				.returning({ id: testTable.id });
			return id;
		}),
});
