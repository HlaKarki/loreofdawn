import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { MlApiClient } from "./ml-api.client";
import { MlSyncRepo } from "./ml-sync.repo";
import {
	normalizeGraphData,
	normalizeHeroList,
	normalizeHeroProfiles,
	normalizeMatchupSummaries,
	normalizeMetaSummaries,
	type HeroMap,
} from "./ml-transform";
import type { MlSyncEnv, MlSyncStage, MlSyncSummary } from "./types";

const RANKS = [9, 101] as const;

function describeError(error: unknown): string {
	if (!(error instanceof Error)) return String(error);
	const cause = error.cause instanceof Error ? error.cause.message : undefined;
	const head = error.message.split("\n")[0].slice(0, 200);
	return cause ? `${head} — cause: ${cause}` : head;
}
const RANK_LABEL = { 9: "glory", 101: "overall" } as const;

export async function runMlSync(db: PostgresJsDatabase, env: MlSyncEnv): Promise<MlSyncSummary> {
	const startedAt = new Date();
	const api = new MlApiClient(env);
	const repo = new MlSyncRepo(db);
	const stages: MlSyncStage[] = [];

	const stage = async (name: string, work: () => Promise<number>) => {
		try {
			const rows = await work();
			stages.push({ name, rows });
			console.log(`[ml-sync] ${name}: ${rows} rows`);
			return true;
		} catch (error) {
			const message = describeError(error);
			stages.push({ name, rows: 0, error: message });
			console.error(`[ml-sync] ${name} failed: ${message}`);
			return false;
		}
	};

	let heroMap: HeroMap = new Map();
	const listOk = await stage("heroList", async () => {
		const rows = normalizeHeroList(await api.listHeroes());
		await repo.upsertHeroList(rows);
		heroMap = await repo.loadHeroMap();
		return rows.length;
	});

	if (listOk) {
		await stage("profiles", async () =>
			repo.upsertHeroProfiles(normalizeHeroProfiles(await api.fetchAllHeroRecords(), heroMap)),
		);

		for (const rank of RANKS) {
			for (const counter of [true, false]) {
				await stage(`matchups:${RANK_LABEL[rank]}:${counter ? "counter" : "compat"}`, async () =>
					repo.upsertMatchups(
						normalizeMatchupSummaries(
							await api.fetchMatchupRecords({ rank, counter }),
							counter,
							heroMap,
						),
						counter,
					),
				);
			}
		}

		for (const rank of RANKS) {
			await stage(`metas:${RANK_LABEL[rank]}`, async () =>
				repo.upsertMetas(
					normalizeMetaSummaries(await api.fetchMetaRecords({ rank, counter: true }), heroMap),
				),
			);
		}

		for (const rank of RANKS) {
			await stage(`graphs:${RANK_LABEL[rank]}`, async () =>
				repo.upsertGraphs(
					normalizeGraphData(await api.fetchGraphRecords({ rank, counter: true }), heroMap),
				),
			);
		}
	}

	return {
		startedAt: startedAt.toISOString(),
		durationMs: Date.now() - startedAt.getTime(),
		ok: stages.every((s) => !s.error),
		stages,
	};
}
