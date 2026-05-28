import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
})

export async function getStripeBalance() {
  return stripe.balance.retrieve()
}

export async function listPayments(limit = 50, startingAfter?: string) {
  return stripe.paymentIntents.list({
    limit,
    ...(startingAfter && { starting_after: startingAfter }),
  })
}

export async function listSubscriptions(limit = 50) {
  return stripe.subscriptions.list({
    limit,
    status: "all",
    expand: ["data.customer"],
  })
}

export async function cancelSubscription(id: string) {
  return stripe.subscriptions.cancel(id)
}

export async function pauseSubscription(id: string) {
  return stripe.subscriptions.update(id, {
    pause_collection: { behavior: "void" },
  })
}

export async function resumeSubscription(id: string) {
  return stripe.subscriptions.update(id, {
    pause_collection: "" as unknown as Stripe.SubscriptionUpdateParams.PauseCollection,
  })
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount !== undefined && { amount }),
  })
}

export async function getRevenueByDay(days = 30) {
  const now = Math.floor(Date.now() / 1000)
  const start = now - days * 86400
  const charges = await stripe.charges.list({
    created: { gte: start },
    limit: 100,
  })
  // Group by day
  const byDay: Record<string, number> = {}
  for (const c of charges.data) {
    if (c.status !== "succeeded") continue
    const d = new Date(c.created * 1000).toISOString().slice(0, 10)
    byDay[d] = (byDay[d] ?? 0) + c.amount
  }
  return Object.entries(byDay)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
