import path from "node:path";
import fs from "node:fs";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { heroesListTable, wikisTable } from "@repo/database";

class DbService {
	async uploadMarkdown(hero: string) {
		const markdown_path = path.join(
			process.cwd(),
			"src",
			"data",
			"wiki",
			"markdowns",
			`${hero.toLowerCase()}.md`,
		);
		const json_path = path.join(
			process.cwd(),
			"src",
			"data",
			"wiki",
			"jsons",
			`${hero.toLowerCase()}.json`,
		);

		if (!fs.existsSync(json_path) || !fs.existsSync(markdown_path)) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: `Markdown for ${hero} not found.`,
			});
		}

		const json = await fs.promises.readFile(json_path, "utf8");
		const content = await fs.promises.readFile(markdown_path, "utf8");

		// upload to wikis table.
		return db
			.insert(wikisTable)
			.values({
				hero: hero.toLowerCase(),
				markdown: content,
				json: json,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: wikisTable.hero,
				set: { markdown: content, json: json, updatedAt: new Date() },
			})
			.returning({ id: wikisTable.id });
	}

	async fetchMarkdown(hero: string) {
		return db.select().from(wikisTable).where(eq(wikisTable.hero, hero.toLowerCase())).limit(1);
	}

	async fetchHeroList() {
		return db.select().from(heroesListTable);
	}
}

export const dbService = new DbService();
