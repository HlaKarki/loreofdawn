import {
	heroesListTable,
	heroGraphDataTable,
	heroMatchupTable,
	heroMetaDataTable,
	heroProfileTable,
	type MlGraphData,
	type MlHeroList,
	type MlHeroProfile,
	type MlMatchupSummary,
	type MlMetaSummary,
} from "@repo/database";
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { HeroMap } from "./ml-transform";

const CHUNK_SIZE = 50;

function excluded<T extends PgTable>(table: T, keys: (keyof T["_"]["columns"] & string)[]) {
	const columns = getTableColumns(table);
	const set: Record<string, SQL> = {};
	for (const key of keys) {
		set[key] = sql`excluded.${sql.identifier(columns[key].name)}`;
	}
	return set;
}

function* chunks<T>(rows: T[]) {
	for (let i = 0; i < rows.length; i += CHUNK_SIZE) yield rows.slice(i, i + CHUNK_SIZE);
}

export class MlSyncRepo {
	constructor(private readonly db: PostgresJsDatabase) {}

	async loadHeroMap(): Promise<HeroMap> {
		const rows = await this.db.select().from(heroesListTable);
		return new Map(rows.map((row) => [row.id, row]));
	}

	async upsertHeroList(rows: MlHeroList[]) {
		for (const chunk of chunks(rows)) {
			await this.db
				.insert(heroesListTable)
				.values(chunk)
				.onConflictDoUpdate({
					target: heroesListTable.id,
					set: excluded(heroesListTable, ["display_name", "url_name", "updatedAt"]),
				});
		}
		return rows.length;
	}

	async upsertHeroProfiles(rows: MlHeroProfile[]) {
		for (const chunk of chunks(rows)) {
			await this.db
				.insert(heroProfileTable)
				.values(chunk)
				.onConflictDoUpdate({
					target: heroProfileTable.id,
					set: excluded(heroProfileTable, [
						"updatedAt",
						"images",
						"difficulty",
						"skills",
						"lanes",
						"roles",
						"speciality",
						"tagline",
						"tale",
						"relation",
						"source_link",
					]),
				});
		}
		return rows.length;
	}

	async upsertMatchups(rows: MlMatchupSummary[], isCounter: boolean) {
		const sides = isCounter
			? (["best_counter", "worst_counter"] as const)
			: (["most_compatible", "least_compatible"] as const);
		for (const chunk of chunks(rows)) {
			await this.db
				.insert(heroMatchupTable)
				.values(chunk)
				.onConflictDoUpdate({
					target: [heroMatchupTable.id, heroMatchupTable.rank],
					set: excluded(heroMatchupTable, ["updatedAt", ...sides]),
				});
		}
		return rows.length;
	}

	async upsertMetas(rows: MlMetaSummary[]) {
		for (const chunk of chunks(rows)) {
			await this.db
				.insert(heroMetaDataTable)
				.values(chunk)
				.onConflictDoUpdate({
					target: [heroMetaDataTable.id, heroMetaDataTable.rank],
					set: excluded(heroMetaDataTable, ["updatedAt", "pick_rate", "ban_rate", "win_rate"]),
				});
		}
		return rows.length;
	}

	async upsertGraphs(rows: MlGraphData[]) {
		for (const chunk of chunks(rows)) {
			await this.db
				.insert(heroGraphDataTable)
				.values(chunk)
				.onConflictDoUpdate({
					target: [heroGraphDataTable.id, heroGraphDataTable.rank],
					set: excluded(heroGraphDataTable, ["updatedAt", "trend_start", "trend_end", "points"]),
				});
		}
		return rows.length;
	}
}
