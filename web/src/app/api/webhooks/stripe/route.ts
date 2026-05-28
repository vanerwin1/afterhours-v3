import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// We verify webhooks using the raw body and Stripe-Signature header.
// This handler is intentionally lightweight — no DB dependency.

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ""

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    console.warn("[web/stripe-webhook] Missing signature or secret")
    return NextResponse.json({ error: "missing_signature" }, { status: 400 })
  }

  // Verify signature using Web Crypto (Edge/Node compatible)
  let event: { type: string; id: string; data: { object: Record<string, unknown> } }
  try {
    // Parse timestamp and signature from header
    const parts = sig.split(",").reduce<Record<string, string[]>>((acc, part) => {
      const [k, v] = part.split("=")
      if (!acc[k]) acc[k] = []
      acc[k].push(v)
      return acc
    }, {})

    const timestamp = parts["t"]?.[0]
    const signatures = parts["v1"] ?? []

    if (!timestamp || signatures.length === 0) {
      return NextResponse.json({ error: "invalid_signature_format" }, { status: 400 })
    }

    // Replay attack check (5 minute tolerance)
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      return NextResponse.json({ error: "timestamp_too_old" }, { status: 400 })
    }

    const signed = `${timestamp}.${body}`
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signed))
    const computed = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const valid = signatures.some((s) => {
      // Constant-time comparison
      if (s.length !== computed.length) return false
      let diff = 0
      for (let i = 0; i < s.length; i++) diff |= s.charCodeAt(i) ^ computed.charCodeAt(i)
      return diff === 0
    })

    if (!valid) {
      console.error("[web/stripe-webhook] Signature mismatch")
      return NextResponse.json({ error: "invalid_signature" }, { status: 400 })
    }

    event = JSON.parse(body) as typeof event
  } catch (err) {
    console.error("[web/stripe-webhook] Verification error:", err)
    return NextResponse.json({ error: "verification_failed" }, { status: 400 })
  }

  // Handle events
  const obj = event.data.object
  switch (event.type) {
    case "checkout.session.completed":
      console.log("[web/stripe-webhook] Checkout completed:", event.id)
      break

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      console.log(`[web/stripe-webhook] ${event.type}:`, (obj as { id?: string }).id)
      break

    case "invoice.payment_succeeded":
      console.log("[web/stripe-webhook] Payment succeeded:", event.id)
      break

    case "invoice.payment_failed":
      console.log("[web/stripe-webhook] Payment FAILED:", event.id, (obj as { customer_email?: string }).customer_email)
      break

    default:
      break
  }

  return NextResponse.json({ received: true })
}
