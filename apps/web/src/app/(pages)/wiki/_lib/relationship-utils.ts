/**
 * Relationship utilities for hero connections
 */

import type { ConsolidatedHeroOptional } from "@repo/database";

/**
 * Count total relationships for a hero
 */
export function countRelationships(hero: ConsolidatedHeroOptional) {
	const strongAgainst =
		hero.profile.relation?.strong_against?.reduce(
			(acc, group) => acc + (group.heroes?.length || 0),
			0,
		) || 0;

	const weakAgainst =
		hero.profile.relation?.weak_against?.reduce(
			(acc, group) => acc + (group.heroes?.length || 0),
			0,
		) || 0;

	const compatibleWith =
		hero.profile.relation?.compatible_with?.reduce(
			(acc, group) => acc + (group.heroes?.length || 0),
			0,
		) || 0;

	return {
		strongAgainst,
		weakAgainst,
		compatibleWith,
		total: strongAgainst + weakAgainst + compatibleWith,
	};
}

/**
 * Get all related hero IDs for a hero
 */
export function getRelatedHeroIds(hero: ConsolidatedHeroOptional): Set<number> {
	const relatedIds = new Set<number>();

	hero.profile.relation?.strong_against?.forEach((group) => {
		group.heroes?.forEach((h) => relatedIds.add(h.id));
	});

	hero.profile.relation?.weak_against?.forEach((group) => {
		group.heroes?.forEach((h) => relatedIds.add(h.id));
	});

	hero.profile.relation?.compatible_with?.forEach((group) => {
		group.heroes?.forEach((h) => relatedIds.add(h.id));
	});

	return relatedIds;
}

/**
 * Check if a hero is related to another hero
 */
export function isRelatedTo(heroA: ConsolidatedHeroOptional, heroBId: number): boolean {
	const relatedIds = getRelatedHeroIds(heroA);
	return relatedIds.has(heroBId);
}

/**
 * Get related heroes from a relationship group
 */
export function getHeroesFromRelationship(
	relationGroup:
		| Array<{
				description: string;
				heroes: Array<{ id: number; name: string; url_name: string; image: string }>;
		  }>
		| undefined,
): Array<{ id: number; name: string; url_name: string; image: string }> {
	if (!relationGroup) return [];

	return relationGroup.reduce(
		(acc, group) => {
			if (group.heroes) {
				acc.push(...group.heroes);
			}
			return acc;
		},
		[] as Array<{ id: number; name: string; url_name: string; image: string }>,
	);
}
