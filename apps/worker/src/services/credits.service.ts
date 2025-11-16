import { usersTable, getTierConfig, type userTableTier } from "@repo/database";
import { eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class CreditService {
	private readonly db: PostgresJsDatabase;

	constructor(db: PostgresJsDatabase) {
		this.db = db;
	}

	/**
	 * Atomically check and deduct 1 credit from user's balance
	 * @throws Error if user has insufficient credits
	 * @returns Updated credits_remaining
	 */
	async useCredit(clerkUserId: string): Promise<{ credits_remaining: number }> {
		// Atomic check-and-deduct using UPDATE with WHERE clause
		const [result] = await this.db
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
		const [user] = await this.db
			.select({ credits_remaining: usersTable.credits_remaining })
			.from(usersTable)
			.where(eq(usersTable.clerk_user_id, clerkUserId))
			.limit(1);

		return user ? user.credits_remaining >= 1 : false;
	}

	/**
	 * Allocate credits to a user based on their tier
	 * Used for subscription renewals and tier upgrades
	 */
	async allocateCredits(
		clerkUserId: string,
		amount: number,
	): Promise<{ credits_remaining: number; credits_total: number }> {
		const now = Date.now();
		const resetAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days from now

		const [result] = await this.db
			.update(usersTable)
			.set({
				credits_remaining: amount,
				credits_total: amount,
				credits_reset_at: resetAt,
				updatedAt: now,
			})
			.where(eq(usersTable.clerk_user_id, clerkUserId))
			.returning({
				credits_remaining: usersTable.credits_remaining,
				credits_total: usersTable.credits_total,
			});

		if (!result) {
			throw new Error("User not found");
		}

		return result;
	}

	/**
	 * Reset credits based on user's tier (for subscription renewals)
	 */
	async resetCreditsForTier(clerkUserId: string, tier: userTableTier): Promise<{
		credits_remaining: number;
		credits_total: number;
	}> {
		const tierConfig = getTierConfig(tier);
		return await this.allocateCredits(clerkUserId, tierConfig.credits_monthly);
	}

	/**
	 * Get user's credit balance
	 */
	async getCreditBalance(clerkUserId: string): Promise<{
		credits_remaining: number;
		credits_total: number;
		credits_reset_at: number;
	} | null> {
		const [user] = await this.db
			.select({
				credits_remaining: usersTable.credits_remaining,
				credits_total: usersTable.credits_total,
				credits_reset_at: usersTable.credits_reset_at,
			})
			.from(usersTable)
			.where(eq(usersTable.clerk_user_id, clerkUserId))
			.limit(1);

		return user || null;
	}
}
