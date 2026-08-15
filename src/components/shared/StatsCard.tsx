import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: "emerald" | "violet" | "blue"
}

export function StatsCard({ label, value, icon: Icon, color = "emerald" }: StatsCardProps) {
  const palette = {
    emerald: { mark: "bg-lime-300", icon: "border-lime-300/20 bg-lime-300/[0.07] text-lime-300" },
    violet: { mark: "bg-violet-300", icon: "border-violet-300/20 bg-violet-300/[0.07] text-violet-200" },
    blue: { mark: "bg-sky-300", icon: "border-sky-300/20 bg-sky-300/[0.07] text-sky-200" },
  }[color]

  return <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition duration-500 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.045]">
    <div className={`absolute left-0 top-5 h-8 w-0.5 ${palette.mark}`} />
    <div className="relative flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687665]">{label}</p><p className="mt-5 font-serif text-4xl tracking-[-0.06em] text-[#f4f1e9] tabular-nums">{value}</p><p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#526050]">Live workspace signal</p></div><div className={`rounded-xl border p-2.5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105 ${palette.icon}`}><Icon className="h-[18px] w-[18px]" /></div></div>
  </div>
}
