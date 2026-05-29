/**
 * /api/debug — read-only health check + one-shot bootstrap actions.
 *
 * GET  — health check (DB connectivity, table presence).
 *
 * POST — only with the LEADS_API_KEY header (so it's not openly callable).
 *        Body: { action: "bootstrap-lead-table" }
 *        Creates the Lead table if it doesn't exist. Idempotent.
 *        This exists because Vercel's build step doesn't run
 *        `prisma migrate deploy`, so the schema and the DB can drift on
 *        the Lead model. Calling this once from the dashboard owner does
 *        the equivalent of a single migration apply.
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const result: Record<string, unknown> = { ok: true }
  try {
    result.users = await prisma.user.count()
  } catch (e) {
    result.usersError = e instanceof Error ? e.message : String(e)
    result.ok = false
  }
  try {
    // Use $queryRaw because prisma.lead may not exist on the generated client
    // if the deploy ran before the schema update.
    const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='Lead') AS exists`
    )
    result.leadTableExists = rows[0]?.exists ?? false
  } catch (e) {
    result.leadTableError = e instanceof Error ? e.message : String(e)
  }
  return NextResponse.json(result)
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(req: NextRequest) {
  const provided = req.headers.get("x-api-key") ?? ""
  const expected = process.env.LEADS_API_KEY ?? ""
  if (!expected || !provided || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: { action?: string }
  try {
    body = (await req.json()) as { action?: string }
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (body.action !== "bootstrap-lead-table") {
    return NextResponse.json({ error: "unknown_action" }, { status: 400 })
  }

  try {
    // Idempotent — CREATE TABLE IF NOT EXISTS, plus the indexes.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Lead" (
        "id"         TEXT        NOT NULL,
        "name"       TEXT,
        "email"      TEXT        NOT NULL,
        "phone"      TEXT,
        "company"    TEXT,
        "industry"   TEXT,
        "message"    TEXT,
        "source"     TEXT        NOT NULL DEFAULT 'website',
        "utm"        JSONB,
        "referrer"   TEXT,
        "pagePath"   TEXT,
        "status"     TEXT        NOT NULL DEFAULT 'new',
        "assignedTo" TEXT,
        "notes"      TEXT,
        "ip"         TEXT,
        "userAgent"  TEXT,
        "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"  TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Lead_email_idx"     ON "Lead"("email")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Lead_status_idx"    ON "Lead"("status")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Lead_source_idx"    ON "Lead"("source")`)

    // Verify.
    const rows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='Lead') AS exists`
    )
    return NextResponse.json({ ok: true, leadTableExists: rows[0]?.exists ?? false })
  } catch (e) {
    console.error("[debug bootstrap]", e)
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}
