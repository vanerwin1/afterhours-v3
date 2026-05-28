import { NextRequest, NextResponse } from "next/server"
import { auth, roleAtLeast } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp, generateApiKeyId, sha256 } from "@/lib/utils"
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

    try {
      const keys = await prisma.apiKey.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          role: true,
          scopes: true,
          lastUsedAt: true,
          revokedAt: true,
          createdAt: true,
        },
      })
      return NextResponse.json({ keys })
    } catch (error) {
      console.error("[security/api-keys GET]", error)
      return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
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
      const body = (await req.json()) as { name: string; role?: Role; scopes?: string[] }
      const { name, role = "viewer", scopes = [] } = body

      if (!name?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
      }

      // Only super_admin can create super_admin keys
      if (role === "super_admin" && !roleAtLeast(session.user.role as Role, "super_admin")) {
        return NextResponse.json({ error: "Cannot create super_admin key" }, { status: 403 })
      }

      const fullKey = generateApiKeyId()
      const keyHash = await sha256(fullKey)
      const keyPrefix = fullKey.slice(0, 12)

      const apiKey = await prisma.apiKey.create({
        data: {
          name,
          keyHash,
          keyPrefix,
          role,
          scopes,
          createdBy: session.user.id,
        },
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          role: true,
          scopes: true,
          createdAt: true,
        },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "security.api_key_create",
        resource: `ApiKey:${apiKey.id}`,
        details: { name, role },
        ip: getClientIp(req),
      })

      // Return the full key ONCE — never stored in plain text
      return NextResponse.json({ key: fullKey, apiKey })
    } catch (error) {
      console.error("[security/api-keys POST]", error)
      return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
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
      const body = (await req.json()) as { keyId: string }
      const { keyId } = body

      if (!keyId) {
        return NextResponse.json({ error: "Missing keyId" }, { status: 400 })
      }

      await prisma.apiKey.update({
        where: { id: keyId },
        data: { revokedAt: new Date(), revokedBy: session.user.id },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "security.api_key_revoke",
        resource: `ApiKey:${keyId}`,
        ip: getClientIp(req),
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[security/api-keys DELETE]", error)
      return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 })
    }
  })
}
