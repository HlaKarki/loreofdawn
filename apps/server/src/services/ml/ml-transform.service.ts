import { hero_names, type HeroNameKey } from "@/data/ml/hero_ids";
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

	private normalizeRelationSection = (
		relation?: MlHeroApiRecord["data"]["relation"]["assist"],
	): MlHeroProfile["relation"]["compatible_with"] => {
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

	private normalizeHeroProfiles(raw: MlHeroApiRecord[]): MlHeroProfile[] {
		return raw.map((hero) => {
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
					compatible_with: this.normalizeRelationSection(relation?.assist),
					strong_against: this.normalizeRelationSection(relation?.strong),
					weak_against: this.normalizeRelationSection(relation?.weak),
				},
				source_link: hero.data.url,
			};
		});
	}

	private normalizeSubHeroSummaries(
		heroes?: MlMatchupApiRecord["data"]["sub_hero"],
	): MlMatchupSummary["most_compatible"] {
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

	private normalizeMatchupSummaries(
		raw: MlMatchupApiRecord[],
		isCounter: boolean,
	): MlMatchupSummary[] {
		if (!raw?.length) {
			return [];
		}

		return raw.map((matchup) => {
			const data = matchup.data;
			const primary = this.normalizeSubHeroSummaries(data.sub_hero);
			const secondary = this.normalizeSubHeroSummaries(data.sub_hero_last);
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
		});
	}

	private normalizeMetaSummaries(raw?: MlMetaApiRecord[] | null): MlMetaSummary[] {
		if (!raw?.length) {
			return [];
		}

		return raw.map((meta) => {
			const data = meta.data;
			const heroId = data.main_heroid;
			const heroKey = String(heroId) as keyof typeof hero_names;
			const fallbackName = hero_names[heroKey] ?? String(heroId);
			const heroName = data.main_hero?.data?.name ?? fallbackName;
			const rank = this.parseRankNumber(meta.data.bigrank);

			return {
				id: heroId,
				name: heroName,
				rank: rank,
				updatedAt: meta._updatedAt,
				pick_rate: data.main_hero_appearance_rate,
				ban_rate: data.main_hero_ban_rate,
				win_rate: data.main_hero_win_rate,
			};
		});
	}

	private normalizeGraphData(raw?: MlGraphApiRecord[] | null): MlGraphData[] {
		if (!raw?.length) {
			return [];
		}

		return raw.map((record) => {
			const data = record.data;
			const heroId = data.main_heroid;
			const heroKey = String(heroId) as keyof typeof hero_names;
			const heroName = hero_names[heroKey] ?? String(heroId);

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
				name: heroName,
				rank: rank,
				updatedAt: record._updatedAt,
				trend_start: sortedPoints[0]?.date ?? null,
				trend_end: lastPoint?.date ?? null,
				points: sortedPoints,
			};
		});
	}
	async getNormalizedHeroList() {
		const response = await mlApiService.listHeroes();
		return this.normalizeHeroList(response.data.records);
	}

	async getNormalizedHeroProfiles() {
		const response = await mlApiService.fetchAllHeroRecords();
		return this.normalizeHeroProfiles(response.data.records);
	}

	async getNormalizedHeroProfile(opts: { hero: HeroNameKey; rank: 9 | 101 }) {
		const response = await mlApiService.fetchHeroRecord(opts.hero);

		return this.normalizeHeroProfiles(response.data.records)[0];
	}

	async getNormalizedMatchupSummaries(opts: {
		hero?: HeroNameKey;
		counter: boolean;
		rank: 9 | 101;
	}): Promise<MlMatchupSummary[]> {
		const response = await mlApiService.fetchMatchupRecords(opts);
		return this.normalizeMatchupSummaries(response.data.records, opts.counter);
	}

	async getNormalizedMetaSummaries(opts: { hero?: HeroNameKey; counter: boolean; rank: 9 | 101 }) {
		const response = await mlApiService.fetchMetaRecords(opts);
		return this.normalizeMetaSummaries(response.data.records);
	}

	async getNormalizedGraphSeries(opts: { hero?: HeroNameKey; counter: boolean; rank: 9 | 101 }) {
		const response = await mlApiService.fetchGraphRecords(opts);
		return this.normalizeGraphData(response.data.records);
	}
}

export const mlTransformService = new MlTransformService();
