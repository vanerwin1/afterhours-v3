"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils"
import { RefreshCw, DollarSign, Loader2 } from "lucide-react"

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  created: number
  description?: string
  customer?: string
  receipt_email?: string
}

interface Subscription {
  id: string
  status: string
  current_period_end: number
  customer: { email?: string; name?: string } | string
  items: { data: Array<{ price: { nickname?: string; unit_amount: number; currency: string } }> }
  pause_collection?: { behavior: string } | null
}

interface WebhookEvent {
  id: string
  eventType: string
  processed: boolean
  error?: string
  createdAt: string
}

interface RevenuePoint {
  date: string
  amount: number
}

function getStatusVariant(
  status: string
): "default" | "destructive" | "success" | "warning" | "secondary" | "outline" {
  switch (status) {
    case "succeeded":
    case "active":
    case "trialing":
      return "success"
    case "canceled":
    case "requires_payment_method":
      return "destructive"
    case "past_due":
    case "unpaid":
      return "warning"
    case "paused":
    case "incomplete":
      return "secondary"
    default:
      return "outline"
  }
}

export default function StripePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([])
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [loadingSubs, setLoadingSubs] = useState(true)
  const [loadingWebhooks, setLoadingWebhooks] = useState(true)
  const [loadingRevenue, setLoadingRevenue] = useState(true)

  const [refundDialog, setRefundDialog] = useState<{ open: boolean; payment?: Payment }>({ open: false })
  const [refundAmount, setRefundAmount] = useState("")
  const [isRefunding, startRefunding] = useTransition()

  const [actionLoading, startAction] = useTransition()

  useEffect(() => {
    fetch("/api/stripe/payments")
      .then((r) => r.json())
      .then((d: { payments?: Payment[] }) => setPayments(d.payments ?? []))
      .catch(() => {})
      .finally(() => setLoadingPayments(false))

    fetch("/api/stripe/subscriptions")
      .then((r) => r.json())
      .then((d: { subscriptions?: Subscription[] }) => setSubscriptions(d.subscriptions ?? []))
      .catch(() => {})
      .finally(() => setLoadingSubs(false))

    fetch("/api/stripe/webhooks")
      .then((r) => r.json())
      .then((d: { events?: WebhookEvent[] }) => setWebhooks(d.events ?? []))
      .catch(() => {})
      .finally(() => setLoadingWebhooks(false))

    fetch("/api/stripe/payments?revenue=true")
      .then((r) => r.json())
      .then((d: { revenueByDay?: RevenuePoint[] }) => setRevenueData(d.revenueByDay ?? []))
      .catch(() => {})
      .finally(() => setLoadingRevenue(false))
  }, [])

  const submitRefund = () => {
    if (!refundDialog.payment) return
    startRefunding(async () => {
      const amt = refundAmount ? Math.round(parseFloat(refundAmount) * 100) : undefined
      await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: refundDialog.payment!.id, amount: amt }),
      })
      setRefundDialog({ open: false })
      setRefundAmount("")
    })
  }

  const handleSubAction = (id: string, action: "cancel" | "pause" | "resume") => {
    startAction(async () => {
      await fetch("/api/stripe/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      const r = await fetch("/api/stripe/subscriptions")
      const d = (await r.json()) as { subscriptions?: Subscription[] }
      setSubscriptions(d.subscriptions ?? [])
    })
  }

  const totalMRR = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const price = s.items?.data?.[0]?.price
      return sum + (price?.unit_amount ?? 0)
    }, 0)

  const getCustomerEmail = (sub: Subscription) => {
    if (typeof sub.customer === "string") return sub.customer
    return sub.customer?.email ?? "—"
  }

  const getPlanName = (sub: Subscription) => {
    const price = sub.items?.data?.[0]?.price
    return price?.nickname ?? formatCurrency(price?.unit_amount ?? 0, price?.currency ?? "usd")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Stripe</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage payments, subscriptions, and webhooks</p>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Payments */}
        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPayments ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {p.id.slice(0, 16)}…
                          </TableCell>
                          <TableCell className="text-sm">{p.receipt_email ?? p.customer ?? "—"}</TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatCurrency(p.amount, p.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(p.status)} className="text-xs">
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(new Date(p.created * 1000))}
                          </TableCell>
                          <TableCell>
                            {p.status === "succeeded" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setRefundDialog({ open: true, payment: p })
                                  setRefundAmount("")
                                }}
                              >
                                Refund
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions */}
        <TabsContent value="subscriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingSubs ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-sm">{getCustomerEmail(s)}</TableCell>
                          <TableCell className="text-sm">{getPlanName(s)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(s.status)} className="text-xs">
                              {s.pause_collection ? "paused" : s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(new Date(s.current_period_end * 1000))}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {s.status === "active" && !s.pause_collection && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleSubAction(s.id, "pause")}
                                >
                                  Pause
                                </Button>
                              )}
                              {s.pause_collection && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleSubAction(s.id, "resume")}
                                >
                                  Resume
                                </Button>
                              )}
                              {s.status !== "canceled" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  disabled={actionLoading}
                                  onClick={() => handleSubAction(s.id, "cancel")}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook Events</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingWebhooks ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhooks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No webhook events
                        </TableCell>
                      </TableRow>
                    ) : (
                      webhooks.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-mono text-xs">{w.eventType}</TableCell>
                          <TableCell>
                            <Badge variant={w.processed ? "success" : w.error ? "destructive" : "warning"} className="text-xs">
                              {w.processed ? "processed" : w.error ? "error" : "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {w.error ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatRelativeTime(w.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue */}
        <TabsContent value="revenue" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Revenue — Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRevenue ? (
                  <Skeleton className="h-[220px] w-full" />
                ) : (
                  <RevenueChart data={revenueData} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  MRR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {loadingSubs ? (
                    <Skeleton className="h-9 w-32" />
                  ) : (
                    formatCurrency(totalMRR, "usd")
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  From {subscriptions.filter((s) => s.status === "active").length} active subscriptions
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Refund Dialog */}
      <Dialog open={refundDialog.open} onOpenChange={(o) => setRefundDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Refund</DialogTitle>
            <DialogDescription>
              Refund for payment{" "}
              <code className="text-xs bg-muted px-1 rounded">{refundDialog.payment?.id}</code>{" "}
              ({refundDialog.payment && formatCurrency(refundDialog.payment.amount, refundDialog.payment.currency)})
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Refund Amount (leave blank for full refund)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder={`Max: ${refundDialog.payment ? (refundDialog.payment.amount / 100).toFixed(2) : ""}`}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={submitRefund} disabled={isRefunding}>
              {isRefunding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Issue Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
