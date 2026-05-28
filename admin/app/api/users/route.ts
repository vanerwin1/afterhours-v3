import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"
import { roleAtLeast } from "@/lib/auth"
import type { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

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
    const search = searchParams.get("search") ?? ""
    const roleFilter = searchParams.get("role")
    const bannedFilter = searchParams.get("banned")
    const format = searchParams.get("format")

    try {
      const users = await prisma.user.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { email: { contains: search, mode: "insensitive" } },
                    { name: { contains: search, mode: "insensitive" } },
                  ],
                }
              : {},
            roleFilter ? { role: roleFilter as Role } : {},
            bannedFilter !== null && bannedFilter !== undefined && bannedFilter !== ""
              ? { banned: bannedFilter === "true" }
              : {},
          ],
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          banned: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      })

      if (format === "csv") {
        const header = "id,email,name,role,banned,lastLoginAt,createdAt\n"
        const rows = users
          .map(
            (u) =>
              `${u.id},"${u.email}","${u.name ?? ""}",${u.role},${u.banned},${u.lastLoginAt?.toISOString() ?? ""},${u.createdAt.toISOString()}`
          )
          .join("\n")
        return new NextResponse(header + rows, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=users.csv",
          },
        })
      }

      return NextResponse.json({ users })
    } catch (error) {
      console.error("[users GET]", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
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
      const body = (await req.json()) as {
        email: string
        name?: string
        password?: string
        role?: Role
      }

      const { email, name, password, role = "viewer" } = body

      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 })
      }

      const hash = password ? await bcrypt.hash(password, 12) : undefined

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name,
          password: hash,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          banned: true,
          createdAt: true,
        },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "user.create",
        resource: `User:${user.id}`,
        details: { email: user.email, role: user.role },
        ip: getClientIp(req),
      })

      return NextResponse.json({ user })
    } catch (error) {
      console.error("[users POST]", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
  })
}
