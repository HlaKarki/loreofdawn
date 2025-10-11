import type {
	MlHeroProfile,
	MlMatchupSummary,
	MlMetaSummary,
	MlGraphData,
	MlGraphPoint,
	MlGraphApiRecord,
	MlMatchupApiRecord,
	MlMetaApiRecord,
	MlHeroApiRecord,
	MlHeroListApiRecord,
	MlHeroList,
} from "@repo/database";
import { mlApiService } from "@/services/ml/ml-api.service";
import { mlDbService } from "@/services/ml/ml-db.service";

class MlTransformService {
	private parseCooldownAndMana(s: string) {
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

	private parseRankNumber(n: string): string {
		const parsed = parseInt(n);
		if (!Number.isNaN(parsed)) {
			if (parsed === 101) return "overall";
			else if (parsed === 9) return "glory";
			// add more down the line
		}
		return "undefined";
	}

	private parseSkillDescription = (s: string): string => {
		// Remove <font color="..."> opening tags
		let cleaned = s.replace(/<font color="[^"]*">/g, "");
		// Remove </font> closing tags
		cleaned = cleaned.replace(/<\/font>/g, "");
		return cleaned;
	};

	private normalizeRelationSection = async (
		relation?: MlHeroApiRecord["data"]["relation"]["assist"],
	): Promise<MlHeroProfile["relation"]["compatible_with"]> => {
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
			const heroRecord = await mlDbService.getHeroById(numericId);

			heroes.push({
				id: numericId,
				name: heroRecord?.display_name ?? "",
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

	private normalizeHeroList(raw: MlHeroListApiRecord[]): MlHeroList[] {
		const ids_set = new Map<string, number>();

		raw.forEach((hero) => {
			const name = hero.data.hero.data.name;
			const id = hero.data.hero.data.heroid;
			ids_set.set(name, id);
		});

		const heroList: MlHeroList[] = [];

		for (const [key, value] of ids_set) {
			const url_name = key.trim().toLowerCase().replaceAll(" ", "_");
			heroList.push({
				id: value,
				display_name: key,
				url_name: url_name,
				updatedAt: Date.now(),
			});
		}

		return heroList;
	}

	private async normalizeHeroProfiles(raw: MlHeroApiRecord[]): Promise<MlHeroProfile[]> {
		return Promise.all(
			raw.map(async (hero) => {
				const heroData = hero.data.hero.data;
				const relation = hero.data.relation;

				const skills = (heroData.heroskilllist ?? [])
					.flatMap((group) => group?.skilllist ?? [])
				.map((skill) => {
					const { cd, mana } = this.parseCooldownAndMana(skill["skillcd&cost"] ?? "");
					const description = this.parseSkillDescription(skill.skilldesc);

					return {
						cd: cd ?? 0,
						mana: mana ?? 0,
						description: description,
						icon: skill.skillicon ?? "",
						name: skill.skillname ?? "",
						tags: (skill.skilltag ?? []).map((tag) => tag.tagname),
					};
				});

			const lanes = (heroData.roadsort ?? []).map((entry) => ({
				icon: entry?.data?.road_sort_icon ?? "",
				title: entry?.data?.road_sort_title ?? "",
			}));

			const roles = (heroData.sortid ?? []).map((entry) => ({
				icon: entry?.data?.sort_icon ?? "",
				title: entry?.data?.sort_title ?? "",
			}));

				const assist = await this.normalizeRelationSection(relation?.assist);
				const strong = await this.normalizeRelationSection(relation?.strong);
				const weak = await this.normalizeRelationSection(relation?.weak);

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
					lanes,
					roles,
					speciality: heroData.speciality ?? [],
					tagline: heroData.story,
					tale: heroData.tale,
					relation: {
						compatible_with: assist,
						strong_against: strong,
						weak_against: weak,
					},
					source_link: hero.data.url,
				};
			}),
		);
	}

	private async normalizeSubHeroSummaries(
		heroes?: MlMatchupApiRecord["data"]["sub_hero"],
	): Promise<MlMatchupSummary["most_compatible"]> {
		if (!heroes?.length) {
			return [];
		}

		return Promise.all(
			heroes.map(async (hero, index) => {
				const heroRecord = await mlDbService.getHeroById(hero.heroid);

				return {
					index: hero.hero_index ?? index,
					id: hero.heroid,
					name: heroRecord?.display_name ?? "",
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
			}),
		);
	}

	private async normalizeMatchupSummaries(
		raw: MlMatchupApiRecord[],
		isCounter: boolean,
	): Promise<MlMatchupSummary[]> {
		if (!raw?.length) {
			return [];
		}

		return Promise.all(
			raw.map(async (matchup) => {
				const data = matchup.data;
				const primary = await this.normalizeSubHeroSummaries(data.sub_hero);
				const secondary = await this.normalizeSubHeroSummaries(data.sub_hero_last);
				const rank = this.parseRankNumber(matchup.data.bigrank);

				return {
					name: data.main_hero?.data?.name ?? "",
					id: data.main_heroid,
				rank: rank,
				updatedAt: matchup._updatedAt,
					most_compatible: isCounter ? [] : primary,
					least_compatible: isCounter ? [] : secondary,
					best_counter: isCounter ? secondary : [],
					worst_counter: isCounter ? primary : [],
				};
			}),
		);
	}

	private async normalizeMetaSummaries(raw?: MlMetaApiRecord[] | null): Promise<MlMetaSummary[]> {
		if (!raw?.length) {
			return [];
		}

		return Promise.all(
			raw.map(async (meta) => {
				const data = meta.data;
				const heroId = data.main_heroid;
				const heroRecord = await mlDbService.getHeroById(heroId);
				const rank = this.parseRankNumber(meta.data.bigrank);

				return {
					id: heroId,
					name: heroRecord?.display_name ?? "",
					rank: rank,
					updatedAt: meta._updatedAt,
					pick_rate: data.main_hero_appearance_rate,
					ban_rate: data.main_hero_ban_rate,
					win_rate: data.main_hero_win_rate,
				};
			}),
		);
	}

	private async normalizeGraphData(raw?: MlGraphApiRecord[] | null): Promise<MlGraphData[]> {
		if (!raw?.length) {
			return [];
		}

		return Promise.all(
			raw.map(async (record) => {
				const data = record.data;
				const heroId = data.main_heroid;
				const heroRecord = await mlDbService.getHeroById(heroId);

				const points: MlGraphPoint[] = (data.win_rate ?? []).map((point) => ({
					date: point.date,
					win_rate: point.win_rate,
					pick_rate: point.app_rate,
					ban_rate: point.ban_rate,
				}));

				const sortedPoints = [...points].sort((a, b) => a.date.localeCompare(b.date));
				const pointsCount = sortedPoints.length;
				const lastPoint = pointsCount ? sortedPoints[pointsCount - 1] : null;
				const rank = this.parseRankNumber(record.data.bigrank);

				return {
					id: heroId,
					name: heroRecord?.display_name ?? "",
					rank: rank,
					updatedAt: record._updatedAt,
					trend_start: sortedPoints[0]?.date ?? null,
					trend_end: lastPoint?.date ?? null,
					points: sortedPoints,
				};
			}),
		);
	}
	async getNormalizedHeroList() {
		const response = await mlApiService.listHeroes();
		return this.normalizeHeroList(response.data.records);
	}

	async getNormalizedHeroProfiles() {
		const response = await mlApiService.fetchAllHeroRecords();
		return await this.normalizeHeroProfiles(response.data.records);
	}

	async getNormalizedHeroProfile(opts: { hero: string; rank: 9 | 101 }) {
		const hero_db = await mlDbService.getHeroByName(opts.hero);
		const response = await mlApiService.fetchHeroRecord(hero_db.id);

		const [profile] = await this.normalizeHeroProfiles(response.data.records);
		return profile;
	}

	async getNormalizedMatchupSummaries(opts: {
		hero?: string;
		counter: boolean;
		rank: 9 | 101;
	}): Promise<MlMatchupSummary[]> {
		let hero_db;
		if (opts.hero) {
			hero_db = await mlDbService.getHeroByName(opts.hero);
		}

		const response = await mlApiService.fetchMatchupRecords({
			hero_id: hero_db?.id,
			counter: opts.counter,
			rank: opts.rank,
		});
		return await this.normalizeMatchupSummaries(response.data.records, opts.counter);
	}

	async getNormalizedMetaSummaries(opts: { hero?: string; counter: boolean; rank: 9 | 101 }) {
		let hero_db;
		if (opts.hero) {
			hero_db = await mlDbService.getHeroByName(opts.hero);
		}

		const response = await mlApiService.fetchMetaRecords({
			hero_id: hero_db?.id,
			counter: opts.counter,
			rank: opts.rank,
		});
		return await this.normalizeMetaSummaries(response.data.records);
	}

	async getNormalizedGraphSeries(opts: { hero?: string; counter: boolean; rank: 9 | 101 }) {
		let hero_db;
		if (opts.hero) {
			hero_db = await mlDbService.getHeroByName(opts.hero);
		}

		const response = await mlApiService.fetchGraphRecords({
			hero_id: hero_db?.id,
			counter: opts.counter,
			rank: opts.rank,
		});
		return await this.normalizeGraphData(response.data.records);
	}
}

export const mlTransformService = new MlTransformService();
