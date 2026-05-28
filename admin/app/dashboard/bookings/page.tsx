"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { formatRelativeTime } from "@/lib/utils"
import { RefreshCw, Calendar, UserCheck, Download } from "lucide-react"

interface BookingRecord {
  type: "booking" | "lead"
  raw: string
  name: string
  service?: string
  time?: string
  phone?: string
  reason?: string
  session_id: string
  captured_at: string
}

interface AgentResponse {
  records: BookingRecord[]
  count: number
  error?: string
  hint?: string
}

function exportCsv(records: BookingRecord[], filename: string) {
  const header =
    records[0]?.type === "booking"
      ? "Name,Service,Time,Phone,Session,Captured At\n"
      : "Name,Phone,Reason,Session,Captured At\n"

  const rows = records
    .map((r) => {
      const cols =
        r.type === "booking"
          ? [r.name, r.service ?? "", r.time ?? "", r.phone ?? "", r.session_id, r.captured_at]
          : [r.name, r.phone ?? "", r.reason ?? "", r.session_id, r.captured_at]
      return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    })
    .join("\n")

  const blob = new Blob([header + rows], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [leads, setLeads] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [agentError, setAgentError] = useState<string | null>(null)
  const [agentHint, setAgentHint] = useState<string | null>(null)
  const [isRefreshing, startRefreshing] = useTransition()

  const fetchAll = async () => {
    setAgentError(null)
    try {
      const [bookRes, leadRes] = await Promise.all([
        fetch("/api/bookings?type=booking&limit=200"),
        fetch("/api/bookings?type=lead&limit=200"),
      ])

      if (bookRes.ok) {
        const d = (await bookRes.json()) as AgentResponse
        if (d.error) {
          setAgentError(d.error)
          if (d.hint) setAgentHint(d.hint)
        } else {
          setBookings(d.records ?? [])
        }
      }
      if (leadRes.ok) {
        const d = (await leadRes.json()) as AgentResponse
        if (!d.error) setLeads(d.records ?? [])
      }
    } catch {
      setAgentError("Network error — could not reach the admin API")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = () => {
    setLoading(true)
    startRefreshing(async () => {
      await fetchAll()
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Bookings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Appointments and leads captured by the AI receptionist
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing || loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Agent error banner */}
      {agentError && (
        <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive space-y-0.5">
          <p className="font-medium">{agentError}</p>
          {agentHint && <p className="text-xs opacity-80">{agentHint}</p>}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? <span className="animate-pulse text-muted-foreground">—</span> : bookings.length}
              </p>
              <p className="text-xs text-muted-foreground">Confirmed Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/20">
              <UserCheck className="h-5 w-5 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? <span className="animate-pulse text-muted-foreground">—</span> : leads.length}
              </p>
              <p className="text-xs text-muted-foreground">Lead Captures</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings" className="flex items-center gap-1.5">
            Bookings
            {!loading && bookings.length > 0 && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                {bookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-1.5">
            Leads
            {!loading && leads.length > 0 && (
              <Badge variant="warning" className="text-[10px] py-0 px-1.5 h-4">
                {leads.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Bookings ─────────────────────────────── */}
        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Confirmed Appointments</CardTitle>
              {bookings.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCsv(bookings, "bookings.csv")}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export CSV
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Time / Date</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Captured</TableHead>
                      <TableHead>Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-12"
                        >
                          No bookings yet — they will appear here as the AI captures them
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((b, i) => (
                        <TableRow key={`${b.session_id}-${i}`}>
                          <TableCell className="font-medium text-sm">
                            {b.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {b.service || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {b.time || "—"}
                          </TableCell>
                          <TableCell className="text-sm">{b.phone || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {b.captured_at ? formatRelativeTime(b.captured_at) : "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {b.session_id}
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

        {/* ── Leads ─────────────────────────────────── */}
        <TabsContent value="leads" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Lead Captures</CardTitle>
              {leads.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCsv(leads, "leads.csv")}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export CSV
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Reason / Interest</TableHead>
                      <TableHead>Captured</TableHead>
                      <TableHead>Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-12"
                        >
                          No leads yet — caller info will appear here when the AI collects it
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.map((l, i) => (
                        <TableRow key={`${l.session_id}-${i}`}>
                          <TableCell className="font-medium text-sm">
                            {l.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm">{l.phone || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {l.reason || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {l.captured_at ? formatRelativeTime(l.captured_at) : "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {l.session_id}
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
      </Tabs>
    </div>
  )
}
