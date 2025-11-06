import { createDb } from "@/db";
import { usersTable } from "@repo/database";
import { eq, sql } from "drizzle-orm";

export class CreditService {
	private readonly connectionString: string;

	constructor(connectionString: string) {
		this.connectionString = connectionString;
	}

	/**
	 * Atomically check and deduct 1 credit from user's balance
	 * @throws Error if user has insufficient credits
	 * @returns Updated credits_remaining
	 */
	async useCredit(clerkUserId: string): Promise<{ credits_remaining: number }> {
		const db = createDb(this.connectionString);

		// Atomic check-and-deduct using UPDATE with WHERE clause
		const [result] = await db
			.update(usersTable)
			.set({
				credits_remaining: sql`${usersTable.credits_remaining} - 1`,
				updatedAt: Date.now(),
			})
			.where(
				sql`${usersTable.clerk_user_id} = ${clerkUserId} AND ${usersTable.credits_remaining} >= 1`,
			)
			.returning({ credits_remaining: usersTable.credits_remaining });

		// If no rows updated, user had insufficient credits
		if (!result) {
			throw new Error("Insufficient credits");
		}

		return result;
	}

	/**
	 * Check if user has sufficient credits without deducting
	 */
	async hasCredits(clerkUserId: string): Promise<boolean> {
		const db = createDb(this.connectionString);

		const [user] = await db
			.select({ credits_remaining: usersTable.credits_remaining })
			.from(usersTable)
			.where(eq(usersTable.clerk_user_id, clerkUserId))
			.limit(1);

		return user ? user.credits_remaining >= 1 : false;
	}
}
