import { NextRequest, NextResponse } from "next/server"
import { auth, roleAtLeast } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"
import type { Role } from "@prisma/client"

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!roleAtLeast(session.user.role as Role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const isAttempts = searchParams.get("attempts") === "true"

    try {
      if (isAttempts) {
        const attempts = await prisma.loginAttempt.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            email: true,
            ip: true,
            success: true,
            failReason: true,
            createdAt: true,
          },
        })
        return NextResponse.json({ attempts })
      }

      const sessions = await prisma.session.findMany({
        where: { expires: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      })

      return NextResponse.json({ sessions })
    } catch (error) {
      console.error("[security/sessions GET]", error)
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }
  })
}

export async function DELETE(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!roleAtLeast(session.user.role as Role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
      const body = (await req.json()) as { sessionId: string }
      const { sessionId } = body

      if (!sessionId) {
        return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
      }

      const target = await prisma.session.findUnique({ where: { id: sessionId } })
      if (!target) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }

      await prisma.session.delete({ where: { id: sessionId } })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "security.session_kill",
        resource: `Session:${sessionId}`,
        details: { targetUserId: target.userId },
        ip: getClientIp(req),
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[security/sessions DELETE]", error)
      return NextResponse.json({ error: "Failed to kill session" }, { status: 500 })
    }
  })
}
