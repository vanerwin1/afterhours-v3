import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const events = await prisma.webhookEvent.findMany({
        where: { source: "stripe" },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          eventType: true,
          processed: true,
          error: true,
          processedAt: true,
          createdAt: true,
        },
      })
      return NextResponse.json({ events })
    } catch (error) {
      console.error("[stripe/webhooks]", error)
      return NextResponse.json({ error: "Failed to fetch webhook events" }, { status: 500 })
    }
  })
}
