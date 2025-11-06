import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const DbService = {
	executeSqlQuery: async (sqlQuery: string, db: PostgresJsDatabase) => {
		try {
			return await db.execute(sql.raw(sqlQuery));
		} catch (error) {
			console.error("DB Execute error:", error);
			return { error };
		}
	},
};
