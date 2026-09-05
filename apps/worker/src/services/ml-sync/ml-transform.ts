import type {
	MlGraphApiRecord,
	MlGraphData,
	MlGraphPoint,
	MlHeroApiRecord,
	MlHeroList,
	MlHeroListApiRecord,
	MlHeroProfile,
	MlMatchupApiRecord,
	MlMatchupSummary,
	MlMetaApiRecord,
	MlMetaSummary,
} from "@repo/database";

export type HeroMap = Map<number, MlHeroList>;

const toUrlName = (name: string) => name.trim().toLowerCase().replaceAll(" ", "_");

function parseCooldownAndMana(s: string) {
	const text = s.replace(/\s+/g, " ").trim();
	const cd = text.match(/CD:\s*(\d+)/i);
	const mana = text.match(/Mana\s*Cost:\s*(\d+)/i);
	return { cd: cd ? parseInt(cd[1], 10) : 0, mana: mana ? parseInt(mana[1], 10) : 0 };
}

function parseRankNumber(n: string): string {
	const parsed = parseInt(n);
	if (parsed === 101) return "overall";
	if (parsed === 9) return "glory";
	return "undefined";
}

const stripFontTags = (s: string) => s.replace(/<font color="[^"]*">/g, "").replace(/<\/font>/g, "");

function normalizeRelationSection(
	relation: MlHeroApiRecord["data"]["relation"]["assist"] | undefined,
	heroMap: HeroMap,
): MlHeroProfile["relation"]["compatible_with"] {
	if (!relation) return [];

	const ids = relation.target_hero_id ?? [];
	const targets = relation.target_hero ?? [];
	const heroes: { id: number; name: string; image: string }[] = [];

	for (let index = 0; index < targets.length; index++) {
		const numericId = Number(ids[index]);
		if (!ids[index] || Number.isNaN(numericId)) continue;
		heroes.push({
			id: numericId,
			name: heroMap.get(numericId)?.display_name ?? "",
			image: targets[index]?.data?.head ?? "",
		});
	}

	return heroes.length ? [{ description: relation.desc ?? "", heroes }] : [];
}

export function normalizeHeroList(raw: MlHeroListApiRecord[]): MlHeroList[] {
	const byName = new Map<string, number>();
	for (const hero of raw) {
		if (!hero?.data?.hero?.data) continue;
		byName.set(hero.data.hero.data.name, hero.data.hero.data.heroid);
	}
	const updatedAt = Date.now();
	return [...byName].map(([display_name, id]) => ({
		id,
		display_name,
		url_name: toUrlName(display_name),
		updatedAt,
	}));
}

export function normalizeHeroProfiles(raw: MlHeroApiRecord[], heroMap: HeroMap): MlHeroProfile[] {
	return raw.map((hero) => {
		const heroData = hero.data.hero.data;
		const relation = hero.data.relation;

		const skills = (heroData.heroskilllist ?? [])
			.flatMap((group) => group?.skilllist ?? [])
			.map((skill) => ({
				...parseCooldownAndMana(skill["skillcd&cost"] ?? ""),
				description: stripFontTags(skill.skilldesc),
				icon: skill.skillicon ?? "",
				name: skill.skillname ?? "",
				tags: (skill.skilltag ?? []).map((tag) => tag.tagname),
			}))
			.filter((s) => s.name.trim() !== "");

		const lanes = (heroData.roadsort ?? [])
			.map((entry) => ({
				icon: entry?.data?.road_sort_icon ?? "",
				title: entry?.data?.road_sort_title ?? "",
			}))
			.filter((l) => l.title.trim() !== "");

		const roles = (heroData.sortid ?? [])
			.map((entry) => ({ icon: entry?.data?.sort_icon ?? "", title: entry?.data?.sort_title ?? "" }))
			.filter((r) => r.title.trim() !== "");

		return {
			id: hero.data.hero_id,
			name: heroData.name,
			url_name: toUrlName(heroData.name),
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
				compatible_with: normalizeRelationSection(relation?.assist, heroMap),
				strong_against: normalizeRelationSection(relation?.strong, heroMap),
				weak_against: normalizeRelationSection(relation?.weak, heroMap),
			},
			source_link: hero.data.url,
		};
	});
}

function normalizeSubHeroSummaries(
	heroes: MlMatchupApiRecord["data"]["sub_hero"] | undefined,
	heroMap: HeroMap,
): MlMatchupSummary["most_compatible"] {
	return (heroes ?? []).map((hero, index) => ({
		index: hero.hero_index ?? index,
		id: hero.heroid,
		name: heroMap.get(hero.heroid)?.display_name ?? "",
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
	}));
}

export function normalizeMatchupSummaries(
	raw: MlMatchupApiRecord[],
	isCounter: boolean,
	heroMap: HeroMap,
): MlMatchupSummary[] {
	return raw.map((matchup) => {
		const data = matchup.data;
		const primary = normalizeSubHeroSummaries(data.sub_hero, heroMap);
		const secondary = normalizeSubHeroSummaries(data.sub_hero_last, heroMap);
		const name = data.main_hero?.data?.name ?? "";

		return {
			id: data.main_heroid,
			name,
			url_name: toUrlName(name),
			rank: parseRankNumber(data.bigrank),
			updatedAt: matchup._updatedAt,
			most_compatible: isCounter ? [] : primary,
			least_compatible: isCounter ? [] : secondary,
			best_counter: isCounter ? secondary : [],
			worst_counter: isCounter ? primary : [],
		};
	});
}

export function normalizeMetaSummaries(raw: MlMetaApiRecord[], heroMap: HeroMap): MlMetaSummary[] {
	return raw.map((meta) => {
		const data = meta.data;
		return {
			id: data.main_heroid,
			name: heroMap.get(data.main_heroid)?.display_name ?? "",
			url_name: toUrlName(data.main_hero.data.name),
			rank: parseRankNumber(data.bigrank),
			updatedAt: meta._updatedAt,
			pick_rate: data.main_hero_appearance_rate,
			ban_rate: data.main_hero_ban_rate,
			win_rate: data.main_hero_win_rate,
		};
	});
}

export function normalizeGraphData(raw: MlGraphApiRecord[], heroMap: HeroMap): MlGraphData[] {
	return raw.map((record) => {
		const data = record.data;
		const hero = heroMap.get(data.main_heroid);
		const points: MlGraphPoint[] = (data.win_rate ?? [])
			.map((point) => ({
				date: point.date,
				win_rate: point.win_rate,
				pick_rate: point.app_rate,
				ban_rate: point.ban_rate,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));

		return {
			id: data.main_heroid,
			name: hero?.display_name ?? "",
			url_name: hero?.url_name ?? "",
			rank: parseRankNumber(data.bigrank),
			updatedAt: record._updatedAt,
			trend_start: points[0]?.date ?? null,
			trend_end: points.at(-1)?.date ?? null,
			points,
		};
	});
}
