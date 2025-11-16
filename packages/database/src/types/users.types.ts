export type userTableTier = "free" | "master" | "mythical";

export type subscriptionStatus = "active" | "canceled" | "past_due" | "incomplete" | "incomplete_expired" | "trialing" | "unpaid" | null;

export type userSchemaType = {
	id?: number; // automatically allocated
	clerk_user_id: string;
	email: string;
	name: string;
	imageUrl: string;
	tier: userTableTier;
	credits_remaining: number;
	credits_total: number;
	credits_reset_at: number;
	stripe_customer_id?: string | null;
	stripe_subscription_id?: string | null;
	stripe_subscription_status?: subscriptionStatus;
	createdAt?: number; // needed in table, but can be optional when passed in
	updatedAt?: number; // needed in table, but can be optional when passed in
};
