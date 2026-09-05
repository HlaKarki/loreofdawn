import type {
	MlFetchCategory,
	MlGraphApiRecord,
	MlHeroApiRecord,
	MlHeroListApiRecord,
	MlMatchupApiRecord,
	MlMetaApiRecord,
	MlRequestPayload,
} from "@repo/database";
import { MlApiError, type MlSyncEnv } from "./types";

export type MlRecordFilter = { hero_id?: number; counter: boolean; rank: 9 | 101 };

type MlResponse<T> = { code: number; message: string; data: { records: T[] } };

export class MlApiClient {
	private readonly MAX_HERO_ASSUMPTION = 150;

	constructor(private readonly env: MlSyncEnv) {}

	private endpointUrl(type: MlFetchCategory) {
		const secondId = {
			hero: this.env.ML_SECOND_ID_HERO,
			matchup: this.env.ML_SECOND_ID_MATCHUP,
			meta: this.env.ML_SECOND_ID_META,
			graph: this.env.ML_SECOND_ID_GRAPH,
		}[type];
		return `${this.env.ML_BASE_URL}${this.env.ML_FIRST_ID}/${secondId}`;
	}

	private buildRequestPayload(
		pageSize: number,
		opts?: { filter?: Partial<MlRecordFilter>; fields?: string[] },
	) {
		const body: MlRequestPayload = { pageSize };
		const filter = opts?.filter;
		const filters: NonNullable<MlRequestPayload["filters"]> = [];

		if (filter) {
			if (filter.hero_id) {
				filters.push({
					field: filter.counter !== undefined ? "main_heroid" : "hero_id",
					operator: "eq",
					value: filter.hero_id,
				});
			}
			if ("counter" in filter) {
				filters.push({ field: "match_type", operator: "eq", value: filter.counter ? 0 : 1 });
			}
			if ("rank" in filter) {
				filters.push({ field: "bigrank", operator: "eq", value: filter.rank ?? 9 });
			}
		}

		if (filters.length) body.filters = filters;
		if (opts?.fields) body.fields = opts.fields;

		return JSON.stringify(body);
	}

	private async post<T>(type: MlFetchCategory, body: string): Promise<T[]> {
		const url = this.endpointUrl(type);
		const response = await fetch(url, { method: "POST", body });
		if (!response.ok) throw new MlApiError(type, response.status);

		let json: MlResponse<T>;
		try {
			json = (await response.json()) as MlResponse<T>;
		} catch {
			throw new MlApiError(type, response.status);
		}
		if (json.code !== 0) throw new MlApiError(type, response.status, json.code);

		return json.data?.records ?? [];
	}

	listHeroes() {
		return this.post<MlHeroListApiRecord>(
			"hero",
			this.buildRequestPayload(this.MAX_HERO_ASSUMPTION, {
				fields: ["data.hero.data.name", "data.hero.data.heroid"],
			}),
		);
	}

	fetchAllHeroRecords() {
		return this.post<MlHeroApiRecord>("hero", this.buildRequestPayload(this.MAX_HERO_ASSUMPTION));
	}

	fetchMatchupRecords(filter: MlRecordFilter) {
		return this.post<MlMatchupApiRecord>(
			"matchup",
			this.buildRequestPayload(this.MAX_HERO_ASSUMPTION, { filter }),
		);
	}

	fetchMetaRecords(filter: MlRecordFilter) {
		return this.post<MlMetaApiRecord>(
			"meta",
			this.buildRequestPayload(this.MAX_HERO_ASSUMPTION, { filter }),
		);
	}

	fetchGraphRecords(filter: MlRecordFilter) {
		return this.post<MlGraphApiRecord>(
			"graph",
			this.buildRequestPayload(this.MAX_HERO_ASSUMPTION, { filter }),
		);
	}
}
