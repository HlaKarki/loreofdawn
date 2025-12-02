import { db } from "@/db";
import { eq } from "drizzle-orm";
import { heroesListTable, wikisTable, type WikiTableData } from "@repo/database";

class DbService {
	async fetchMarkdown(hero: string) {
		return db.select().from(wikisTable).where(eq(wikisTable.hero, hero.toLowerCase())).limit(1);
	}

	async fetchHeroList() {
		return db.select().from(heroesListTable);
	}

	/**
	 * Insert or update wiki data from WikiTableData
	 */
	async insertWiki(wikiData: WikiTableData) {
		return db
			.insert(wikisTable)
			.values({
				hero: wikiData.hero,
				urlName: wikiData.urlName,
				markdown: wikiData.markdown,
				sections: wikiData.sections,
				metadata: wikiData.metadata,
				lastUpdated: wikiData.lastUpdated,
			})
			.onConflictDoUpdate({
				target: wikisTable.hero,
				set: {
					urlName: wikiData.urlName,
					markdown: wikiData.markdown,
					sections: wikiData.sections,
					metadata: wikiData.metadata,
					lastUpdated: wikiData.lastUpdated,
				},
			})
			.returning({ id: wikisTable.id, hero: wikisTable.hero });
	}
}

export const dbService = new DbService();
