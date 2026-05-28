"use client"

import React, { useEffect, useRef, useState } from "react"
import { formatRelativeTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

interface ActivityEvent {
  id: string
  action: string
  userEmail: string
  resource?: string
  ip?: string
  createdAt: string
  isNew?: boolean
}

const ACTION_COLORS: Record<string, "default" | "destructive" | "secondary" | "success" | "warning" | "outline"> = {
  "user.ban": "destructive",
  "user.unban": "success",
  "user.delete": "destructive",
  "stripe.refund": "warning",
  "settings.maintenance_toggle": "warning",
  "security.session_kill": "destructive",
  "security.api_key_revoke": "destructive",
}

function getActionColor(action: string) {
  return ACTION_COLORS[action] ?? "secondary"
}

function formatAction(action: string) {
  return action.replace(/\./g, " › ").replace(/_/g, " ")
}

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  const connect = () => {
    if (esRef.current) esRef.current.close()

    const es = new EventSource("/api/events")
    esRef.current = es

    es.onopen = () => setConnected(true)

    es.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data as string) as ActivityEvent | ActivityEvent[]
        const incoming = Array.isArray(data) ? data : [data]
        setEvents((prev) => {
          const newItems = incoming
            .filter((item) => !prev.some((p) => p.id === item.id))
            .map((item) => ({ ...item, isNew: true }))
          const merged = [...newItems, ...prev].slice(0, 20)
          // clear isNew after 2s
          setTimeout(() => {
            setEvents((e2) => e2.map((item) => ({ ...item, isNew: false })))
          }, 2000)
          return merged
        })
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      // Reconnect after 5s
      setTimeout(connect, 5000)
    }
  }

  useEffect(() => {
    connect()
    return () => esRef.current?.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Live Activity
        </CardTitle>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-[hsl(var(--success))] animate-pulse" : "bg-muted-foreground"}`}
          />
          <span className="text-xs text-muted-foreground">{connected ? "Live" : "Reconnecting..."}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {events.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Waiting for activity...
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li
                key={event.id}
                className={`px-6 py-3 flex items-start gap-3 transition-colors ${
                  event.isNew ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getActionColor(event.action)} className="text-[10px] py-0 px-1.5 h-4 shrink-0">
                      {formatAction(event.action)}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">{event.userEmail}</span>
                    {event.resource && (
                      <span className="text-xs text-muted-foreground/60 truncate">
                        → {event.resource}
                      </span>
                    )}
                  </div>
                  {event.ip && (
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">IP: {event.ip}</p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                  {formatRelativeTime(event.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
