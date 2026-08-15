import React from "react"
import { CredentialStatus, CredentialType } from "@prisma/client"
import { FileText, Cpu, AlertCircle, CheckCircle2 } from "lucide-react"

interface CredentialCardProps {
  id: string
  title: string
  type: CredentialType
  status: CredentialStatus
  claimCount: number
  onViewClaims?: () => void
}

export function CredentialCard({
  title,
  type,
  status,
  claimCount,
  onViewClaims,
}: CredentialCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "COMPLETE":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Ready
          </span>
        )
      case "ANALYZING":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 animate-pulse">
            <Cpu className="h-3 w-3 animate-spin" /> Analyzing
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <AlertCircle className="h-3 w-3" /> Failed
          </span>
        )
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-850 hover:border-slate-800 rounded-xl p-5 flex flex-col justify-between h-44 shadow-lg group transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xs font-bold text-slate-500 tracking-wider uppercase font-mono">{type}</span>
          {getStatusBadge()}
        </div>
        <h4 className="text-base font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">{title}</h4>
        <p className="text-xs text-slate-450 mt-1">
          {claimCount} zero-knowledge {claimCount === 1 ? "claim" : "claims"} extracted
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span>Credential Doc</span>
        </div>
        <button
          onClick={onViewClaims}
          disabled={status !== "COMPLETE"}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          View Claims &rarr;
        </button>
      </div>
    </div>
  )
}
