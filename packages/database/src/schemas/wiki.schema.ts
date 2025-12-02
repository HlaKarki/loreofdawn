import {
	bigint,
	doublePrecision,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { WikiMetadata, type AiMarkdownResponse } from "../types/wiki.types";

export const wikisTable = pgTable("wikis", {
	id: uuid("id").defaultRandom().primaryKey(),
	hero: text("hero").notNull().unique(),
	urlName: text("urlName").notNull().unique(),
	markdown: text("markdown").notNull(),
	sections: jsonb("sections").$type<AiMarkdownResponse>().notNull(),
	metadata: jsonb("metadata").$type<WikiMetadata>().notNull(),
	lastUpdated: bigint("last_updated", { mode: "number" }),
}).enableRLS();

export const wikiAnalyticsTable = pgTable("wiki_analytics", {
	id: uuid("id").defaultRandom().primaryKey(),
	hero: text("hero")
		.notNull()
		.unique()
		.references(() => wikisTable.hero),

	// Engagement metrics
	viewCount: integer("view_count").notNull().default(0),
	uniqueViewers: integer("unique_viewers").notNull().default(0),
	averageReadTime: integer("average_read_time").notNull().default(0), // seconds
	completionRate: doublePrecision("completion_rate").notNull().default(0), // 0-1

	// Ratings
	upvotes: integer("upvotes").notNull().default(0),
	downvotes: integer("downvotes").notNull().default(0),
	rating: doublePrecision("rating").notNull().default(0), // calculated

	// Trending
	viewsLast7Days: integer("views_last_7_days").notNull().default(0),
	viewsLast30Days: integer("views_last_30_days").notNull().default(0),
	trendingScore: doublePrecision("trending_score").notNull().default(0),

	// Timestamps
	lastViewed: bigint("last_viewed", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
}).enableRLS();

export type WikiTableType = typeof wikisTable.$inferSelect;
export type WikiAnalyticsTableType = typeof wikiAnalyticsTable.$inferSelect;
