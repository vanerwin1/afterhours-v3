import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isIpAllowed } from "./lib/utils"

// Use edge-safe config (no Prisma) for middleware
const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    (req as NextRequest & { ip?: string }).ip ??
    "unknown"

  // 1. IP allowlist
  if (!isIpAllowed(ip)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // 2. Public paths
  const { pathname } = req.nextUrl
  const PUBLIC = ["/login", "/api/auth", "/api/webhooks", "/api/debug"]
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next()

  // 3. Auth check
  const session = (req as typeof req & { auth?: { user?: { role?: string } } }).auth
  if (!session?.user) {
    // API routes get JSON 401 — never redirect them to HTML
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 4. Admin-only paths
  const ADMIN_ONLY = ["/dashboard/settings", "/dashboard/security"]
  if (ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    if (!["admin", "super_admin"].includes(session.user.role ?? "")) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
