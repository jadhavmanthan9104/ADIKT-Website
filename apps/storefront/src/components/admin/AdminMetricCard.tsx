"use client"

import React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface AdminMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  icon?: React.ElementType
  badge?: string
}

export function AdminMetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge,
}: AdminMetricCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700/80 transition-all space-y-3 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 text-zinc-300 group-hover:text-accent group-hover:border-accent/40 transition-colors">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-black uppercase text-white font-display tracking-tight">
          {value}
        </h3>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 text-xs pt-1 border-t border-zinc-800/60">
          {trend.isPositive ? (
            <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
              <TrendingUp className="h-3.5 w-3.5" /> {trend.value}
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-red-400 font-bold">
              <TrendingDown className="h-3.5 w-3.5" /> {trend.value}
            </span>
          )}
          <span className="text-[11px] text-zinc-500">vs previous period</span>
        </div>
      )}
    </div>
  )
}
