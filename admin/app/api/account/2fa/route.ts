import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"
import * as OTPAuth from "otpauth"
import QRCode from "qrcode"

export const dynamic = "force-dynamic"

/** GET — Generate a new TOTP setup (secret + QR code data URL). Not saved yet. */
export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Check current 2FA status
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { twoFactorEnabled: true, twoFactorSecret: true },
      })

      if (user?.twoFactorEnabled) {
        return NextResponse.json({ enabled: true })
      }

      // Generate a new TOTP secret
      const secret = new OTPAuth.Secret({ size: 20 })
      const totp = new OTPAuth.TOTP({
        issuer: "AfterHours Command Center",
        label: session.user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret,
      })

      const otpauthUrl = totp.toString()
      const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
        width: 200,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      })

      return NextResponse.json({
        enabled: false,
        secret: secret.base32,
        otpauthUrl,
        qrDataUrl,
      })
    } catch (error) {
      console.error("[account/2fa GET]", error)
      return NextResponse.json({ error: "Failed to generate 2FA setup" }, { status: 500 })
    }
  })
}

/** POST — Enable 2FA: verify the code against the provided secret and save. */
export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = (await req.json()) as { secret: string; code: string }
      const { secret, code } = body

      if (!secret || !code) {
        return NextResponse.json({ error: "Missing secret or code" }, { status: 400 })
      }

      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(secret),
        digits: 6,
        period: 30,
      })

      const delta = totp.validate({ token: code.replace(/\s/g, ""), window: 1 })
      if (delta === null) {
        return NextResponse.json({ error: "Invalid code — please try again" }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: secret,
        },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "account.2fa_enabled",
        ip: getClientIp(req),
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[account/2fa POST]", error)
      return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 })
    }
  })
}

/** DELETE — Disable 2FA: verify the current code then remove secret. */
export async function DELETE(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const body = (await req.json()) as { code: string }
      const { code } = body

      if (!code) {
        return NextResponse.json({ error: "Confirmation code required" }, { status: 400 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { twoFactorEnabled: true, twoFactorSecret: true },
      })

      if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
        return NextResponse.json({ error: "2FA is not enabled" }, { status: 400 })
      }

      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
        digits: 6,
        period: 30,
      })

      const delta = totp.validate({ token: code.replace(/\s/g, ""), window: 1 })
      if (delta === null) {
        return NextResponse.json({ error: "Invalid code — cannot disable 2FA" }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      })

      await audit({
        userId: session.user.id,
        userEmail: session.user.email,
        action: "account.2fa_disabled",
        ip: getClientIp(req),
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("[account/2fa DELETE]", error)
      return NextResponse.json({ error: "Failed to disable 2FA" }, { status: 500 })
    }
  })
}
