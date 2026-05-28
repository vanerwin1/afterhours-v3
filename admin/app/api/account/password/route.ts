import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = (await req.json()) as {
        currentPassword: string
        newPassword: string
      }
      const { currentPassword, newPassword } = body

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Current and new passwords are required" },
          { status: 400 }
        )
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      })

      if (!user?.password) {
        return NextResponse.json(
          { error: "Password login not available for this account (OAuth only)" },
          { status: 400 }
        )
      }

      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      const hash = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hash },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "account.password_change",
        ip: getClientIp(req),
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[account/password PATCH]", error)
      return NextResponse.json({ error: "Password change failed" }, { status: 500 })
    }
  })
}
