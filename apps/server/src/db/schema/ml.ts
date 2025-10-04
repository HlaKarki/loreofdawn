import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const heroTable = pgTable("heroes", {
	id: integer("id").notNull().primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();

export type WikiType = typeof heroTable.$inferSelect;
