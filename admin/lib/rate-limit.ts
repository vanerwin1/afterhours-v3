import { NextRequest, NextResponse } from "next/server"
import { apiRateLimit, loginRateLimit } from "./redis"
import { getClientIp } from "./utils"

type LimitType = "api" | "login"

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  type: LimitType = "api"
): Promise<NextResponse> {
  const limiter = type === "login" ? loginRateLimit : apiRateLimit

  // If Redis isn't configured (local dev), skip rate limiting entirely
  if (!limiter) return handler()

  const ip = getClientIp(req)
  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  const response = await handler()
  response.headers.set("X-RateLimit-Limit", String(limit))
  response.headers.set("X-RateLimit-Remaining", String(remaining))
  return response
}
