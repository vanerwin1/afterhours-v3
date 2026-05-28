import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Revenue today from Stripe
      let revenueToday = 0
      let revenueTodayChange: string | undefined

      try {
        const { stripe } = await import("@/lib/stripe")
        const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
        const charges = await stripe.charges.list({
          created: { gte: startOfDay },
          limit: 100,
        })
        revenueToday = charges.data
          .filter((c) => c.status === "succeeded")
          .reduce((sum, c) => sum + c.amount, 0)

        // Yesterday's revenue for comparison
        const startOfYesterday = startOfDay - 86400
        const yesterdayCharges = await stripe.charges.list({
          created: { gte: startOfYesterday, lte: startOfDay },
          limit: 100,
        })
        const revenueYesterday = yesterdayCharges.data
          .filter((c) => c.status === "succeeded")
          .reduce((sum, c) => sum + c.amount, 0)

        if (revenueYesterday > 0) {
          const pct = ((revenueToday - revenueYesterday) / revenueYesterday) * 100
          revenueTodayChange = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs yesterday`
        }
      } catch {
        // Stripe not configured
      }

      // Active sessions count
      const activeSessions = await prisma.session.count({
        where: { expires: { gt: new Date() } },
      })

      // Pending alerts (unread notifications for this user)
      const pendingAlerts = await prisma.notification.count({
        where: { userId: session.user.id, read: false },
      })

      // Server health check
      let serverHealth = "unknown"
      const agentUrl = process.env.AFTERHOURS_AGENT_URL
      if (agentUrl) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 5000)
          const healthRes = await fetch(`${agentUrl}/health`, {
            signal: controller.signal,
            headers: {
              "x-admin-key": process.env.AFTERHOURS_AGENT_ADMIN_KEY ?? "",
            },
          })
          clearTimeout(timeout)
          serverHealth = healthRes.ok ? "ok" : "error"
        } catch {
          serverHealth = "down"
        }
      }

      return NextResponse.json({
        revenueToday,
        revenueTodayChange,
        activeSessions,
        serverHealth,
        pendingAlerts,
      })
    } catch (error) {
      console.error("[dashboard/stats]", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
}
