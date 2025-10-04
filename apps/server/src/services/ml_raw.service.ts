import type {
	MlFetchCategory,
	MlGraphApiRecord,
	MlHeroApiRecord,
	MlMatchupApiRecord,
	MlMetaApiRecord,
	MlRequestPayload,
} from "@/types/ml.types";
import { hero_ids, type HeroNameKey } from "@/data/ml/hero_ids";

class MlRawService {
	private readonly MAX_HERO_ASSUMPTION = 150;
	private readonly BASE_URL = process.env.ML_BASE_URL;
	private readonly FIRST_ID = process.env.ML_FIRST_ID ?? "0";
	private readonly SECOND_ID_HERO = process.env.ML_SECOND_ID_HERO ?? "0";
	private readonly SECOND_ID_MATCHUP = process.env.ML_SECOND_ID_MATCHUP ?? "0";
	private readonly SECOND_ID_META = process.env.ML_SECOND_ID_META ?? "0";
	private readonly SECOND_ID_GRAPH = process.env.ML_SECOND_ID_GRAPH ?? "0";

	private buildEndpointUrl(type: MlFetchCategory) {
		let second_id = "";

		switch (type) {
			case "hero":
				second_id = this.SECOND_ID_HERO;
				break;
			case "matchup":
				second_id = this.SECOND_ID_MATCHUP;
				break;
			case "meta":
				second_id = this.SECOND_ID_META;
				break;
			case "graph":
				second_id = this.SECOND_ID_GRAPH;
		}
		return this.BASE_URL + this.FIRST_ID + "/" + second_id;
	}

	private buildRequestPayload(
		page_size: number = 5,
		opts?: {
			filter?: { hero_name?: HeroNameKey; counter?: boolean; rank?: 9 | 101 };
		},
	) {
		let body: MlRequestPayload = { pageSize: page_size };
		const filter = opts?.filter;
		const field = filter?.counter !== undefined ? "main_heroid" : "hero_id";
		body.filters = [];

		if (filter) {
			if (filter.hero_name) {
				body.filters.push({
					field: field,
					operator: "eq",
					value: hero_ids[filter.hero_name],
				});
			}
			if ("counter" in filter) {
				body.filters.push({
					field: "match_type",
					operator: "eq",
					value: filter.counter ? 0 : 1,
				});
			}
			if ("rank" in filter) {
				body.filters.push({
					field: "bigrank",
					operator: "eq",
					value: filter.rank ?? 9,
				});
			}
		}

		if (!body.filters.length) {
			body.filters = undefined;
		}

		return JSON.stringify(body);
	}
	async fetchGraphRecords(opts?: { hero?: HeroNameKey; counter: boolean; rank: 9 | 101 }) {
		const body = this.buildRequestPayload(this.MAX_HERO_ASSUMPTION, {
			filter: { counter: opts?.counter, hero_name: opts?.hero, rank: opts?.rank },
		});

		const response = await fetch(this.buildEndpointUrl("graph"), {
			method: "POST",
			body: body,
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: MlGraphApiRecord[] };
		};
	}

	async fetchMetaRecords(opts?: { hero?: HeroNameKey; counter?: boolean; rank: 9 | 101 }) {
		const body = this.buildRequestPayload(this.MAX_HERO_ASSUMPTION, {
			filter: { counter: opts?.counter, hero_name: opts?.hero, rank: opts?.rank },
		});

		const response = await fetch(this.buildEndpointUrl("meta"), {
			method: "POST",
			body: body,
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: MlMetaApiRecord[] };
		};
	}

	async fetchMatchupRecords(opts?: { hero?: HeroNameKey; counter: boolean; rank: 9 | 101 }) {
		const body = this.buildRequestPayload(this.MAX_HERO_ASSUMPTION, {
			filter: { counter: opts?.counter, hero_name: opts?.hero, rank: opts?.rank },
		});

		const response = await fetch(this.buildEndpointUrl("matchup"), {
			method: "POST",
			body: body,
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: MlMatchupApiRecord[] };
		};
	}

	async fetchHeroRecord(hero: HeroNameKey) {
		const response = await fetch(this.buildEndpointUrl("hero"), {
			method: "POST",
			body: this.buildRequestPayload(undefined, { filter: { hero_name: hero } }),
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: MlHeroApiRecord[] };
		};
	}

	async fetchAllHeroRecords() {
		const response = await fetch(this.buildEndpointUrl("hero"), {
			method: "POST",
			body: this.buildRequestPayload(this.MAX_HERO_ASSUMPTION),
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: MlHeroApiRecord[] };
		};
	}
}

export const mlRawService = new MlRawService();
