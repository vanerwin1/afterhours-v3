/**
 * /api/leads — lead capture endpoint
 *
 * POST: anonymous create — the public website calls this with the shared
 *       LEADS_API_KEY in the `x-api-key` header. Body is a JSON document
 *       describing the lead (name, email, phone, source, etc.). No session
 *       required. Rate limited and validated.
 *
 * GET:  authenticated read — requires a logged-in admin session. Returns
 *       the most recent leads (with filtering via query params).
 *
 * This is the canonical website ↔ dashboard connection point. Anything the
 * site captures from visitors (contact forms, demo requests, ROI submissions,
 * etc.) flows in here and shows up in /dashboard/leads.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth, roleAtLeast } from "@/lib/auth"
import { withRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"
import { getClientIp } from "@/lib/utils"
import type { Role } from "@prisma/client"
import crypto from "node:crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Maximum length per text field, to keep DB rows small and reject spam blobs.
const MAX_FIELD_LEN = 4000
const MAX_MESSAGE_LEN = 8000

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

function sanitize(value: unknown, max = MAX_FIELD_LEN): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

function looksLikeEmail(s: string): boolean {
  // Cheap RFC-5322-ish check; we don't try to be too clever.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

// ── POST: create a lead (called by the website) ───────────────────────────────
export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    // API key check — shared secret between web and admin.
    const expected = process.env.LEADS_API_KEY
    if (!expected) {
      console.error("[leads POST] LEADS_API_KEY not configured")
      return NextResponse.json({ error: "endpoint_not_configured" }, { status: 503 })
    }
    const provided = req.headers.get("x-api-key") ?? ""
    if (!provided || !constantTimeCompare(provided, expected)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // Parse + validate body.
    let body: Record<string, unknown>
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 })
    }

    const email = sanitize(body.email)
    if (!email || !looksLikeEmail(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 })
    }

    const name      = sanitize(body.name)
    const phone     = sanitize(body.phone)
    const company   = sanitize(body.company)
    const industry  = sanitize(body.industry)
    const message   = sanitize(body.message, MAX_MESSAGE_LEN)
    const source    = sanitize(body.source) ?? "website"
    const referrer  = sanitize(body.referrer)
    const pagePath  = sanitize(body.pagePath, 500)
    const utm       = (typeof body.utm === "object" && body.utm !== null) ? body.utm : undefined

    const ip        = getClientIp(req)
    const userAgent = req.headers.get("user-agent")?.slice(0, MAX_FIELD_LEN) ?? null

    try {
      const lead = await prisma.lead.create({
        data: {
          email,
          name,
          phone,
          company,
          industry,
          message,
          source,
          referrer,
          pagePath,
          utm: utm as object | undefined,
          ip,
          userAgent,
        },
        select: { id: true, createdAt: true },
      })
      return NextResponse.json({ ok: true, id: lead.id, createdAt: lead.createdAt })
    } catch (err) {
      console.error("[leads POST] DB insert failed:", err)
      return NextResponse.json({ error: "persistence_failed" }, { status: 500 })
    }
  }, "api")
}

// ── GET: list leads (called by the admin dashboard) ───────────────────────────
export async function GET(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    if (!roleAtLeast(session.user.role as Role, "viewer")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status   = sanitize(searchParams.get("status"))
    const limit    = Math.min(parseInt(searchParams.get("limit") ?? "50", 10) || 50, 200)
    const cursor   = sanitize(searchParams.get("cursor"))

    try {
      const leads = await prisma.lead.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      })
      const nextCursor = leads.length === limit ? leads[leads.length - 1].id : null
      return NextResponse.json({ leads, nextCursor })
    } catch (err) {
      console.error("[leads GET] DB query failed:", err)
      return NextResponse.json({ error: "query_failed" }, { status: 500 })
    }
  })
}

// ── PATCH: update lead status / notes / assignment ────────────────────────────
export async function PATCH(req: NextRequest) {
  return withRateLimit(req, async () => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    if (!roleAtLeast(session.user.role as Role, "admin")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    let body: Record<string, unknown>
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 })
    }

    const id = sanitize(body.id)
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 })

    const update: Record<string, unknown> = {}
    const status     = sanitize(body.status)
    const notes      = sanitize(body.notes, MAX_MESSAGE_LEN)
    const assignedTo = sanitize(body.assignedTo)
    if (status     !== null) update.status     = status
    if (notes      !== null) update.notes      = notes
    if (assignedTo !== null) update.assignedTo = assignedTo

    try {
      const lead = await prisma.lead.update({ where: { id }, data: update })
      await audit({
        userId: session.user.id,
        userEmail: session.user.email ?? "",
        action: "lead.update",
        resource: id,
        details: update,
        ip: getClientIp(req),
      })
      return NextResponse.json({ ok: true, lead })
    } catch (err) {
      console.error("[leads PATCH] update failed:", err)
      return NextResponse.json({ error: "update_failed" }, { status: 500 })
    }
  })
}
