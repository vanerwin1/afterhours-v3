"use client"

import React, { useEffect, useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { getInitials } from "@/lib/utils"
import {
  Save, Check, Loader2, ShieldCheck, ShieldOff,
  Eye, EyeOff, Copy, KeyRound, User,
} from "lucide-react"

interface TwoFASetup {
  enabled: boolean
  secret?: string
  otpauthUrl?: string
  qrDataUrl?: string
}

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession()
  const user = session?.user

  // ── Profile ──────────────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? "")
  const [isSavingProfile, startSavingProfile] = useTransition()
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  const saveProfile = () => {
    setProfileError(null)
    startSavingProfile(async () => {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setProfileSaved(true)
        await updateSession()
        setTimeout(() => setProfileSaved(false), 2500)
      } else {
        const d = (await res.json()) as { error?: string }
        setProfileError(d.error ?? "Update failed")
      }
    })
  }

  // ── Password ─────────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [isSavingPw, startSavingPw] = useTransition()
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const changePassword = () => {
    setPwError(null)
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match")
      return
    }
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters")
      return
    }
    startSavingPw(async () => {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      if (res.ok) {
        setCurrentPw("")
        setNewPw("")
        setConfirmPw("")
        setPwSaved(true)
        setTimeout(() => setPwSaved(false), 2500)
      } else {
        const d = (await res.json()) as { error?: string }
        setPwError(d.error ?? "Password change failed")
      }
    })
  }

  // ── 2FA ──────────────────────────────────────────────────────────────────
  const [twoFA, setTwoFA] = useState<TwoFASetup | null>(null)
  const [loadingTwoFA, setLoadingTwoFA] = useState(true)

  // Setup flow state
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [setupCode, setSetupCode] = useState("")
  const [isEnabling, startEnabling] = useTransition()
  const [enableError, setEnableError] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [secretCopied, setSecretCopied] = useState(false)

  // Disable flow state
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [disableCode, setDisableCode] = useState("")
  const [isDisabling, startDisabling] = useTransition()
  const [disableError, setDisableError] = useState<string | null>(null)

  const fetchTwoFA = async () => {
    setLoadingTwoFA(true)
    try {
      const res = await fetch("/api/account/2fa")
      if (res.ok) {
        const d = (await res.json()) as TwoFASetup
        setTwoFA(d)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingTwoFA(false)
    }
  }

  useEffect(() => {
    fetchTwoFA()
  }, [])

  const openSetupDialog = async () => {
    // Fetch a fresh setup (regenerates secret each time)
    const res = await fetch("/api/account/2fa")
    if (res.ok) {
      const d = (await res.json()) as TwoFASetup
      setTwoFA(d)
    }
    setSetupCode("")
    setEnableError(null)
    setShowSetupDialog(true)
  }

  const confirmEnable = () => {
    setEnableError(null)
    if (!twoFA?.secret) return
    startEnabling(async () => {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: twoFA.secret, code: setupCode }),
      })
      if (res.ok) {
        setShowSetupDialog(false)
        setSetupCode("")
        setTwoFA({ enabled: true })
      } else {
        const d = (await res.json()) as { error?: string }
        setEnableError(d.error ?? "Verification failed")
      }
    })
  }

  const confirmDisable = () => {
    setDisableError(null)
    startDisabling(async () => {
      const res = await fetch("/api/account/2fa", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode }),
      })
      if (res.ok) {
        setShowDisableDialog(false)
        setDisableCode("")
        fetchTwoFA()
      } else {
        const d = (await res.json()) as { error?: string }
        setDisableError(d.error ?? "Verification failed")
      }
    })
  }

  const copySecret = () => {
    if (twoFA?.secret) {
      navigator.clipboard.writeText(twoFA.secret)
      setSecretCopied(true)
      setTimeout(() => setSecretCopied(false), 2000)
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    viewer: "Viewer",
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Account</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your profile, password, and two-factor authentication
        </p>
      </div>

      {/* ── Profile Card ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Update your display name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar + role */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.name ?? user?.email ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
              <Badge
                variant={
                  user?.role === "super_admin"
                    ? "default"
                    : user?.role === "admin"
                    ? "secondary"
                    : "outline"
                }
                className="mt-1 text-xs"
              >
                {ROLE_LABELS[user?.role ?? "viewer"] ?? user?.role}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="max-w-sm"
            />
          </div>

          {profileError && (
            <p className="text-sm text-destructive">{profileError}</p>
          )}

          <Button
            onClick={saveProfile}
            disabled={isSavingProfile || !name.trim() || name === user?.name}
            size="sm"
          >
            {isSavingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : profileSaved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {profileSaved ? "Saved!" : "Save Name"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Password Card ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Password
          </CardTitle>
          <CardDescription>Change your login password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Current Password
            </label>
            <div className="relative max-w-sm">
              <Input
                type={showCurrentPw ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              New Password
            </label>
            <div className="relative max-w-sm">
              <Input
                type={showNewPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
              className="max-w-sm"
            />
          </div>

          {pwError && <p className="text-sm text-destructive">{pwError}</p>}

          <Button
            onClick={changePassword}
            disabled={isSavingPw || !currentPw || !newPw || !confirmPw}
            size="sm"
          >
            {isSavingPw ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : pwSaved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <KeyRound className="h-4 w-4 mr-2" />
            )}
            {pwSaved ? "Password Updated!" : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* ── 2FA Card ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security with a TOTP authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingTwoFA ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
                <div className="h-3 w-48 bg-secondary rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
                    twoFA?.enabled
                      ? "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20"
                      : "bg-secondary border-border"
                  }`}
                >
                  {twoFA?.enabled ? (
                    <ShieldCheck className="h-5 w-5 text-[hsl(var(--success))]" />
                  ) : (
                    <ShieldOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {twoFA?.enabled ? "2FA is enabled" : "2FA is disabled"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {twoFA?.enabled
                      ? "Your account is protected with a TOTP authenticator"
                      : "Enable to require a code from your authenticator app at login"}
                  </p>
                </div>
              </div>
              {twoFA?.enabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                  onClick={() => {
                    setDisableCode("")
                    setDisableError(null)
                    setShowDisableDialog(true)
                  }}
                >
                  Disable
                </Button>
              ) : (
                <Button size="sm" onClick={openSetupDialog} className="shrink-0">
                  Enable 2FA
                </Button>
              )}
            </div>
          )}

          {twoFA?.enabled && (
            <p className="text-xs text-muted-foreground">
              Use Google Authenticator, Authy, or any TOTP-compatible app. To re-enroll,
              disable 2FA and set it up again.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Setup Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showSetupDialog} onOpenChange={(o) => { if (!o) setSetupCode(""); setShowSetupDialog(o) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Set Up Two-Factor Auth
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the 6-digit code to verify.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {twoFA?.qrDataUrl && (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={twoFA.qrDataUrl}
                  alt="2FA QR Code"
                  className="rounded-lg border border-border"
                  width={180}
                  height={180}
                />
              </div>
            )}

            {/* Manual entry */}
            {twoFA?.secret && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Or enter the key manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-xs font-mono break-all">
                    {showSecret ? twoFA.secret : "••••••••••••••••••••••••••••••••"}
                  </code>
                  <button
                    onClick={() => setShowSecret((v) => !v)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={copySecret}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    {secretCopied ? (
                      <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Verify code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Verification Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                autoComplete="one-time-code"
                className="text-center tracking-[0.4em] text-base font-mono"
              />
            </div>

            {enableError && <p className="text-sm text-destructive">{enableError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEnable}
              disabled={isEnabling || setupCode.length !== 6}
            >
              {isEnabling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Verify &amp; Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Disable Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showDisableDialog} onOpenChange={(o) => { if (!o) setDisableCode(""); setShowDisableDialog(o) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-destructive" />
              Disable Two-Factor Auth
            </DialogTitle>
            <DialogDescription>
              Enter your current authenticator code to confirm. This will remove 2FA from your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Authenticator Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                autoComplete="one-time-code"
                className="text-center tracking-[0.4em] text-base font-mono"
              />
            </div>

            {disableError && <p className="text-sm text-destructive">{disableError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDisable}
              disabled={isDisabling || disableCode.length !== 6}
            >
              {isDisabling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
