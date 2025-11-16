⏺ User Action → Stripe Events

Scenario 1: New Subscription (Happy Path)

1. User clicks payment link → (no event)
2. Fills out payment details → (no event)
3. Clicks "Subscribe" → Stripe processes payment
4. Payment succeeds → Events fire in order:
   - ✅ checkout.session.completed ← Handle initial setup here
   - customer.subscription.created ← Just logs, no action needed
   - ✅ invoice.paid ← Allocates credits (initial + renewals)
   - payment_intent.succeeded ← Ignore

What you do: Allocate credits, save Stripe IDs, set tier to "master"

---

Scenario 2: New Subscription (Payment Fails)

1. User clicks "Subscribe"
2. Card declined → Events:
   - checkout.session.async_payment_failed
   - ✅ invoice.payment_failed ← Log/alert

What you do: Mark subscription as past_due, maybe send email

---

Scenario 3: Monthly Renewal (30 days later)

1. Stripe auto-charges card on billing date
2. Payment succeeds → Events:
   - ✅ invoice.paid ← Reset credits for new month

What you do: Reset credits to tier limit

---

Scenario 4: Monthly Renewal Fails

1. Stripe tries to charge, card declined
2. Payment fails → Events:
   - ✅ invoice.payment_failed ← Subscription goes past_due

What you do: Update status, maybe disable access, Stripe retries automatically

---

Scenario 5: Upgrade (Master → Mythical)

1. User clicks "Upgrade" in customer portal
2. Selects mythical plan, confirms
3. Upgrade processed → Events:
   - ✅ customer.subscription.updated ← Price ID changes
   - ✅ invoice.paid ← Prorated charge/full new amount

What you do: Update tier to "mythical", reset credits to mythical limit

---

Scenario 6: User Cancels

1. User clicks "Cancel" in customer portal
2. Chooses "Cancel at end of period" or "Cancel immediately"
3. Cancellation processed → Events:
   - customer.subscription.updated (if cancel_at_period_end=true)
   - ✅ customer.subscription.deleted ← When actually canceled

What you do: Downgrade to "free", reset credits to 50

---

Summary - Events You Actually Care About:

| Event                         | When                    | Your Action                          |
| ----------------------------- | ----------------------- | ------------------------------------ |
| checkout.session.completed    | Initial purchase        | Save IDs, set tier, allocate credits |
| invoice.paid                  | Initial + every renewal | Reset credits for billing cycle      |
| customer.subscription.updated | Upgrade/downgrade       | Change tier, reset credits           |
| customer.subscription.deleted | Cancellation            | Set tier=free, reset credits         |
| invoice.payment_failed        | Payment fails           | Mark past_due, log                   |
