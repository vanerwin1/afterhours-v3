"use client"

import React, { useEffect, useState, useTransition } from "react"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime, getInitials } from "@/lib/utils"
import { Search, Download, Shield, Ban, RotateCcw, UserX, Loader2, UserPlus } from "lucide-react"
import { useSession } from "next-auth/react"

interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role: string
  banned: boolean
  lastLoginAt?: string | null
  createdAt: string
}

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  super_admin: "default",
  admin: "secondary",
  viewer: "outline",
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  viewer: "Viewer",
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [bannedFilter, setBannedFilter] = useState("all")

  const [roleDialog, setRoleDialog] = useState<{ open: boolean; user?: User; newRole?: string }>({ open: false })
  const [banDialog, setBanDialog] = useState<{ open: boolean; user?: User }>({ open: false })
  const [actionLoading, startAction] = useTransition()

  // Create User state
  const [createDialog, setCreateDialog] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState<string>("viewer")
  const [isCreating, startCreating] = useTransition()
  const [createError, setCreateError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (roleFilter !== "all") params.set("role", roleFilter)
      if (bannedFilter !== "all") params.set("banned", bannedFilter)
      const res = await fetch(`/api/users?${params}`)
      const data = (await res.json()) as { users?: User[] }
      setUsers(data.users ?? [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, bannedFilter])

  const handleExportCsv = () => {
    window.location.href = "/api/users?format=csv"
  }

  const handleRoleChange = () => {
    if (!roleDialog.user || !roleDialog.newRole) return
    startAction(async () => {
      await fetch(`/api/users/${roleDialog.user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleDialog.newRole }),
      })
      setRoleDialog({ open: false })
      await fetchUsers()
    })
  }

  const handleBanToggle = () => {
    if (!banDialog.user) return
    startAction(async () => {
      await fetch(`/api/users/${banDialog.user!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !banDialog.user!.banned }),
      })
      setBanDialog({ open: false })
      await fetchUsers()
    })
  }

  const handleResetPassword = async (user: User) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetPassword: true }),
    })
  }

  const handleCreate = () => {
    setCreateError(null)
    if (!newEmail.trim()) {
      setCreateError("Email is required")
      return
    }
    startCreating(async () => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          name: newName.trim() || undefined,
          password: newPassword || undefined,
          role: newRole,
        }),
      })
      if (res.ok) {
        setCreateDialog(false)
        setNewEmail("")
        setNewName("")
        setNewPassword("")
        setNewRole("viewer")
        await fetchUsers()
      } else {
        const d = (await res.json()) as { error?: string }
        setCreateError(d.error ?? "Failed to create user")
      }
    })
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user ${user.email}? This is irreversible.`)) return
    await fetch(`/api/users/${user.id}`, { method: "DELETE" })
    await fetchUsers()
  }

  const isSuperAdmin = session?.user?.role === "super_admin"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage admin accounts and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setNewEmail("")
              setNewName("")
              setNewPassword("")
              setNewRole("viewer")
              setCreateError(null)
              setCreateDialog(true)
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New User
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bannedFilter} onValueChange={setBannedFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name ?? user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANTS[user.role] ?? "outline"} className="text-xs">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.banned ? "destructive" : "success"} className="text-xs">
                        {user.banned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Change role"
                          onClick={() =>
                            setRoleDialog({ open: true, user, newRole: user.role })
                          }
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.banned ? "Unban" : "Ban"}
                          onClick={() => setBanDialog({ open: true, user })}
                          className={user.banned ? "text-[hsl(var(--success))]" : "text-destructive"}
                        >
                          {user.banned ? <RotateCcw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reset password"
                          onClick={() => handleResetPassword(user)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        {isSuperAdmin && user.id !== session?.user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete user"
                            className="text-destructive"
                            onClick={() => handleDelete(user)}
                          >
                            <UserX className="h-4 w-4" />
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
      </div>

      {/* Role Change Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(o) => setRoleDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the role for <strong>{roleDialog.user?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <Select
            value={roleDialog.newRole ?? "viewer"}
            onValueChange={(v) => setRoleDialog((prev) => ({ ...prev, newRole: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(o) => setBanDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {banDialog.user?.banned ? "Unban User" : "Ban User"}
            </DialogTitle>
            <DialogDescription>
              {banDialog.user?.banned
                ? `Unban ${banDialog.user?.email}? They will be able to sign in again.`
                : `Ban ${banDialog.user?.email}? They will no longer be able to sign in.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              variant={banDialog.user?.banned ? "default" : "destructive"}
              onClick={handleBanToggle}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {banDialog.user?.banned ? "Unban" : "Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onOpenChange={(o) => { if (!o) setCreateError(null); setCreateDialog(o) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
            <DialogDescription>
              Add a new user to the Command Center. They can sign in with credentials or via Google OAuth.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="user@afterhours.ai"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Display Name
              </label>
              <Input
                placeholder="Full name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <Input
                type="password"
                placeholder="Leave blank to set via password reset"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If left blank, the user must log in via Google OAuth or use the password reset flow.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer — read-only access</SelectItem>
                  <SelectItem value="admin">Admin — full management access</SelectItem>
                  {isSuperAdmin && (
                    <SelectItem value="super_admin">Super Admin — unrestricted</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !newEmail.trim()}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
