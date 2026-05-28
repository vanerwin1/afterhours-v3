import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { listPayments, getRevenueByDay } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isRevenue = searchParams.get("revenue") === "true"
    const limit = parseInt(searchParams.get("limit") ?? "50", 10)
    const startingAfter = searchParams.get("startingAfter") ?? undefined

    try {
      if (isRevenue) {
        const revenueByDay = await getRevenueByDay(30)
        return NextResponse.json({ revenueByDay })
      }

      const result = await listPayments(limit, startingAfter)
      return NextResponse.json({ payments: result.data, hasMore: result.has_more })
    } catch (error) {
      console.error("[stripe/payments]", error)
      return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
    }
  })
}
