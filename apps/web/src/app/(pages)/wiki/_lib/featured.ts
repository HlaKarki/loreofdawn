/**
 * Featured Sections Algorithms
 * Generates featured content for wiki page
 */

import type { ConsolidatedHeroOptional } from "@repo/database";
import type { WikiHeroProfile } from "../_types";

/**
 * Get Hero of the Day (deterministic rotation based on date)
 */
export function getHeroOfTheDay(
	heroes: ConsolidatedHeroOptional[],
): ConsolidatedHeroOptional | null {
	if (heroes.length === 0) return null;

	const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
	const index = daysSinceEpoch % heroes.length;

	return heroes[index];
}

/**
 * Find deadly rivalries (mutual counter relationships)
 * Returns pairs where A counters B and B is weak against A
 */
export function findDeadlyRivalries(
	heroes: ConsolidatedHeroOptional[],
	limit: number = 3,
): Array<{
	heroA: ConsolidatedHeroOptional;
	heroB: ConsolidatedHeroOptional;
	description: string;
}> {
	const rivalries: Array<{
		heroA: ConsolidatedHeroOptional;
		heroB: ConsolidatedHeroOptional;
		description: string;
	}> = [];

	// Create a map for faster lookups
	const heroMap = new Map(heroes.map((h) => [h.profile.id, h]));

	for (const heroA of heroes) {
		if (!heroA.profile.relation?.strong_against) continue;

		for (const group of heroA.profile.relation.strong_against) {
			if (!group.heroes) continue;

			for (const counterHero of group.heroes) {
				const heroB = heroMap.get(counterHero.id);
				if (!heroB || !heroB.profile.relation?.weak_against) continue;

				// Check if B also lists A in their weak_against
				const isMutual = heroB.profile.relation.weak_against.some((weakGroup) =>
					weakGroup.heroes?.some((h) => h.id === heroA.profile.id),
				);

				if (isMutual && heroA.profile.id < heroB.profile.id) {
					// Prevent duplicates
					rivalries.push({
						heroA,
						heroB,
						description:
							group.description || `${heroA.profile.name} counters ${heroB.profile.name}`,
					});
				}
			}
		}
	}

	// Return limited results
	return rivalries.slice(0, limit);
}

/**
 * Find perfect pairings (mutual synergies)
 * Returns pairs where A is compatible with B and B is compatible with A
 */
export function findPerfectPairings(
	heroes: ConsolidatedHeroOptional[],
	limit: number = 4,
): Array<{
	heroA: ConsolidatedHeroOptional;
	heroB: ConsolidatedHeroOptional;
	description: string;
}> {
	const pairings: Array<{
		heroA: ConsolidatedHeroOptional;
		heroB: ConsolidatedHeroOptional;
		description: string;
	}> = [];

	// Create a map for faster lookups
	const heroMap = new Map(heroes.map((h) => [h.profile.id, h]));

	for (const heroA of heroes) {
		if (!heroA.profile.relation?.compatible_with) continue;

		for (const group of heroA.profile.relation.compatible_with) {
			if (!group.heroes) continue;

			for (const compatibleHero of group.heroes) {
				const heroB = heroMap.get(compatibleHero.id);
				if (!heroB || !heroB.profile.relation?.compatible_with) continue;

				// Check if B also lists A in their compatible_with
				const isMutual = heroB.profile.relation.compatible_with.some((compatGroup) =>
					compatGroup.heroes?.some((h) => h.id === heroA.profile.id),
				);

				if (isMutual && heroA.profile.id < heroB.profile.id) {
					// Prevent duplicates
					pairings.push({
						heroA,
						heroB,
						description:
							group.description || `${heroA.profile.name} synergizes with ${heroB.profile.name}`,
					});
				}
			}
		}
	}

	// Return limited results
	return pairings.slice(0, limit);
}

/**
 * Get role spotlight heroes (rotating by week)
 */
export function getRoleSpotlight(heroes: ConsolidatedHeroOptional[]): {
	role: string;
	heroes: ConsolidatedHeroOptional[];
} | null {
	const roles = ["mage", "fighter", "assassin", "marksman", "tank"];

	// Rotate role based on week of year
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - start.getTime();
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);
	const weekOfYear = Math.floor(dayOfYear / 7);

	const roleIndex = weekOfYear % roles.length;
	const role = roles[roleIndex];

	// Filter heroes by role
	const roleHeroes = heroes.filter((hero) =>
		hero.profile.roles?.some((r) => r.title.toLowerCase() === role),
	);

	if (roleHeroes.length === 0) return null;

	return {
		role,
		heroes: roleHeroes.slice(0, 8), // Limit to 8 for horizontal scroll
	};
}
