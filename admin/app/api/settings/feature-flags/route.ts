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

    const { searchParams } = new URL(req.url)
    const isAnnouncements = searchParams.get("announcements") === "true"

    try {
      if (isAnnouncements) {
        const announcements = await prisma.announcement.findMany({
          where: { active: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
        return NextResponse.json({ announcements })
      }

      const flags = await prisma.featureFlag.findMany({
        orderBy: { createdAt: "asc" },
      })
      return NextResponse.json({ flags })
    } catch (error) {
      console.error("[settings/feature-flags GET]", error)
      return NextResponse.json({ error: "Failed to fetch flags" }, { status: 500 })
    }
  })
}

export async function PATCH(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!roleAtLeast(session.user.role as Role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
      const body = (await req.json()) as { id: string; enabled: boolean }
      const { id, enabled } = body

      if (!id || enabled === undefined) {
        return NextResponse.json({ error: "Missing id or enabled" }, { status: 400 })
      }

      const flag = await prisma.featureFlag.update({
        where: { id },
        data: { enabled, updatedBy: session.user.id },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "settings.feature_flag_toggle",
        resource: `FeatureFlag:${id}`,
        details: { key: flag.key, enabled },
        ip: getClientIp(req),
      })

      return NextResponse.json({ flag })
    } catch (error) {
      console.error("[settings/feature-flags PATCH]", error)
      return NextResponse.json({ error: "Failed to update flag" }, { status: 500 })
    }
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

    const { searchParams } = new URL(req.url)
    const isAnnouncements = searchParams.get("announcements") === "true"

    try {
      if (isAnnouncements) {
        const body = (await req.json()) as {
          content: string
          type?: string
          scheduledAt?: string
          expiresAt?: string
        }
        const { content, type = "info", scheduledAt, expiresAt } = body

        if (!content?.trim()) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        const announcement = await prisma.announcement.create({
          data: {
            content,
            type,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            createdBy: session.user.id,
          },
        })

        return NextResponse.json({ announcement })
      }

      const body = (await req.json()) as {
        key: string
        name: string
        description?: string
        enabled?: boolean
      }
      const { key, name, description, enabled = false } = body

      if (!key?.trim() || !name?.trim()) {
        return NextResponse.json({ error: "Key and name are required" }, { status: 400 })
      }

      const flag = await prisma.featureFlag.create({
        data: { key, name, description, enabled, updatedBy: session.user.id },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "settings.feature_flag_create",
        resource: `FeatureFlag:${flag.id}`,
        details: { key, name },
        ip: getClientIp(req),
      })

      return NextResponse.json({ flag })
    } catch (error) {
      console.error("[settings/feature-flags POST]", error)
      return NextResponse.json({ error: "Failed to create" }, { status: 500 })
    }
  })
}
