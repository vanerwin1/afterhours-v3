"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Wrench, Trash2, Calendar, Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function QuickActions() {
  const [maintenance, setMaintenance] = useState(false)
  const [loadingMaint, setLoadingMaint] = useState(true)
  const [togglingMaint, startTogglingMaint] = useTransition()
  const [cacheDialogOpen, setCacheDialogOpen] = useState(false)
  const [clearingCache, startClearingCache] = useTransition()
  const [cacheCleared, setCacheCleared] = useState(false)

  const agentUrl = process.env.NEXT_PUBLIC_AFTERHOURS_AGENT_URL ?? "http://localhost:3335"

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch("/api/settings/maintenance")
        if (res.ok) {
          const data = (await res.json()) as { enabled: boolean }
          setMaintenance(data.enabled)
        }
      } catch {
        // silently fail
      } finally {
        setLoadingMaint(false)
      }
    }
    fetchMaintenance()
  }, [])

  const toggleMaintenance = () => {
    startTogglingMaint(async () => {
      try {
        const res = await fetch("/api/settings/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled: !maintenance }),
        })
        if (res.ok) {
          setMaintenance((prev) => !prev)
        }
      } catch {
        // silently fail
      }
    })
  }

  const clearCache = () => {
    startClearingCache(async () => {
      try {
        await fetch("/api/settings/cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pattern: "cc_*" }),
        })
        setCacheCleared(true)
        setTimeout(() => setCacheCleared(false), 3000)
      } catch {
        // silently fail
      } finally {
        setCacheDialogOpen(false)
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-warning/10">
                <Wrench className="h-4 w-4 text-[hsl(var(--warning))]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">
                  {maintenance ? "Site is currently in maintenance" : "Site is live"}
                </p>
              </div>
            </div>
            <Switch
              checked={maintenance}
              onCheckedChange={toggleMaintenance}
              disabled={loadingMaint || togglingMaint}
            />
          </div>

          {/* Clear Cache */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Clear Cache</p>
                <p className="text-xs text-muted-foreground">
                  {cacheCleared ? "Cache cleared!" : "Flush Redis cache keys"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCacheDialogOpen(true)}
              disabled={clearingCache}
            >
              {clearingCache ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Clear"}
            </Button>
          </div>

          {/* View Bookings */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">View Bookings</p>
                <p className="text-xs text-muted-foreground">Agent server bookings</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`${agentUrl}/bookings`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Open
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={cacheDialogOpen} onOpenChange={setCacheDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
              Clear Cache
            </DialogTitle>
            <DialogDescription>
              This will flush all Redis cache keys (cc_*). Active sessions will not be affected, but
              cached data will need to be re-fetched. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCacheDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={clearCache} disabled={clearingCache}>
              {clearingCache ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Clear Cache
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
