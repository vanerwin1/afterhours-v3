import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import {
  listSubscriptions,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from "@/lib/stripe"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const result = await listSubscriptions()
      return NextResponse.json({ subscriptions: result.data })
    } catch (error) {
      console.error("[stripe/subscriptions GET]", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }
  })
}

export async function PATCH(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = (await req.json()) as { id: string; action: "cancel" | "pause" | "resume" }
      const { id, action } = body

      if (!id || !action) {
        return NextResponse.json({ error: "Missing id or action" }, { status: 400 })
      }

      let result
      if (action === "cancel") {
        result = await cancelSubscription(id)
      } else if (action === "pause") {
        result = await pauseSubscription(id)
      } else if (action === "resume") {
        result = await resumeSubscription(id)
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
      }

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: `stripe.subscription_${action}`,
        resource: `Subscription:${id}`,
        ip: getClientIp(req),
      })

      return NextResponse.json({ subscription: result })
    } catch (error) {
      console.error("[stripe/subscriptions PATCH]", error)
      return NextResponse.json({ error: "Action failed" }, { status: 500 })
    }
  })
}
