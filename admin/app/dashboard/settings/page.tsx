"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, formatRelativeTime } from "@/lib/utils"
import { Save, Plus, TestTube, Loader2, Check } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  userEmail: string
  resource?: string
  ip?: string
  createdAt: string
}

interface Announcement {
  id: string
  content: string
  type: string
  active: boolean
  scheduledAt?: string
  expiresAt?: string
  createdAt: string
}

export default function SettingsPage() {
  const [maintenance, setMaintenance] = useState(false)
  const [siteUrl, setSiteUrl] = useState("")
  const [loadingWebsite, setLoadingWebsite] = useState(true)
  const [savingWebsite, startSavingWebsite] = useTransition()
  const [websiteSaved, setWebsiteSaved] = useState(false)

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingAnn, setLoadingAnn] = useState(true)
  const [newAnn, setNewAnn] = useState({ content: "", type: "info", scheduledAt: "", expiresAt: "" })
  const [savingAnn, startSavingAnn] = useTransition()

  const [slackUrl, setSlackUrl] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [testingSlack, startTestingSlack] = useTransition()
  const [slackTested, setSlackTested] = useState(false)
  const [savingNotif, startSavingNotif] = useTransition()
  const [notifSaved, setNotifSaved] = useState(false)

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loadingAudit, setLoadingAudit] = useState(true)
  const [auditPage, setAuditPage] = useState(1)
  const PAGE_SIZE = 20

  useEffect(() => {
    // Load website settings
    fetch("/api/settings/maintenance")
      .then((r) => r.json())
      .then((d: { enabled: boolean }) => {
        setMaintenance(d.enabled)
        setSiteUrl(process.env.NEXT_PUBLIC_APP_URL ?? "")
      })
      .catch(() => {})
      .finally(() => setLoadingWebsite(false))

    // Load announcements
    fetch("/api/settings/feature-flags?announcements=true")
      .then((r) => r.json())
      .then((d: { announcements?: Announcement[] }) => setAnnouncements(d.announcements ?? []))
      .catch(() => {})
      .finally(() => setLoadingAnn(false))

    // Load audit logs
    fetch("/api/settings/cache?audit=true")
      .then((r) => r.json())
      .then((d: { logs?: AuditLog[] }) => setAuditLogs(d.logs ?? []))
      .catch(() => {})
      .finally(() => setLoadingAudit(false))
  }, [])

  const saveWebsite = () => {
    startSavingWebsite(async () => {
      await fetch("/api/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: maintenance }),
      })
      setWebsiteSaved(true)
      setTimeout(() => setWebsiteSaved(false), 2000)
    })
  }

  const createAnnouncement = () => {
    if (!newAnn.content.trim()) return
    startSavingAnn(async () => {
      const res = await fetch("/api/settings/feature-flags?announcements=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnn),
      })
      const d = (await res.json()) as { announcement?: Announcement }
      if (d.announcement) {
        setAnnouncements((prev) => [d.announcement!, ...prev])
        setNewAnn({ content: "", type: "info", scheduledAt: "", expiresAt: "" })
      }
    })
  }

  const testSlack = () => {
    startTestingSlack(async () => {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      })
      setSlackTested(true)
      setTimeout(() => setSlackTested(false), 3000)
    })
  }

  const saveNotifications = () => {
    startSavingNotif(async () => {
      await fetch("/api/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slackUrl, adminEmail }),
      })
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 2000)
    })
  }

  const paginatedLogs = auditLogs.slice((auditPage - 1) * PAGE_SIZE, auditPage * PAGE_SIZE)
  const totalPages = Math.ceil(auditLogs.length / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Configure site behavior, announcements, and notifications</p>
      </div>

      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Website */}
        <TabsContent value="website" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Website Settings</CardTitle>
              <CardDescription>Control site availability and base configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingWebsite ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Temporarily take the site offline for maintenance
                      </p>
                    </div>
                    <Switch checked={maintenance} onCheckedChange={setMaintenance} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Site Base URL
                    </label>
                    <Input
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://afterhours.ai"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for OAuth callbacks and email links
                    </p>
                  </div>
                  <Button onClick={saveWebsite} disabled={savingWebsite}>
                    {savingWebsite ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : websiteSaved ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {websiteSaved ? "Saved!" : "Save Changes"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create Announcement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Content</label>
                  <Textarea
                    placeholder="Announcement message..."
                    value={newAnn.content}
                    onChange={(e) => setNewAnn((p) => ({ ...p, content: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Type</label>
                    <Select
                      value={newAnn.type}
                      onValueChange={(v) => setNewAnn((p) => ({ ...p, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Scheduled At</label>
                    <Input
                      type="datetime-local"
                      value={newAnn.scheduledAt}
                      onChange={(e) => setNewAnn((p) => ({ ...p, scheduledAt: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Expires At</label>
                    <Input
                      type="datetime-local"
                      value={newAnn.expiresAt}
                      onChange={(e) => setNewAnn((p) => ({ ...p, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={createAnnouncement} disabled={savingAnn || !newAnn.content.trim()}>
                  {savingAnn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Announcements</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingAnn ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No announcements</p>
                ) : (
                  <div className="divide-y divide-border">
                    {announcements.map((a) => (
                      <div key={a.id} className="flex items-start justify-between px-6 py-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{a.content}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant={
                              a.type === "warning" ? "warning" :
                              a.type === "error" ? "destructive" :
                              a.type === "success" ? "success" : "secondary"
                            } className="text-[10px]">
                              {a.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(a.createdAt)}
                            </span>
                            {a.expiresAt && (
                              <span className="text-xs text-muted-foreground">
                                expires {formatDateTime(a.expiresAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant={a.active ? "success" : "secondary"} className="text-xs shrink-0">
                          {a.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
              <CardDescription>Configure Slack and email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Slack Webhook URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackUrl}
                    onChange={(e) => setSlackUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={testSlack} disabled={testingSlack || !slackUrl}>
                    {testingSlack ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : slackTested ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    {slackTested ? "Sent!" : "Test"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Alerts for failed payments, downtime, and security events
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Admin Alert Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@afterhours.ai"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Receives critical alerts via email (failed payments, etc.)
                </p>
              </div>
              <Button onClick={saveNotifications} disabled={savingNotif}>
                {savingNotif ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : notifSaved ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {notifSaved ? "Saved!" : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingAudit ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No audit events
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs text-primary">
                              {log.action}
                            </TableCell>
                            <TableCell className="text-sm">{log.userEmail}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                              {log.resource ?? "—"}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {log.ip ?? "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatRelativeTime(log.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Page {auditPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={auditPage <= 1}
                          onClick={() => setAuditPage((p) => p - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={auditPage >= totalPages}
                          onClick={() => setAuditPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
