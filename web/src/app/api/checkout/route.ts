import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? ""

// Plan → Stripe price mapping
const PRICE_IDS: Record<string, Record<string, string>> = {
  monthly: {
    starter:  process.env.STRIPE_PRICE_STARTER  ?? "",
    pro:      process.env.STRIPE_PRICE_PRO       ?? "",
    business: process.env.STRIPE_PRICE_BUSINESS  ?? "",
    agency:   process.env.STRIPE_PRICE_AGENCY    ?? "",
  },
  annual: {
    starter:  process.env.STRIPE_PRICE_STARTER_ANNUAL  ?? "",
    pro:      process.env.STRIPE_PRICE_PRO_ANNUAL       ?? "",
    business: process.env.STRIPE_PRICE_BUSINESS_ANNUAL  ?? "",
    agency:   process.env.STRIPE_PRICE_AGENCY_ANNUAL    ?? "",
  },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-pearl-xi.vercel.app"

async function stripeRequest(path: string, data: Record<string, string>): Promise<Record<string, unknown>> {
  const body = new URLSearchParams(data).toString()
  const res = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })
  return res.json() as Promise<Record<string, unknown>>
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { plan?: string; billing?: string; email?: string }
    const plan = (body.plan ?? "").toLowerCase().trim()
    const billing = body.billing === "annual" ? "annual" : "monthly"
    const email = (body.email ?? "").trim()

    if (!["starter", "pro", "business", "agency"].includes(plan)) {
      return NextResponse.json({ error: "invalid_plan" }, { status: 400 })
    }

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 })
    }

    const priceId = PRICE_IDS[billing][plan]
    if (!priceId) {
      return NextResponse.json({ error: "price_not_configured" }, { status: 503 })
    }

    const checkoutData: Record<string, string> = {
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&billing=${billing}`,
      cancel_url: `${SITE_URL}/#pricing`,
      "subscription_data[metadata][plan]": plan,
      "subscription_data[metadata][billing]": billing,
      allow_promotion_codes: "true",
      billing_address_collection: "auto",
    }

    if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      checkoutData.customer_email = email
    }

    const session = await stripeRequest("/v1/checkout/sessions", checkoutData)

    if (session.error) {
      const stripeErr = session.error as { message?: string }
      console.error("[checkout] Stripe error:", stripeErr.message)
      return NextResponse.json({ error: "stripe_error" }, { status: 400 })
    }

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    })
  } catch (err) {
    console.error("[checkout] Error:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
