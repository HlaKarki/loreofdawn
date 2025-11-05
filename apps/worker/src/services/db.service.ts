import { createDb } from "@/db";
import { sql } from "drizzle-orm";

export const DbService = {
	executeSqlQuery: async (sqlQuery: string, connectionString: string) => {
		const db = createDb(connectionString);
		try {
			return await db.execute(sql.raw(sqlQuery));
		} catch (error) {
			console.error("DB Execute error:", error);
			return { error };
		}
	},
};
