import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

interface BookingRecord {
  type: "booking" | "lead"
  raw: string
  name: string
  service?: string
  time?: string
  phone?: string
  reason?: string
  session_id: string
  captured_at: string
}

interface AgentBookingsResponse {
  count: number
  records: BookingRecord[]
  log: string
}

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agentUrl = process.env.AFTERHOURS_AGENT_URL
    const adminKey = process.env.AFTERHOURS_AGENT_ADMIN_KEY

    if (!agentUrl || !adminKey) {
      return NextResponse.json({
        error: "Agent server not configured",
        hint: "Set AFTERHOURS_AGENT_URL and AFTERHOURS_AGENT_ADMIN_KEY in .env",
        records: [],
        count: 0,
      })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") ?? ""
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 500)

    try {
      const params = new URLSearchParams({
        key: adminKey,
        limit: String(limit),
      })
      if (type) params.set("type", type)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const res = await fetch(`${agentUrl}/bookings?${params}`, {
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        console.error("[bookings proxy] Agent error:", res.status, text)
        return NextResponse.json(
          { error: "Agent server returned an error", records: [], count: 0 },
          { status: 502 }
        )
      }

      const data = (await res.json()) as AgentBookingsResponse
      return NextResponse.json({
        records: data.records ?? [],
        count: data.count ?? 0,
      })
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError"
      console.error("[bookings proxy]", error)
      return NextResponse.json(
        {
          error: isAbort ? "Agent server timed out" : "Failed to reach agent server",
          records: [],
          count: 0,
        },
        { status: 502 }
      )
    }
  })
}
