import { hero_ids, type HeroIdKey } from "@/data/ml/hero_ids";
import type {
	fetch_type,
	RawGraphTypeML,
	RawMatchupTypeML,
	RawMetaTypeML,
	request_body_type,
} from "@/types/ml.types";
import type { RawHeroTypeML } from "@/types/ml.types";

class MlService {
	private readonly MAX_HERO_ASSUMPTION = 150;
	private readonly BASE_URL = process.env.ML_BASE_URL;
	private readonly FIRST_ID = process.env.ML_FIRST_ID ?? "0";
	private readonly SECOND_ID_HERO = process.env.ML_SECOND_ID_HERO ?? "0";
	private readonly SECOND_ID_MATCHUP = process.env.ML_SECOND_ID_MATCHUP ?? "0";
	private readonly SECOND_ID_META = process.env.ML_SECOND_ID_META ?? "0";
	private readonly SECOND_ID_GRAPH = process.env.ML_SECOND_ID_GRAPH ?? "0";

	buildUrl(type: fetch_type) {
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

	buildBody(
		page_size: number = 5,
		opts?: {
			filter?: { hero_name?: HeroIdKey; counter?: boolean; rank?: 9 | 101 };
		},
	) {
		let body: request_body_type = { pageSize: page_size };
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

	async getGraphData(opts?: { hero?: HeroIdKey; counter: boolean; rank: 9 | 101 }) {
		const body = this.buildBody(this.MAX_HERO_ASSUMPTION, {
			filter: { counter: opts?.counter, hero_name: opts?.hero, rank: opts?.rank },
		});

		const response = await fetch(this.buildUrl("graph"), {
			method: "POST",
			body: body,
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: RawGraphTypeML[] };
		};
	}

	async getMetaData(opts?: { hero?: HeroIdKey; counter: boolean; rank: 9 | 101 }) {
		const body = this.buildBody(this.MAX_HERO_ASSUMPTION, {
			filter: { counter: opts?.counter, hero_name: opts?.hero, rank: opts?.rank },
		});

		const response = await fetch(this.buildUrl("meta"), {
			method: "POST",
			body: body,
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: RawMetaTypeML[] };
		};
	}

	async getHeroMatchUps(opts?: { hero?: HeroIdKey; counter: boolean; rank: 9 | 101 }) {
		const body = this.buildBody(this.MAX_HERO_ASSUMPTION, {
			filter: { counter: opts?.counter, hero_name: opts?.hero, rank: opts?.rank },
		});

		const response = await fetch(this.buildUrl("matchup"), {
			method: "POST",
			body: body,
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: RawMatchupTypeML[] };
		};
	}

	async getHeroInfo(hero: HeroIdKey) {
		const response = await fetch(this.buildUrl("hero"), {
			method: "POST",
			body: this.buildBody(undefined, { filter: { hero_name: hero } }),
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: RawHeroTypeML[] };
		};
	}

	async getAllHeroInfo() {
		const response = await fetch(this.buildUrl("hero"), {
			method: "POST",
			body: this.buildBody(this.MAX_HERO_ASSUMPTION),
		});

		return (await response.json()) as {
			code: number;
			message: string;
			data: { records: RawHeroTypeML[] };
		};
	}
}

export const mlService = new MlService();
