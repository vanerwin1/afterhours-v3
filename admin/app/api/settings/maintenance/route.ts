import { NextRequest, NextResponse } from "next/server"
import { auth, roleAtLeast } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { sendSlackAlert } from "@/lib/notifications"
import { getClientIp } from "@/lib/utils"
import type { Role } from "@prisma/client"

export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "maintenance_mode" },
      })
      return NextResponse.json({ enabled: setting?.value === true || setting?.value === "true" })
    } catch (error) {
      console.error("[settings/maintenance GET]", error)
      return NextResponse.json({ error: "Failed to fetch maintenance state" }, { status: 500 })
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

    try {
      const body = (await req.json()) as { enabled?: boolean; slackUrl?: string; adminEmail?: string }
      const { enabled, slackUrl, adminEmail } = body

      if (enabled !== undefined) {
        await prisma.setting.upsert({
          where: { key: "maintenance_mode" },
          update: { value: enabled, updatedBy: session.user.id },
          create: { key: "maintenance_mode", value: enabled, updatedBy: session.user.id },
        })

        await audit({
          userId: session.user.id,
          userEmail: session.user.email,
          action: "settings.maintenance_toggle",
          details: { enabled },
          ip: getClientIp(req),
        })

        await sendSlackAlert(
          `Maintenance mode has been ${enabled ? "ENABLED" : "DISABLED"} by ${session.user.email}`,
          enabled ? "warning" : "info"
        )
      }

      if (slackUrl !== undefined) {
        await prisma.setting.upsert({
          where: { key: "slack_webhook_url" },
          update: { value: slackUrl, updatedBy: session.user.id },
          create: { key: "slack_webhook_url", value: slackUrl, updatedBy: session.user.id },
        })
      }

      if (adminEmail !== undefined) {
        await prisma.setting.upsert({
          where: { key: "admin_alert_email" },
          update: { value: adminEmail, updatedBy: session.user.id },
          create: { key: "admin_alert_email", value: adminEmail, updatedBy: session.user.id },
        })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[settings/maintenance POST]", error)
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }
  })
}
