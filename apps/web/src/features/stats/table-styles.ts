export const TABLE_CONFIG = {
	winRate: {
		high: 0.52,
		low: 0.48,
	},

	colors: {
		winRate: {
			high: "text-green-500",
			balanced: "text-yellow-500",
			low: "text-red-500",
		},
		pickRate: "text-blue-500",
		banRate: "text-purple-500",
		trend: {
			rising: "text-green-500",
			falling: "text-red-500",
			stable: "text-muted-foreground",
		},
		difficulty: {
			easy: "text-green-500",
			medium: "text-yellow-500",
			hard: "text-red-500",
		},
	},

	typography: {
		header: "text-xs sm:text-sm font-semibold",
		cellDefault: "text-xs sm:text-sm",
		cellEmphasis: "text-xs sm:text-sm font-semibold",
		cellMuted: "text-xs sm:text-sm text-muted-foreground",
	},

	spacing: {
		cellPadding: "px-4 py-3",
		headerPadding: "px-4 py-3",
	},

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

	overview: {
		balancedHeroes: {
			min: 0.45,
			max: 0.5,
		},
		metaKings: {
			min: 0.05,
		},
		forgottenHeroes: {
			max: 0.01,
		},
	},
} as const;

export function getWinRateColor(winRate: number): string {
	if (winRate > TABLE_CONFIG.winRate.high) {
		return TABLE_CONFIG.colors.winRate.high;
	}
	if (winRate < TABLE_CONFIG.winRate.low) {
		return TABLE_CONFIG.colors.winRate.low;
	}
	return TABLE_CONFIG.colors.winRate.balanced;
}

export function getDifficultyColor(difficulty: number): string {
	if (difficulty <= 40) {
		return TABLE_CONFIG.colors.difficulty.easy;
	}
	if (difficulty <= 70) {
		return TABLE_CONFIG.colors.difficulty.medium;
	}
	return TABLE_CONFIG.colors.difficulty.hard;
}

export function formatPercentage(value: number, decimals: number = 1): string {
	return `${(value * 100).toFixed(decimals)}%`;
}
