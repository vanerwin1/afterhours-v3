import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { sendSlackAlert } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: [{ read: "asc" }, { createdAt: "desc" }],
        take: 50,
      })
      return NextResponse.json({ notifications })
    } catch (error) {
      console.error("[notifications GET]", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
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
      const body = (await req.json()) as { id?: string; markAll?: boolean }
      const { id, markAll } = body

      if (markAll) {
        await prisma.notification.updateMany({
          where: { userId: session.user.id, read: false },
          data: { read: true },
        })
        return NextResponse.json({ success: true })
      }

      if (id) {
        await prisma.notification.update({
          where: { id, userId: session.user.id },
          data: { read: true },
        })
        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ error: "Missing id or markAll" }, { status: 400 })
    } catch (error) {
      console.error("[notifications PATCH]", error)
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
    }
  })
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = (await req.json()) as { test?: boolean }
      if (body.test) {
        await sendSlackAlert(
          `Test notification from ${session.user.email} — AfterHours Command Center is working correctly.`,
          "info"
        )
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    } catch (error) {
      console.error("[notifications POST]", error)
      return NextResponse.json({ error: "Failed" }, { status: 500 })
    }
  })
}
