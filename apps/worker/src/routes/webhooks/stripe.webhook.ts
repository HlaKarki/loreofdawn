import { createDb } from "@/db";
import { CreditService } from "@/services/credits.service";
import { StripeService } from "@/services/stripe.service";
import { UserService } from "@/services/users.service";
import { getTierFromPriceId } from "@repo/database";
import Stripe from "stripe";
import { Logger } from "@repo/utils";
import type { Context } from "hono";
import type { Env } from "@/types";

/**
 * Stripe webhook handler
 * Handles subscription lifecycle events
 */
export const stripeWebhookHandler = async (c: Context<Env>) => {
	const pathname = new URL(c.req.url).pathname;
	const WEBHOOK_SECRET = c.env.STRIPE_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		Logger.error(pathname, { message: "Missing STRIPE_WEBHOOK_SECRET" });
		return c.json({ error: "Webhook secret not configured" }, 500);
	}

	const signature = c.req.header("stripe-signature");
	if (!signature) {
		Logger.error(pathname, { message: "Missing stripe-signature header" });
		return c.json({ error: "Missing stripe-signature header" }, 400);
	}

	const tierIds = {
		master: c.env.STRIPE_PRICE_ID_MASTER,
		mythical: c.env.STRIPE_PRICE_ID_MYTHICAL,
	};

	const payload = await c.req.text();

	try {
		const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY);
		const event = await stripeService.constructWebhookEvent(payload, signature, WEBHOOK_SECRET);

		Logger.info(pathname, { eventType: event.type, eventId: event.id });

		const db = createDb(c.env.HYPERDRIVE.connectionString);
		const userService = new UserService(db);
		const creditService = new CreditService(db);

		switch (event.type) {
			case "customer.subscription.created": {
				const subscription = event.data.object as Stripe.Subscription;
				const clerkUserId = subscription.metadata?.clerk_user_id;

				if (!clerkUserId) {
					Logger.warn(pathname, { message: "No clerk_user_id in subscription metadata" });
					break;
				}

				Logger.info(pathname, {
					clerkUserId,
					subscriptionId: subscription.id,
					status: subscription.status,
					message: "Subscription created",
				});
				break;
			}

			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const clerkUserId = session.metadata?.clerk_user_id;
				const customerId = session.customer as string;
				const subscriptionId = session.subscription as string;

				if (!clerkUserId) {
					Logger.error(pathname, { message: "No clerk_user_id in session metadata" });
					return c.json({ error: "Missing user ID" }, 400);
				}

				// Get subscription to find the price ID
				const subscription = await stripeService.getSubscription(subscriptionId);
				const priceId = subscription.items.data[0]?.price.id;

				if (!priceId) {
					Logger.error(pathname, { message: "No price ID found in subscription" });
					return c.json({ error: "Missing price ID" }, 400);
				}

				// Determine tier from price ID
				const tier = getTierFromPriceId(priceId, tierIds);
				if (!tier) {
					Logger.error(pathname, { message: `Unknown price ID: ${priceId}` });
					return c.json({ error: "Unknown price ID" }, 400);
				}

				// Update user with subscription details and tier
				await userService.updateSubscription(clerkUserId, {
					stripe_customer_id: customerId,
					stripe_subscription_id: subscriptionId,
					stripe_subscription_status: subscription.status,
					tier,
				});

				// Credits will be allocated by invoice.paid event (billing_reason: subscription_create)

				Logger.info(pathname, {
					clerkUserId,
					tier,
					subscriptionId,
					message: "Subscription activated, credits will be allocated on invoice.paid",
				});
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				const clerkUserId = subscription.metadata?.clerk_user_id;

				if (!clerkUserId) {
					Logger.warn(pathname, { message: "No clerk_user_id in subscription metadata" });
					break;
				}

				// get new price id
				const priceId = subscription.items.data[0]?.price.id;
				const tier = getTierFromPriceId(priceId, tierIds);

				if (tier) {
					// handle upgrade/downgrade
					await userService.updateSubscription(clerkUserId, {
						tier,
						stripe_subscription_status: subscription.status,
					});
					await creditService.resetCreditsForTier(clerkUserId, tier);

					Logger.info(pathname, {
						clerkUserId,
						tier,
						status: subscription.status,
						message: "Subscription tier changed, credits reset",
					});
				} else {
					// simply change status
					await userService.updateSubscription(clerkUserId, {
						stripe_subscription_status: subscription.status,
					});

					Logger.info(pathname, {
						clerkUserId,
						status: subscription.status,
						message: "Subscription status updated",
					});
				}
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				const clerkUserId = subscription.metadata?.clerk_user_id;

				if (!clerkUserId) {
					Logger.warn(pathname, { message: "No clerk_user_id in subscription metadata" });
					break;
				}

				// Downgrade to free tier
				await userService.updateSubscription(clerkUserId, {
					stripe_subscription_id: undefined,
					stripe_subscription_status: undefined,
					tier: "free",
				});

				// Allocate free tier credits
				await creditService.resetCreditsForTier(clerkUserId, "free");

				Logger.info(pathname, {
					clerkUserId,
					message: "Subscription canceled, downgraded to free tier",
				});
				break;
			}

			case "invoice.payment_succeeded": {
				const invoice = event.data.object as Stripe.Invoice;
				const subscriptionId = invoice.parent?.subscription_details?.subscription.toString();

				if (!subscriptionId) {
					Logger.warn(pathname, { message: "No subscription ID in invoice" });
					break;
				}

				// Get subscription to find user
				const subscription = await stripeService.getSubscription(subscriptionId);
				const clerkUserId = subscription.metadata?.clerk_user_id;

				if (!clerkUserId) {
					Logger.warn(pathname, { message: "No clerk_user_id in subscription metadata" });
					break;
				}

				// Get user to determine tier
				const user = await userService.getUserByClerkId(clerkUserId);
				if (!user) {
					Logger.error(pathname, { message: `User not found: ${clerkUserId}` });
					break;
				}

				// Renew credits for the billing period (includes both initial and renewal invoices)
				if (
					invoice.billing_reason === "subscription_cycle" ||
					invoice.billing_reason === "subscription_create"
				) {
					await creditService.resetCreditsForTier(clerkUserId, user.tier);
					Logger.info(pathname, {
						clerkUserId,
						tier: user.tier,
						billing_reason: invoice.billing_reason,
						message: "Credits allocated for subscription invoice",
					});
				}
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				const subscriptionId = invoice.parent?.subscription_details?.subscription.toString();

				if (!subscriptionId) {
					Logger.warn(pathname, { message: "No subscription ID in invoice" });
					break;
				}

				const subscription = await stripeService.getSubscription(subscriptionId);
				const clerkUserId = subscription.metadata?.clerk_user_id;

				if (!clerkUserId) {
					Logger.warn(pathname, { message: "No clerk_user_id in subscription metadata" });
					break;
				}

				// Update subscription status
				await userService.updateSubscription(clerkUserId, {
					stripe_subscription_status: "past_due",
				});

				Logger.warn(pathname, {
					clerkUserId,
					message: "Payment failed, subscription marked as past_due",
				});
				break;
			}

			default:
				Logger.info(pathname, { message: `Unhandled Stripe event type: ${event.type}` });
		}

		return c.json({ received: true });
	} catch (error) {
		Logger.error(pathname, { message: `Stripe webhook error: ${error}` });
		return c.json(
			{
				error: "Webhook processing failed",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			400,
		);
	}
};
