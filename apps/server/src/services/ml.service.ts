import { hero_ids, hero_names, type HeroIdKey } from "@/data/ml/hero_ids";
import type {
	fetch_type,
	HeroTypeML,
	MatchupTypeML,
	MetaTypeMl,
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

	private buildUrl(type: fetch_type) {
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

	private buildBody(
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

	private parseCDMana(s: string) {
		// normalize spacing
		const text = s.replace(/\s+/g, " ").trim();

		// regex to capture "CD: <num>" and "Mana Cost: <num>"
		const cdMatch = text.match(/CD:\s*(\d+)/i);
		const manaMatch = text.match(/Mana\s*Cost:\s*(\d+)/i);

		return {
			cd: cdMatch ? parseInt(cdMatch[1], 10) : null,
			mana: manaMatch ? parseInt(manaMatch[1], 10) : null,
		};
	}

	private mapRelation = (
		relation?: RawHeroTypeML["data"]["relation"]["assist"],
	): HeroTypeML["relation"]["compatible_with"] => {
		if (!relation) {
			return [];
		}

		const ids = relation.target_hero_id ?? [];
		const targets = relation.target_hero ?? [];
		const heroes: { id: number; name: string; image: string }[] = [];

		for (let index = 0; index < targets.length; index++) {
			const rawId = ids[index];
			if (!rawId) {
				continue;
			}

			const numericId = Number(rawId);
			if (Number.isNaN(numericId)) {
				continue;
			}

			const key = rawId as keyof typeof hero_names;
			heroes.push({
				id: numericId,
				name: hero_names[key] ?? String(rawId),
				image: targets[index]?.data?.head ?? "",
			});
		}

		return heroes.length
			? [
					{
						description: relation.desc ?? "",
						heroes,
					},
				]
			: [];
	};

	private normalizeHeroData(raw: RawHeroTypeML[]): HeroTypeML[] {
		return raw.map((hero) => {
			const heroData = hero.data.hero.data;
			const relation = hero.data.relation;

			const skills = (heroData.heroskilllist ?? [])
				.flatMap((group) => group?.skilllist ?? [])
				.map((skill) => {
					const { cd, mana } = this.parseCDMana(skill["skillcd&cost"] ?? "");
					return {
						cd: cd ?? 0,
						mana: mana ?? 0,
						description: skill.skilldesc ?? "",
						icon: skill.skillicon ?? "",
						name: skill.skillname ?? "",
						tags: (skill.skilltag ?? []).map((tag) => tag.tagname),
					};
				});

			const lane = (heroData.roadsort ?? []).map((entry) => ({
				icon: entry?.data?.road_sort_icon ?? "",
				title: entry?.data?.road_sort_title ?? "",
			}));

			const roles = (heroData.sortid ?? []).map((entry) => ({
				icon: entry?.data?.sort_icon ?? "",
				title: entry?.data?.sort_title ?? "",
			}));

			return {
				id: hero.data.hero_id,
				name: heroData.name,
				createdAt: hero.createdAt,
				updatedAt: hero.updatedAt,
				images: {
					head: hero.data.head,
					head_big: hero.data.head_big,
					painting: heroData.painting,
					smallmap: heroData.smallmap,
					squarehead: heroData.squarehead,
					squarehead_big: heroData.squareheadbig,
				},
				difficulty: heroData.difficulty,
				skills,
				lane,
				roles,
				speciality: heroData.speciality ?? [],
				tagline: heroData.story,
				tale: heroData.tale,
				relation: {
					compatible_with: this.mapRelation(relation?.assist),
					strong_against: this.mapRelation(relation?.strong),
					weak_against: this.mapRelation(relation?.weak),
				},
				source_link: hero.data.url,
			};
		});
	}

	private mapSubHeroes(
		heroes?: RawMatchupTypeML["data"]["sub_hero"],
	): MatchupTypeML["most_compatible"] {
		if (!heroes?.length) {
			return [];
		}

		return heroes.map((hero, index) => {
			const heroKey = String(hero.heroid) as keyof typeof hero_names;
			return {
				index: hero.hero_index ?? index,
				id: hero.heroid,
				name: hero_names[heroKey] ?? String(hero.heroid),
				image: hero.hero?.data?.head ?? "",
				pick_rate: hero.hero_appearance_rate,
				win_rate: hero.hero_win_rate,
				increase_win_rate: hero.increase_win_rate,
				min_win_rate6: hero.min_win_rate6,
				min_win_rate6_8: hero.min_win_rate6_8,
				min_win_rate8_10: hero.min_win_rate8_10,
				min_win_rate10_12: hero.min_win_rate10_12,
				min_win_rate12_14: hero.min_win_rate12_14,
				min_win_rate14_16: hero.min_win_rate14_16,
				min_win_rate16_18: hero.min_win_rate16_18,
				min_win_rate18_20: hero.min_win_rate18_20,
				min_win_rate20: hero.min_win_rate20,
			};
		});
	}

	private normalizeMatchupData(raw: RawMatchupTypeML[], isCounter: boolean): MatchupTypeML[] {
		return raw.map((matchup) => {
			const data = matchup.data;
			const primary = this.mapSubHeroes(data.sub_hero);
			const secondary = this.mapSubHeroes(data.sub_hero_last);

			return {
				name: data.main_hero?.data?.name ?? "",
				id: data.main_heroid,
				most_compatible: isCounter ? [] : primary,
				least_compatible: isCounter ? [] : secondary,
				best_counter: isCounter ? secondary : [],
				worst_counter: isCounter ? primary : [],
			};
		});
	}

	private normalizeMetaData(raw?: RawMetaTypeML[] | null): MetaTypeMl[] {
		if (!raw?.length) {
			return [];
		}

		return raw.map((meta) => {
			const data = meta.data;
			const heroId = data.main_heroid;
			const heroKey = String(heroId) as keyof typeof hero_names;
			const fallbackName = hero_names[heroKey] ?? String(heroId);
			const heroName = data.main_hero?.data?.name ?? fallbackName;

			return {
				id: heroId,
				name: heroName,
				pick_rate: data.main_hero_appearance_rate,
				ban_rate: data.main_hero_ban_rate,
				win_rate: data.main_hero_win_rate,
			};
		});
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

	async getHero(opts: { hero: HeroIdKey; rank?: 9 | 101 }) {
		const response = await this.getHeroInfo(opts.hero);

		return this.normalizeHeroData(response.data.records);
	}

	async getHeroMatchupsNormalized(opts: { hero?: HeroIdKey; counter: boolean; rank: 9 | 101 }) {
		const response = await this.getHeroMatchUps(opts);
		return this.normalizeMatchupData(response.data.records, opts.counter);
	}

	async getHeroMetaData(opts: { hero?: HeroIdKey; counter: boolean; rank: 9 | 101 }) {
		const response = await this.getMetaData(opts);
		return this.normalizeMetaData(response.data.records);
	}
}

export const mlService = new MlService();
