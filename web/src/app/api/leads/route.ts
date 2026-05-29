/**
 * /api/leads — public lead-capture endpoint on the website.
 *
 * The browser POSTs to this endpoint (same-origin, no CORS). We then forward
 * the lead to the admin dashboard's /api/leads endpoint with a server-side
 * shared API key. The key NEVER touches the browser.
 *
 *   browser  →  web /api/leads  →  admin /api/leads  →  Postgres
 *                (no key)         (LEADS_API_KEY in header)
 *
 * Required env vars on this project:
 *   - ADMIN_LEADS_URL    (e.g. https://afterhours-admin.vercel.app/api/leads)
 *   - LEADS_API_KEY      shared secret matching the admin's LEADS_API_KEY
 */

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const ADMIN_LEADS_URL = process.env.ADMIN_LEADS_URL
  ?? "https://afterhours-admin.vercel.app/api/leads"
const LEADS_API_KEY = process.env.LEADS_API_KEY ?? ""

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!LEADS_API_KEY) {
    // Endpoint is half-installed — log the lead so it isn't lost, but be
    // honest about the failure.
    console.error("[web/leads] LEADS_API_KEY not set — submission cannot be persisted")
    console.error("[web/leads] lost lead:", JSON.stringify(body))
    return NextResponse.json({ error: "endpoint_not_configured" }, { status: 503 })
  }

  // Enrich the payload with referer + page path. (The browser also sends
  // these, but we trust the server-derived ones more.)
  const enriched = {
    ...body,
    referrer: body.referrer ?? req.headers.get("referer") ?? null,
    source: body.source ?? "website",
  }

  try {
    const upstream = await fetch(ADMIN_LEADS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LEADS_API_KEY,
        // Forward the visitor's IP and UA so admin's `ip` / `userAgent`
        // fields reflect the real client, not Vercel's IP.
        "x-forwarded-for": req.headers.get("x-forwarded-for") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
      body: JSON.stringify(enriched),
      // Don't make the user wait if the admin is slow.
      signal: AbortSignal.timeout(8000),
    })
    const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>
    if (!upstream.ok) {
      console.error("[web/leads] admin returned non-OK:", upstream.status, data)
      return NextResponse.json(
        { error: "upstream_failed", upstreamStatus: upstream.status },
        { status: 502 }
      )
    }
    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    console.error("[web/leads] forward failed:", err)
    return NextResponse.json({ error: "forward_failed" }, { status: 502 })
  }
}
