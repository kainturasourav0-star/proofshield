"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react"

interface BlockchainStatusProps {
  txId: string
  initialStatus: string
}

export function BlockchainStatus({ txId, initialStatus }: BlockchainStatusProps) {
  const { data } = useQuery({
    queryKey: ["midnightStatus", txId],
    queryFn: async () => {
      const res = await fetch(`/api/midnight/status/${txId}`)
      return res.json()
    },
    refetchInterval: (query) => {
      // Only refetch while not confirmed or failed
      const status = query.state.data?.status
      if (status === "CONFIRMED" || status === "FAILED") {
        return false
      }
      return 3000 // Poll every 3 seconds
    },
    initialData: { status: initialStatus },
  })

  const status = data?.status || initialStatus

  if (status === "CONFIRMED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg font-mono">
        <CheckCircle2 className="h-3.5 w-3.5" /> CONFIRMED
      </span>
    )
  }

  if (status === "SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg font-mono animate-pulse">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> SUBMITTED
      </span>
    )
  }

  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg font-mono">
        <ShieldAlert className="h-3.5 w-3.5" /> FAILED
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg font-mono animate-pulse">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> PENDING
    </span>
  )
}
