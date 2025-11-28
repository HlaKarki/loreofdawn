/**
 * Centralized configuration for stats table styling
 * Adjust colors, thresholds, and spacing from this single file
 */

export const TABLE_CONFIG = {
	// Win Rate Color Thresholds
	winRate: {
		high: 0.52, // Above this = green
		low: 0.48, // Below this = red
		// Between high and low = yellow
	},

	// Colors (Tailwind classes)
	colors: {
		// Win Rate
		winRate: {
			high: "text-green-500",
			balanced: "text-yellow-500",
			low: "text-red-500",
		},
		// Pick Rate
		pickRate: "text-blue-500",
		// Ban Rate
		banRate: "text-purple-500",
		// Trends
		trend: {
			rising: "text-green-500",
			falling: "text-red-500",
			stable: "text-muted-foreground",
		},
		// Difficulty
		difficulty: {
			easy: "text-green-500", // 0-40
			medium: "text-yellow-500", // 41-70
			hard: "text-red-500", // 71-100
		},
	},

	// Typography
	typography: {
		header: "text-sm font-semibold",
		cellDefault: "text-sm",
		cellEmphasis: "text-sm font-semibold",
		cellMuted: "text-sm text-muted-foreground",
	},

	// Spacing & Layout
	spacing: {
		cellPadding: "px-4 py-3",
		headerPadding: "px-4 py-3",
	},

	// Cell Alignment
	alignment: {
		hero: "text-left",
		role: "text-left",
		lane: "text-left",
		winRate: "text-center",
		pickRate: "text-center",
		banRate: "text-center",
		trend: "text-center",
		difficulty: "text-center",
	},

	// Overview Cards
	overview: {
		balancedHeroes: {
			min: 0.45,
			max: 0.5,
		},
		metaKings: {
			min: 0.05,
		},
		forgottenHeroes: {
			max: 0.01, // Pick rate
		},
	},
} as const;

/**
 * Helper function to get win rate color
 */
export function getWinRateColor(winRate: number): string {
	if (winRate > TABLE_CONFIG.winRate.high) {
		return TABLE_CONFIG.colors.winRate.high;
	}
	if (winRate < TABLE_CONFIG.winRate.low) {
		return TABLE_CONFIG.colors.winRate.low;
	}
	return TABLE_CONFIG.colors.winRate.balanced;
}

/**
 * Helper function to get difficulty color
 */
export function getDifficultyColor(difficulty: number): string {
	if (difficulty <= 40) {
		return TABLE_CONFIG.colors.difficulty.easy;
	}
	if (difficulty <= 70) {
		return TABLE_CONFIG.colors.difficulty.medium;
	}
	return TABLE_CONFIG.colors.difficulty.hard;
}

/**
 * Helper function to format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
	return `${(value * 100).toFixed(decimals)}%`;
}
