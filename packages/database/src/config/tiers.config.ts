import type { userTableTier } from "../types/users.types";

export interface TierConfig {
	credits_monthly: number;
	rate_limit_capacity: number; // requests per window
	rate_limit_window_seconds: number;
	stripe_price_id: string | null;
	display_name: string;
	description: string;
}

/**
 * Base tier configuration without Stripe price IDs
 * Price IDs are injected at runtime from environment variables
 */
const BASE_TIER_CONFIG: Record<userTableTier, Omit<TierConfig, "stripe_price_id">> = {
	free: {
		credits_monthly: 50,
		rate_limit_capacity: 5,
		rate_limit_window_seconds: 60,
		display_name: "Free",
		description: "Perfect for trying out the platform",
	},
	master: {
		credits_monthly: 500,
		rate_limit_capacity: 20,
		rate_limit_window_seconds: 60,
		display_name: "Master",
		description: "For regular users who need more credits",
	},
	mythical: {
		credits_monthly: 2000,
		rate_limit_capacity: 50,
		rate_limit_window_seconds: 60,
		display_name: "Mythical",
		description: "For power users who need unlimited access",
	},
};

/**
 * Get tier configuration for a specific tier
 * For tiers that don't require price IDs (like 'free'), you can omit the price IDs
 */
export function getTierConfig(
	tier: userTableTier,
	priceIds?: { master?: string; mythical?: string }
): TierConfig {
	const baseConfig = BASE_TIER_CONFIG[tier];

	let stripe_price_id: string | null = null;
	if (tier === "master" && priceIds?.master) {
		stripe_price_id = priceIds.master;
	} else if (tier === "mythical" && priceIds?.mythical) {
		stripe_price_id = priceIds.mythical;
	}

	return {
		...baseConfig,
		stripe_price_id,
	};
}

/**
 * Get tier from Stripe price ID
 */
export function getTierFromPriceId(
	priceId: string,
	priceIds: { master: string; mythical: string }
): userTableTier | null {
	if (priceId === priceIds.master) {
		return "master";
	}
	if (priceId === priceIds.mythical) {
		return "mythical";
	}
	return null;
}

/**
 * Check if a tier requires a paid subscription
 */
export function isPaidTier(tier: userTableTier): boolean {
	return tier !== "free";
}
