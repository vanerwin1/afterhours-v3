import { NextRequest, NextResponse } from "next/server"
import { auth, roleAtLeast } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"
import { sendEmailAlert } from "@/lib/notifications"
import type { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!roleAtLeast(session.user.role as Role, "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    try {
      const body = (await req.json()) as {
        role?: Role
        banned?: boolean
        name?: string
        resetPassword?: boolean
      }
      const { role, banned, name, resetPassword } = body

      const existingUser = await prisma.user.findUnique({ where: { id } })
      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Only super_admin can promote to super_admin
      if (role === "super_admin" && !roleAtLeast(session.user.role as Role, "super_admin")) {
        return NextResponse.json({ error: "Cannot assign super_admin role" }, { status: 403 })
      }

      if (resetPassword) {
        const tempPassword = Math.random().toString(36).slice(-12)
        const hash = await bcrypt.hash(tempPassword, 12)
        await prisma.user.update({ where: { id }, data: { password: hash } })
        // Send email with temp password
        if (existingUser.email) {
          await sendEmailAlert(
            existingUser.email,
            "Your password has been reset — AfterHours",
            `<p>Your password has been reset by an administrator.</p><p><b>Temporary password:</b> <code>${tempPassword}</code></p><p>Please log in and change it immediately.</p>`
          )
        }
        await audit({
          userId: session.user.id,
          userEmail: session.user.email,
          action: "user.password_reset",
          resource: `User:${id}`,
          ip: getClientIp(req),
        })
        return NextResponse.json({ success: true })
      }

      const updateData: Record<string, unknown> = {}
      if (role !== undefined) updateData.role = role
      if (name !== undefined) updateData.name = name
      if (banned !== undefined) {
        updateData.banned = banned
        if (banned) {
          updateData.bannedAt = new Date()
          updateData.bannedBy = session.user.id
        } else {
          updateData.bannedAt = null
          updateData.bannedBy = null
          updateData.bannedReason = null
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          banned: true,
          lastLoginAt: true,
          createdAt: true,
        },
      })

      const action = banned !== undefined
        ? banned ? "user.ban" : "user.unban"
        : role !== undefined
        ? "user.role_change"
        : "user.update"

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action,
        resource: `User:${id}`,
        details: { ...updateData, targetEmail: existingUser.email },
        ip: getClientIp(req),
      })

      return NextResponse.json({ user })
    } catch (error) {
      console.error("[users/[id] PATCH]", error)
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!roleAtLeast(session.user.role as Role, "super_admin")) {
      return NextResponse.json({ error: "Forbidden — super_admin required" }, { status: 403 })
    }

    const { id } = params

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    try {
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      await prisma.user.delete({ where: { id } })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "user.delete",
        resource: `User:${id}`,
        details: { deletedEmail: user.email },
        ip: getClientIp(req),
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[users/[id] DELETE]", error)
      return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
  })
}
