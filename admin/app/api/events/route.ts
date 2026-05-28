import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // stream closed
        }
      }

      // Send initial data
      try {
        const logs = await prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            action: true,
            userEmail: true,
            resource: true,
            ip: true,
            createdAt: true,
          },
        })
        send(logs)
      } catch {
        // silently fail
      }

      // Poll every 5 seconds
      let lastSeenAt = new Date()

      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval)
          return
        }
        try {
          const newLogs = await prisma.auditLog.findMany({
            where: { createdAt: { gt: lastSeenAt } },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              action: true,
              userEmail: true,
              resource: true,
              ip: true,
              createdAt: true,
            },
          })
          if (newLogs.length > 0) {
            lastSeenAt = newLogs[0].createdAt
            for (const log of newLogs) {
              send(log)
            }
          }
        } catch {
          // silently fail
        }
      }, 5000)

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        closed = true
        clearInterval(interval)
        try {
          controller.close()
        } catch {
          // already closed
        }
      })
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
