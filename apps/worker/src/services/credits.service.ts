import { createDb } from "@/db";
import { usersTable } from "@repo/database";
import { eq, sql } from "drizzle-orm";

export class CreditService {
	private readonly connectionString: string;

	constructor(connectionString: string) {
		this.connectionString = connectionString;
	}

	async useCredit(clerkUserId: string, ...opts: any) {
		const db = createDb(this.connectionString);

		await db.transaction(async (tx) => {
			await tx
				.update(usersTable)
				.set({ credits_remaining: sql`${usersTable.credits_remaining} - 1.00` })
				.where(eq(usersTable.clerk_user_id, clerkUserId));
		});

		const [account] = await db
			.select({ credits_remaining: usersTable.credits_remaining })
			.from(usersTable)
			.where(eq(usersTable.clerk_user_id, clerkUserId))
			.limit(1);

		return account;
	}
}
