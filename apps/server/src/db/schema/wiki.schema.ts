import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const wikisTable = pgTable("wikis", {
	id: uuid("id").defaultRandom().primaryKey(),
	hero: text("hero").notNull().unique(),
	markdown: text("markdown").notNull(),
	json: jsonb("json"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}).enableRLS();

export type WikiType = typeof wikisTable.$inferSelect;
