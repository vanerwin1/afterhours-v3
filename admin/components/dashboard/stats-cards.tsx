import React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface StatCard {
  title: string
  value: string
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: React.ReactNode
  description?: string
  loading?: boolean
}

function StatCardItem({ title, value, change, changeType, icon, description, loading }: StatCard) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground truncate">{value}</p>
            {(change || description) && (
              <div className="flex items-center gap-1.5">
                {change && changeType && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-medium",
                      changeType === "up" && "text-[hsl(var(--success))]",
                      changeType === "down" && "text-destructive",
                      changeType === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {changeType === "up" && <TrendingUp className="h-3 w-3" />}
                    {changeType === "down" && <TrendingDown className="h-3 w-3" />}
                    {changeType === "neutral" && <Minus className="h-3 w-3" />}
                    {change}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 shrink-0 ml-4">
            <span className="text-primary">{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCardItem key={i} {...card} />
      ))}
    </div>
  )
}
