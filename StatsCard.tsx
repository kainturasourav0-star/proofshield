import React from "react"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: "emerald" | "violet" | "blue"
}

export function StatsCard({ label, value, icon: Icon, color = "emerald" }: StatsCardProps) {
  const palette = {
    emerald: {
      icon: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
      glow: "group-hover:border-emerald-400/25 group-hover:shadow-[0_18px_50px_-28px_rgba(16,185,129,0.65)]",
    },
    violet: {
      icon: "border-violet-400/20 bg-violet-400/[0.08] text-violet-300",
      glow: "group-hover:border-violet-400/25 group-hover:shadow-[0_18px_50px_-28px_rgba(139,92,246,0.55)]",
    },
    blue: {
      icon: "border-blue-400/20 bg-blue-400/[0.08] text-blue-300",
      glow: "group-hover:border-blue-400/25 group-hover:shadow-[0_18px_50px_-28px_rgba(59,130,246,0.55)]",
    },
  }[color]

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-0.5 ${palette.glow}`}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-400/[0.05] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
        </div>
        <div className={`rounded-xl border p-2.5 ${palette.icon}`}><Icon className="h-[18px] w-[18px]" /></div>
      </div>
    </div>
  )
}
