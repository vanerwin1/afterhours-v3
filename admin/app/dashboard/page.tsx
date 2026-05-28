import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DollarSign, Users, Server, Bell } from "lucide-react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { prisma } from "@/lib/prisma"

// Compute dashboard stats directly (server component — no self-fetch).
async function getDashboardStats(userId: string) {
  try {
    // ── Revenue today from Stripe (optional) ────────────────────────────────
    let revenueToday = 0
    let revenueTodayChange: string | undefined
    try {
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("your_")) {
        const { stripe } = await import("@/lib/stripe")
        const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)
        const charges = await stripe.charges.list({
          created: { gte: startOfDay },
          limit: 100,
        })
        revenueToday = charges.data
          .filter((c) => c.status === "succeeded")
          .reduce((sum, c) => sum + c.amount, 0)

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
      }
    } catch {
      // Stripe unavailable — leave zeros
    }

    // ── Active sessions count ───────────────────────────────────────────────
    // With JWT sessions there are no DB rows, so this is always 0 unless the
    // Session table is populated by other adapters. Wrapped in try just in case.
    let activeSessions = 0
    try {
      activeSessions = await prisma.session.count({
        where: { expires: { gt: new Date() } },
      })
    } catch {
      // table may not exist or be empty
    }

    // ── Pending alerts (unread notifications for this user) ─────────────────
    let pendingAlerts = 0
    try {
      pendingAlerts = await prisma.notification.count({
        where: { userId, read: false },
      })
    } catch {
      // ignore
    }

    // ── Server health check (agent server) ──────────────────────────────────
    let serverHealth = "unknown"
    const agentUrl = process.env.AFTERHOURS_AGENT_URL
    if (agentUrl) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3000)
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

    return {
      revenueToday,
      revenueTodayChange,
      activeSessions,
      serverHealth,
      pendingAlerts,
    }
  } catch (err) {
    console.error("[dashboard] getDashboardStats failed:", err)
    return null
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const stats = await getDashboardStats(session.user.id)

  const cards = [
    {
      title: "Revenue Today",
      value: stats
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
            (stats.revenueToday ?? 0) / 100
          )
        : "$0.00",
      icon: <DollarSign className="h-5 w-5" />,
      change: stats?.revenueTodayChange,
      changeType: "up" as const,
      description: "from Stripe",
      loading: !stats,
    },
    {
      title: "Active Sessions",
      value: stats ? String(stats.activeSessions ?? 0) : "—",
      icon: <Users className="h-5 w-5" />,
      change: undefined,
      changeType: "neutral" as const,
      description: "authenticated users",
      loading: !stats,
    },
    {
      title: "Server Health",
      value: stats?.serverHealth === "ok" ? "Healthy" : stats?.serverHealth === "down" ? "Down" : "Unknown",
      icon: <Server className="h-5 w-5" />,
      changeType:
        stats?.serverHealth === "ok"
          ? ("up" as const)
          : stats?.serverHealth === "down"
          ? ("down" as const)
          : ("neutral" as const),
      description: "agent server status",
      loading: !stats,
    },
    {
      title: "Pending Alerts",
      value: stats ? String(stats.pendingAlerts ?? 0) : "—",
      icon: <Bell className="h-5 w-5" />,
      changeType: stats && stats.pendingAlerts > 0 ? ("down" as const) : ("neutral" as const),
      description: "unread notifications",
      loading: !stats,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Welcome back, {session.user.name?.split(" ")[0] ?? "Admin"}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with AfterHours today.
        </p>
      </div>

      <StatsCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
