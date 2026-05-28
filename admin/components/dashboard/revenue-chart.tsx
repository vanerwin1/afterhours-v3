"use client"

import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface RevenueDataPoint {
  date: string
  amount: number
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {formatCurrency(payload[0].value, "usd", 1)}
      </p>
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(217, 32%, 14%)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val: string) => {
            const d = new Date(val)
            return `${d.getMonth() + 1}/${d.getDate()}`
          }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val: number) => `$${(val / 100).toFixed(0)}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(217, 91%, 65%)", strokeWidth: 1, strokeDasharray: "3 3" }} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="hsl(217, 91%, 65%)"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "hsl(217, 91%, 65%)", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
