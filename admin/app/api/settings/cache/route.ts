import { NextRequest, NextResponse } from "next/server"
import { auth, roleAtLeast } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { redis } from "@/lib/redis"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"
import type { Role } from "@prisma/client"

// Re-export getRecentAuditLogs from audit.ts via this route
// GET: return audit logs (used by settings page for audit tab)
export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isAudit = searchParams.get("audit") === "true"

    if (isAudit) {
      try {
        const { getRecentAuditLogs: fetchLogs } = await import("@/lib/audit")
        const logs = await fetchLogs(200)
        return NextResponse.json({ logs })
      } catch (error) {
        console.error("[settings/cache GET audit]", error)
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Use POST to invalidate cache" })
  })
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!roleAtLeast(session.user.role as Role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
      const body = (await req.json()) as { pattern?: string; keys?: string[] }
      const { pattern, keys = [] } = body

      const deleted: string[] = []

      if (!redis) {
        return NextResponse.json({ success: true, deleted: 0, note: "Redis not configured" })
      }

      if (keys.length > 0) {
        for (const key of keys) {
          await redis.del(key)
          deleted.push(key)
        }
      } else if (pattern) {
        // Since Upstash doesn't support KEYS/SCAN in a simple way,
        // we clear known cache key patterns
        const commonPrefixes = ["cc_api:", "cc_login:", "cc_dashboard:", "cc_stats:"]
        for (const prefix of commonPrefixes) {
          if (pattern === "cc_*" || pattern.startsWith(prefix)) {
            await redis.del(prefix)
            deleted.push(prefix)
          }
        }
      }

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "settings.cache_clear",
        details: { pattern, keysDeleted: deleted.length },
        ip: getClientIp(req),
      })

      return NextResponse.json({ success: true, deleted: deleted.length })
    } catch (error) {
      console.error("[settings/cache POST]", error)
      return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
    }
  })
}
