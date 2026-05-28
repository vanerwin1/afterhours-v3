"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, formatRelativeTime } from "@/lib/utils"
import { Plus, Copy, Eye, EyeOff, Loader2, Trash2, X } from "lucide-react"
import { useSession } from "next-auth/react"

interface LoginAttempt {
  id: string
  email: string
  ip: string
  success: boolean
  failReason?: string
  createdAt: string
}

interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: string
  ip?: string
  userAgent?: string
  createdAt: string
  user?: { email: string; name?: string }
}

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  role: string
  scopes: string[]
  lastUsedAt?: string
  revokedAt?: string
  createdAt: string
}

interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  enabled: boolean
}

export default function SecurityPage() {
  const { data: session } = useSession()
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([])
  const [loadingAttempts, setLoadingAttempts] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [loadingFlags, setLoadingFlags] = useState(true)

  const [newKeyDialog, setNewKeyDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyRole, setNewKeyRole] = useState("viewer")
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showCreatedKey, setShowCreatedKey] = useState(false)
  const [isCreatingKey, startCreatingKey] = useTransition()
  const [actionLoading, startAction] = useTransition()

  const isSuperAdmin = session?.user?.role === "super_admin"

  const fetchAll = async () => {
    fetch("/api/security/sessions")
      .then((r) => r.json())
      .then((d: { sessions?: Session[] }) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoadingSessions(false))

    fetch("/api/security/api-keys")
      .then((r) => r.json())
      .then((d: { keys?: ApiKey[] }) => setApiKeys(d.keys ?? []))
      .catch(() => {})
      .finally(() => setLoadingKeys(false))

    fetch("/api/settings/feature-flags")
      .then((r) => r.json())
      .then((d: { flags?: FeatureFlag[] }) => setFeatureFlags(d.flags ?? []))
      .catch(() => {})
      .finally(() => setLoadingFlags(false))

    // login attempts from audit logs / separate endpoint
    fetch("/api/security/sessions?attempts=true")
      .then((r) => r.json())
      .then((d: { attempts?: LoginAttempt[] }) => setLoginAttempts(d.attempts ?? []))
      .catch(() => {})
      .finally(() => setLoadingAttempts(false))
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const killSession = (id: string) => {
    startAction(async () => {
      await fetch("/api/security/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      })
      setSessions((prev) => prev.filter((s) => s.id !== id))
    })
  }

  const createApiKey = () => {
    if (!newKeyName.trim()) return
    startCreatingKey(async () => {
      const res = await fetch("/api/security/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, role: newKeyRole }),
      })
      const data = (await res.json()) as { key?: string; apiKey?: ApiKey }
      if (data.key) {
        setCreatedKey(data.key)
        if (data.apiKey) setApiKeys((prev) => [data.apiKey!, ...prev])
      }
      setNewKeyName("")
      setNewKeyRole("viewer")
    })
  }

  const revokeKey = (id: string) => {
    startAction(async () => {
      await fetch("/api/security/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: id }),
      })
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k))
      )
    })
  }

  const toggleFlag = (id: string, enabled: boolean) => {
    startAction(async () => {
      await fetch("/api/settings/feature-flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      })
      setFeatureFlags((prev) =>
        prev.map((f) => (f.id === id ? { ...f, enabled } : f))
      )
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Security Center</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor access, sessions, API keys, and feature flags</p>
      </div>

      <Tabs defaultValue="attempts">
        <TabsList>
          <TabsTrigger value="attempts">Login Attempts</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
        </TabsList>

        {/* Login Attempts */}
        <TabsContent value="attempts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Login Attempts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingAttempts ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginAttempts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No login attempts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginAttempts.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-sm">{a.email}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{a.ip}</TableCell>
                          <TableCell>
                            <Badge variant={a.success ? "success" : "destructive"} className="text-xs">
                              {a.success ? "Success" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {a.failReason?.replace(/_/g, " ") ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatRelativeTime(a.createdAt)}
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

        {/* Active Sessions */}
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingSessions ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No active sessions
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-sm">{s.user?.email ?? s.userId}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{s.ip ?? "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                            {s.userAgent ? s.userAgent.split(" ")[0] : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatRelativeTime(s.createdAt)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(s.expires)}
                          </TableCell>
                          <TableCell>
                            {s.userId !== session?.user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                title="Kill session"
                                onClick={() => killSession(s.id)}
                                disabled={actionLoading}
                              >
                                <X className="h-4 w-4" />
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

        {/* API Keys */}
        <TabsContent value="api-keys" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">API Keys</CardTitle>
              <Button size="sm" onClick={() => setNewKeyDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Key
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingKeys ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Prefix</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No API keys
                        </TableCell>
                      </TableRow>
                    ) : (
                      apiKeys.map((k) => (
                        <TableRow key={k.id}>
                          <TableCell className="text-sm font-medium">{k.name}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{k.keyPrefix}...</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{k.role}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {k.lastUsedAt ? formatRelativeTime(k.lastUsedAt) : "Never"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={k.revokedAt ? "destructive" : "success"} className="text-xs">
                              {k.revokedAt ? "Revoked" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!k.revokedAt && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => revokeKey(k.id)}
                                disabled={actionLoading}
                              >
                                <Trash2 className="h-4 w-4" />
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

        {/* Feature Flags */}
        <TabsContent value="flags" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Flags</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFlags ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : featureFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No feature flags configured</p>
              ) : (
                <div className="space-y-3">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{flag.name}</p>
                          <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {flag.key}
                          </code>
                        </div>
                        {flag.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                        )}
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={(enabled) => toggleFlag(flag.id, enabled)}
                        disabled={actionLoading || !isSuperAdmin}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New API Key Dialog */}
      <Dialog open={newKeyDialog} onOpenChange={(o) => { if (!o) { setCreatedKey(null); setShowCreatedKey(false) } setNewKeyDialog(o) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createdKey ? "Key Created" : "Create API Key"}</DialogTitle>
            <DialogDescription>
              {createdKey
                ? "Copy this key now — it will never be shown again."
                : "Give your key a name and assign a role."}
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showCreatedKey ? "text" : "password"}
                  value={createdKey}
                  readOnly
                  className="pr-20 font-mono text-xs"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setShowCreatedKey((v) => !v)} className="p-1 text-muted-foreground hover:text-foreground">
                    {showCreatedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(createdKey)} className="p-1 text-muted-foreground hover:text-foreground">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-[hsl(var(--warning))]">
                Store this key securely. You cannot retrieve it later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Key Name</label>
                <Input
                  placeholder="e.g. Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Role</label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            {createdKey ? (
              <Button onClick={() => { setNewKeyDialog(false); setCreatedKey(null); setShowCreatedKey(false) }}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setNewKeyDialog(false)}>Cancel</Button>
                <Button onClick={createApiKey} disabled={isCreatingKey || !newKeyName.trim()}>
                  {isCreatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
