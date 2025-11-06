import { bigint, index, pgTable, integer, serial, text } from "drizzle-orm/pg-core";
import { userTableTier } from "../types/users.types";

export const usersTable = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		clerk_user_id: text("clerk_user_id").unique(),
		name: text("name").notNull(),
		imageUrl: text("imageUrl").notNull(),
		email: text("email").notNull(),
		tier: text("tier").$type<userTableTier>().notNull(),
		credits_remaining: integer("credits_remaining").notNull(),
		credits_total: integer("credits_total").notNull(),
		credits_reset_at: bigint("credits_reset_at", { mode: "number" }).notNull(),
		createdAt: bigint("createdAt", { mode: "number" }).notNull(),
		updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
	},
	(t) => [index("usersTable:clerkUserId").on(t.clerk_user_id)],
).enableRLS();
