export interface creditTransactionsMetadata {
	question: string;
	model: string;
	tokensUsed: number;
	cachedToken: number;
	createdAt: number;
}

export type creditTransactionsReason = "ai_query" | "monthly_reset" | "subscription" | "subscription_renewal";
