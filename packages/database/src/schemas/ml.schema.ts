import {
	integer,
	jsonb,
	pgTable,
	text,
	bigint,
	primaryKey,
	index,
	real,
} from "drizzle-orm/pg-core";
import type { MlGraphPoint, MlHeroProfile, MlMatchupSubHeroSummary } from "../types/ml.types";

export const heroProfileTable = pgTable(
	"hero_profiles",
	{
		id: integer("id").notNull().primaryKey(),
		name: text("name").notNull(),
		createdAt: bigint("createdAt", { mode: "number" }).notNull(),
		updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
		images: jsonb("images").$type<MlHeroProfile["images"]>().notNull(),
		difficulty: text("difficulty"),
		skills: jsonb("skills").$type<MlHeroProfile["skills"]>().notNull(),
		lanes: jsonb("lanes").$type<MlHeroProfile["lanes"]>().notNull(),
		roles: jsonb("roles").$type<MlHeroProfile["roles"]>().notNull(),
		speciality: jsonb("speciality").$type<MlHeroProfile["speciality"]>().notNull(),
		tagline: text("tagline"),
		tale: text("tale"),
		relation: jsonb("relation").$type<MlHeroProfile["relation"]>().notNull(),
		source_link: text("source_link"),
	},
	(t) => [index("hero_profile_name_idx").on(t.name)],
).enableRLS();

export const heroMatchupTable = pgTable(
	"hero_matchups",
	{
		id: integer("id").notNull(),
		name: text("name").notNull(),
		rank: text("rank").notNull(),
		most_compatible: jsonb("most_compatible").$type<MlMatchupSubHeroSummary[]>(),
		least_compatible: jsonb("least_compatible").$type<MlMatchupSubHeroSummary[]>(),
		best_counter: jsonb("best_counter").$type<MlMatchupSubHeroSummary[]>(),
		worst_counter: jsonb("worst_counter").$type<MlMatchupSubHeroSummary[]>(),
		updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.id, t.rank] }),
		index("hero_matchup_name_idx").on(t.name),
		index("hero_matchup_rank_idx").on(t.rank),
	],
).enableRLS();

export const heroMetaDataTable = pgTable(
	"hero_metas",
	{
		id: integer("id").notNull(),
		name: text("name").notNull(),
		rank: text("rank").notNull(),
		pick_rate: real("pick_rate").notNull(),
		ban_rate: real("ban_rate").notNull(),
		win_rate: real("win_rate").notNull(),
		updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.id, t.rank] }),
		index("hero_meta_name_idx").on(t.name),
		index("hero_meta_rank_idx").on(t.rank),
	],
).enableRLS();

export const heroGraphDataTable = pgTable(
	"hero_graphs",
	{
		id: integer("id").notNull(),
		name: text("name").notNull(),
		rank: text("rank").notNull(),
		trend_start: text("trend_start"),
		trend_end: text("trend_end"),
		points: jsonb("points").$type<MlGraphPoint[]>(),
		updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
	},
	(t) => [
		primaryKey({ columns: [t.id, t.rank] }),
		index("hero_graph_name_idx").on(t.name),
		index("hero_graph_rank_idx").on(t.rank),
	],
).enableRLS();
