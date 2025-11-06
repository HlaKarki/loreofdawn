import { createDb } from "@/db";
import { userSchemaType, usersTable } from "@repo/database";
import { eq } from "drizzle-orm";
import { Logger } from "@repo/utils";

export class UserService {
	private readonly connectionString: string;

	constructor(connectionString: string) {
		this.connectionString = connectionString;
	}

	/**
	 * Create a new user in the database
	 */
	async createUser(data: userSchemaType) {
		const db = createDb(this.connectionString);
		const now = Date.now();

		try {
			const [user] = await db
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
		const db = createDb(this.connectionString);

		try {
			const [user] = await db
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
		const db = createDb(this.connectionString);

		try {
			const [user] = await db
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
		const db = createDb(this.connectionString);

		try {
			const [user] = await db
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
}
