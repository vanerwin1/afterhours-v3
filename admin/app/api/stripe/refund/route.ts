import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { createRefund } from "@/lib/stripe"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = (await req.json()) as { paymentIntentId: string; amount?: number }
      const { paymentIntentId, amount } = body

      if (!paymentIntentId) {
        return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 })
      }

      const refund = await createRefund(paymentIntentId, amount)

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "stripe.refund",
        resource: `Payment:${paymentIntentId}`,
        details: { refundId: refund.id, amount: refund.amount, currency: refund.currency },
        ip: getClientIp(req),
      })

      return NextResponse.json({ refund })
    } catch (error) {
      console.error("[stripe/refund]", error)
      return NextResponse.json({ error: "Refund failed" }, { status: 500 })
    }
  })
}
