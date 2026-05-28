import { prisma } from "./prisma"

export interface AuditParams {
  userId: string
  userEmail: string
  action: string
  resource?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

export async function audit(params: AuditParams) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.auditLog.create({ data: params as any })
  } catch (e) {
    // Never let audit logging crash a request
    console.error("[audit] Failed to write audit log:", e)
  }
}

export async function getRecentAuditLogs(limit = 50, userId?: string) {
  return prisma.auditLog.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  })
}
