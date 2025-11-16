import Stripe from "stripe";

export class StripeService {
	private stripe: Stripe;

	constructor(secretKey: string) {
		this.stripe = new Stripe(secretKey, {
			apiVersion: "2025-10-29.clover",
			httpClient: Stripe.createFetchHttpClient(),
		});
	}

	/**
	 * Create a Stripe checkout session for subscription
	 */
	async createCheckoutSession(params: {
		priceId: string;
		customerEmail: string;
		customerId?: string;
		userId: string;
		successUrl: string;
		cancelUrl: string;
	}): Promise<Stripe.Checkout.Session> {
		const sessionParams: Stripe.Checkout.SessionCreateParams = {
			mode: "subscription",
			line_items: [
				{
					price: params.priceId,
					quantity: 1,
				},
			],
			success_url: params.successUrl,
			cancel_url: params.cancelUrl,
			customer_email: params.customerId ? undefined : params.customerEmail,
			customer: params.customerId || undefined,
			metadata: {
				clerk_user_id: params.userId,
			},
			subscription_data: {
				metadata: {
					clerk_user_id: params.userId,
				},
			},
		};

		return await this.stripe.checkout.sessions.create(sessionParams);
	}

	/**
	 * Create a customer portal session for managing subscriptions
	 */
	async createPortalSession(
		customerId: string,
		returnUrl: string,
	): Promise<Stripe.BillingPortal.Session> {
		return await this.stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: returnUrl,
		});
	}

	/**
	 * Cancel a subscription
	 */
	async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
		return await this.stripe.subscriptions.cancel(subscriptionId);
	}

	/**
	 * Retrieve a subscription
	 */
	async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
		return await this.stripe.subscriptions.retrieve(subscriptionId);
	}

	/**
	 * Retrieve a customer
	 */
	async getCustomer(customerId: string): Promise<Stripe.Customer> {
		return (await this.stripe.customers.retrieve(customerId)) as Stripe.Customer;
	}

	/**
	 * Create or update a customer
	 */
	async upsertCustomer(params: {
		email: string;
		name: string;
		customerId?: string;
		metadata?: Record<string, string>;
	}): Promise<Stripe.Customer> {
		if (params.customerId) {
			return await this.stripe.customers.update(params.customerId, {
				email: params.email,
				name: params.name,
				metadata: params.metadata,
			});
		}

		return await this.stripe.customers.create({
			email: params.email,
			name: params.name,
			metadata: params.metadata,
		});
	}

	/**
	 * Construct webhook event from request
	 */
	async constructWebhookEvent(payload: string, signature: string, webhookSecret: string): Promise<Stripe.Event> {
		return await this.stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
	}
}
