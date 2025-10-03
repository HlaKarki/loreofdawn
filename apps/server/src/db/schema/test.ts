import {pgTable, serial, text} from "drizzle-orm/pg-core";

export const testTable = pgTable("test", {
  id: serial("id").primaryKey(),
  name: text("name").notNull()
}).enableRLS();

export type Test = typeof testTable.$inferSelect
