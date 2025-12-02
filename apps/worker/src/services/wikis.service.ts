import { createDb } from "@/db";
import { Bindings } from "@/types";
import { wikisTable } from "@repo/database";
import { ilike } from "drizzle-orm";

export class WikiService {
	private db: ReturnType<typeof createDb>;

	constructor(private env: Bindings) {
		this.db = createDb(env.HYPERDRIVE.connectionString);
	}

	async getHeroWiki(name: string) {
		const [response] = await this.db
			.select()
			.from(wikisTable)
			.where(ilike(wikisTable.hero, name))
			.limit(1);

		if (!response) {
			throw new Error("Hero not found");
		}

		return {
			...response,
		};
	}

	async getAllWikis() {
		const wikis = await this.db
			.select({
				hero: wikisTable.hero,
				urlName: wikisTable.urlName,
				metadata: wikisTable.metadata,
				lastUpdated: wikisTable.lastUpdated,
			})
			.from(wikisTable);

		return wikis;
	}
}
