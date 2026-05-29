"use client"

import { useEffect, useState, useTransition } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, formatRelativeTime } from "@/lib/utils"
import { RefreshCw, Loader2, Mail, Phone, MessageSquare, Filter } from "lucide-react"

interface Lead {
  id: string
  name: string | null
  email: string
  phone: string | null
  company: string | null
  industry: string | null
  message: string | null
  source: string
  referrer: string | null
  pagePath: string | null
  utm: Record<string, string> | null
  status: string
  assignedTo: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_COLORS: Record<string, string> = {
  new:        "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted:  "bg-amber-500/15 text-amber-300 border-amber-500/30",
  qualified:  "bg-purple-500/15 text-purple-300 border-purple-500/30",
  won:        "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost:       "bg-rose-500/15 text-rose-300 border-rose-500/30",
}

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Lead | null>(null)
  const [pendingUpdate, startTransition] = useTransition()

  async function load() {
    setLoading(true)
    try {
      const url = filter === "all" ? "/api/leads" : `/api/leads?status=${filter}`
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { leads: Lead[] }
      setLeads(data.leads)
    } catch (err) {
      console.error("[leads page] load failed:", err)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const filtered = leads.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return [l.email, l.name, l.company, l.phone, l.message]
      .filter(Boolean)
      .some((v) => v?.toLowerCase().includes(q))
  })

  async function updateLead(id: string, patch: Partial<Lead>) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/leads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...patch }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await load()
        if (selected?.id === id) {
          const updated = leads.find((l) => l.id === id)
          if (updated) setSelected({ ...updated, ...patch })
        }
      } catch (err) {
        console.error("[leads page] update failed:", err)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Captured from the public website&apos;s contact form, demo requests, and CTAs.
          </p>
        </div>
        <Button onClick={load} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={loading ? "animate-spin h-4 w-4 mr-2" : "h-4 w-4 mr-2"} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search by email, name, company, message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {STATUSES.map((s) => {
          const count = leads.filter((l) => l.status === s).length
          return (
            <Card key={s} className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setFilter(s)}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loading ? "Loading…" : `${filtered.length} lead${filtered.length === 1 ? "" : "s"}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No leads yet. They&apos;ll appear here as visitors fill in the website&apos;s contact form.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company / Industry</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setSelected(lead)}
                  >
                    <TableCell>
                      <div className="font-medium">{lead.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{lead.email}</div>
                      {lead.phone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.company || "—"}</div>
                      {lead.industry && (
                        <div className="text-xs text-muted-foreground">{lead.industry}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>
                      </div>
                      {lead.pagePath && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{lead.pagePath}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[lead.status] || ""}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs" title={formatDateTime(new Date(lead.createdAt).getTime())}>
                        {formatRelativeTime(new Date(lead.createdAt).getTime())}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
             onClick={() => setSelected(null)}>
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border
                          shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selected.name || selected.email}</h2>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Company</p>
                  <p>{selected.company || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Industry</p>
                  <p>{selected.industry || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Phone</p>
                  <p>{selected.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Source</p>
                  <p>{selected.source}</p>
                </div>
              </div>

              {selected.message && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Message</p>
                  <div className="rounded-lg bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              )}

              {(selected.referrer || selected.pagePath || selected.utm) && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase">Attribution</p>
                  {selected.pagePath && <p className="text-xs"><span className="text-muted-foreground">Page:</span> {selected.pagePath}</p>}
                  {selected.referrer && <p className="text-xs"><span className="text-muted-foreground">Referrer:</span> {selected.referrer}</p>}
                  {selected.utm && Object.entries(selected.utm).map(([k, v]) => (
                    <p key={k} className="text-xs"><span className="text-muted-foreground">{k}:</span> {v}</p>
                  ))}
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground uppercase mb-2">Status</p>
                <Select
                  value={selected.status}
                  onValueChange={(v) => updateLead(selected.id, { status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <a
                  href={`mailto:${selected.email}`}
                  className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg
                             bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg
                               bg-muted hover:bg-muted/70 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
              </div>

              {pendingUpdate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </div>
              )}

              <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                Captured {formatDateTime(new Date(selected.createdAt).getTime())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
