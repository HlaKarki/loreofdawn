import { subscriptionStatus, userSchemaType, usersTable, userTableTier } from "@repo/database";
import { eq } from "drizzle-orm";
import { Logger } from "@repo/utils";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export class UserService {
	private readonly db: PostgresJsDatabase;

	constructor(db: PostgresJsDatabase) {
		this.db = db;
	}

	/**
	 * Create a new user in the database
	 */
	async createUser(data: userSchemaType) {
		const now = Date.now();

		try {
			const [user] = await this.db
				.insert(usersTable)
				.values({
					...data,
					createdAt: now,
					updatedAt: now,
				})
				.returning();

			Logger.info("", { message: `${user.id} User created: ${user.clerk_user_id}` });
			return user;
		} catch (error) {
			Logger.error("", { message: `Failed to create user: ${error}` });
			throw error;
		}
	}

	/**
	 * Update an existing user by clerk_user_id
	 */
	async updateUser(
		clerkUserId: string,
		data: {
			email?: string;
			name?: string;
			imageUrl?: string;
		},
	) {
		try {
			const [user] = await this.db
				.update(usersTable)
				.set({
					...data,
					updatedAt: Date.now(),
				})
				.where(eq(usersTable.clerk_user_id, clerkUserId))
				.returning();

			Logger.info("", { message: `User updated in DB: ${user}` });
			return user;
		} catch (error) {
			Logger.error("", { message: `Failed to update user: ${error}` });
			throw error;
		}
	}

	/**
	 * Delete a user by clerk_user_id
	 */
	async deleteUser(clerkUserId: string) {
		try {
			const [user] = await this.db
				.delete(usersTable)
				.where(eq(usersTable.clerk_user_id, clerkUserId))
				.returning();

			Logger.info("", { message: `User deleted from DB: ${user}` });
			return user;
		} catch (error) {
			Logger.error("", { message: `Failed to delete user: ${error}` });
			throw error;
		}
	}

	/**
	 * Get a user by clerk_user_id
	 */
	async getUserByClerkId(clerkUserId: string) {
		try {
			const [user] = await this.db
				.select()
				.from(usersTable)
				.where(eq(usersTable.clerk_user_id, clerkUserId))
				.limit(1);

			return user;
		} catch (error) {
			Logger.error("", { message: `Failed to get user: ${error}` });
			throw error;
		}
	}

	/**
	 * Update user's subscription details
	 */
	async updateSubscription(
		clerkUserId: string,
		data: {
			stripe_customer_id?: string;
			stripe_subscription_id?: string;
			stripe_subscription_status?: subscriptionStatus;
			tier?: userTableTier;
		},
	) {
		try {
			const [user] = await this.db
				.update(usersTable)
				.set({
					...data,
					updatedAt: Date.now(),
				})
				.where(eq(usersTable.clerk_user_id, clerkUserId))
				.returning();

			Logger.info("", { message: `Subscription updated for user: ${user.id}` });
			return user;
		} catch (error) {
			Logger.error("", { message: `Failed to update subscription: ${error}` });
			throw error;
		}
	}
}
