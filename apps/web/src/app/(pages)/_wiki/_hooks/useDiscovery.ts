"use client";

import { useState, useEffect, useCallback } from "react";
import {
	loadDiscoveryState,
	createEmptyState,
	discoverHero as discoverHeroUtil,
	discoverMultipleHeroes as discoverMultipleHeroesUtil,
	isHeroDiscovered as isHeroDiscoveredUtil,
	getDiscoverySource as getDiscoverySourceUtil,
	getDiscoveryProgress as getDiscoveryProgressUtil,
	clearDiscoveryState as clearDiscoveryStateUtil,
	type DiscoveryState,
} from "../_lib/discovery";

export function useDiscovery(totalHeroes: number) {
	// Start with empty state to match server-side render
	const [state, setState] = useState<DiscoveryState>(createEmptyState);

	// Load actual state from localStorage after hydration
	useEffect(() => {
		setState(loadDiscoveryState());
	}, []);

	/**
	 * Discover a hero
	 */
	const discoverHero = useCallback((urlName: string, discoveredVia: string | null = null) => {
		setState((prev) => discoverHeroUtil(prev, urlName, discoveredVia));
	}, []);

	/**
	 * Discover multiple heroes at once
	 */
	const discoverMultipleHeroes = useCallback(
		(urlNames: string[], discoveredVia: string | null = null) => {
			setState((prev) => discoverMultipleHeroesUtil(prev, urlNames, discoveredVia));
		},
		[],
	);

	/**
	 * Check if a hero is discovered
	 */
	const isDiscovered = useCallback(
		(urlName: string): boolean => {
			return isHeroDiscoveredUtil(state, urlName);
		},
		[state],
	);

	/**
	 * Get discovery source for a hero
	 */
	const getDiscoverySource = useCallback(
		(urlName: string): string | null => {
			return getDiscoverySourceUtil(state, urlName);
		},
		[state],
	);

	/**
	 * Get discovery progress stats
	 */
	const progress = getDiscoveryProgressUtil(state, totalHeroes);

	/**
	 * Clear all discovery state
	 */
	const clearDiscovery = useCallback(() => {
		setState(clearDiscoveryStateUtil());
	}, []);

	return {
		discovered: state.discovered,
		discoverHero,
		discoverMultipleHeroes,
		isDiscovered,
		getDiscoverySource,
		progress,
		clearDiscovery,
	};
}
