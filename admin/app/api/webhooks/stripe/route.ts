import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { notifyFailedPayment } from "@/lib/notifications"
import type Stripe from "stripe"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Store event for idempotency (wrapped — DB may be unavailable on Vercel)
  try {
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    })
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }
  } catch {
    // DB unavailable — skip idempotency check, still process the event
    console.warn("[stripe/webhook] DB unavailable for idempotency check — proceeding")
  }

  let processed = false
  let error: string | undefined

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("[stripe/webhook] Checkout completed:", session.id)
        processed = true
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        console.log(`[stripe/webhook] Subscription ${event.type}:`, sub.id)
        processed = true
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerEmail =
          typeof invoice.customer_email === "string"
            ? invoice.customer_email
            : "unknown@customer.com"
        await notifyFailedPayment(
          customerEmail,
          invoice.amount_due,
          invoice.currency
        )
        processed = true
        break
      }

      default:
        processed = true
        break
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error"
    console.error("[stripe/webhook] Processing error:", err)
  }

  // Persist to DB (best-effort — don't fail the webhook if DB is down)
  try {
    await prisma.webhookEvent.create({
      data: {
        source: "stripe",
        eventId: event.id,
        eventType: event.type,
        payload: event as unknown as import("@prisma/client").Prisma.InputJsonValue,
        processed,
        error,
        processedAt: processed ? new Date() : undefined,
      },
    })
  } catch (dbErr) {
    console.error("[stripe/webhook] DB write failed (non-fatal):", dbErr)
  }

  return NextResponse.json({ received: true })
}
