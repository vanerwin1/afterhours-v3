import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"

export async function PATCH(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = (await req.json()) as { name?: string }
      const { name } = body

      if (!name?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
      }

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { name: name.trim() },
        select: { id: true, name: true, email: true },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "account.profile_update",
        details: { name: name.trim() },
        ip: getClientIp(req),
      })

      return NextResponse.json({ user })
    } catch (error) {
      console.error("[account PATCH]", error)
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
  })
}
