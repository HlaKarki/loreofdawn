/**
 * Discovery State Management for Wiki Page
 * Handles localStorage persistence and discovery logic
 */

export type DiscoveryState = {
	discovered: string[]; // hero url_names
	discoveredAt: Record<string, number>; // url_name -> timestamp
	discoveredVia: Record<string, string | null>; // url_name -> source hero name or null
	lastVisited: number;
	version: number;
};

const STORAGE_KEY = "wiki_discovery_state";
const CURRENT_VERSION = 1;

/**
 * Initialize empty discovery state
 */
export function createEmptyState(): DiscoveryState {
	return {
		discovered: [],
		discoveredAt: {},
		discoveredVia: {},
		lastVisited: Date.now(),
		version: CURRENT_VERSION,
	};
}

/**
 * Load discovery state from localStorage
 */
export function loadDiscoveryState(): DiscoveryState {
	if (typeof window === "undefined") {
		return createEmptyState();
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) {
			return createEmptyState();
		}

		const parsed = JSON.parse(stored) as DiscoveryState;

		// Version migration if needed
		if (parsed.version !== CURRENT_VERSION) {
			return createEmptyState();
		}

		return {
			...parsed,
			lastVisited: Date.now(),
		};
	} catch (error) {
		console.error("Failed to load discovery state:", error);
		return createEmptyState();
	}
}

/**
 * Save discovery state to localStorage
 */
export function saveDiscoveryState(state: DiscoveryState): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.error("Failed to save discovery state:", error);
	}
}

/**
 * Check if a hero is discovered
 */
export function isHeroDiscovered(state: DiscoveryState, urlName: string): boolean {
	return state.discovered.includes(urlName);
}

/**
 * Discover a hero
 */
export function discoverHero(
	state: DiscoveryState,
	urlName: string,
	discoveredVia: string | null = null,
): DiscoveryState {
	// Already discovered
	if (isHeroDiscovered(state, urlName)) {
		return state;
	}

	const newState: DiscoveryState = {
		...state,
		discovered: [...state.discovered, urlName],
		discoveredAt: {
			...state.discoveredAt,
			[urlName]: Date.now(),
		},
		discoveredVia: {
			...state.discoveredVia,
			[urlName]: discoveredVia,
		},
	};

	saveDiscoveryState(newState);
	return newState;
}

/**
 * Discover multiple heroes at once
 */
export function discoverMultipleHeroes(
	state: DiscoveryState,
	urlNames: string[],
	discoveredVia: string | null = null,
): DiscoveryState {
	let newState = state;

	for (const urlName of urlNames) {
		if (!isHeroDiscovered(newState, urlName)) {
			newState = discoverHero(newState, urlName, discoveredVia);
		}
	}

	return newState;
}

/**
 * Get discovery source for a hero
 */
export function getDiscoverySource(state: DiscoveryState, urlName: string): string | null {
	return state.discoveredVia[urlName] ?? null;
}

/**
 * Get discovery timestamp for a hero
 */
export function getDiscoveryTimestamp(state: DiscoveryState, urlName: string): number | null {
	return state.discoveredAt[urlName] ?? null;
}

/**
 * Get discovery progress stats
 */
export function getDiscoveryProgress(state: DiscoveryState, totalHeroes: number) {
	return {
		discovered: state.discovered.length,
		total: totalHeroes,
		percentage: totalHeroes > 0 ? (state.discovered.length / totalHeroes) * 100 : 0,
	};
}

/**
 * Clear all discovery state (reset)
 */
export function clearDiscoveryState(): DiscoveryState {
	const newState = createEmptyState();
	saveDiscoveryState(newState);
	return newState;
}
