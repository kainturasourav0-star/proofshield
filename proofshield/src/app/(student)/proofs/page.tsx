"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Zap,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ShieldCheck,
  Plus,
  History,
} from "lucide-react"
import Link from "next/link"

interface Proof {
  id: string
  shareToken: string
  midnightStatus: string
  midnightTxId: string | null
  expiresAt: string | null
  createdAt: string
  proofClaims: { claim: { subject: string } }[]
}

const statusStyles: Record<string, string> = {
  CONFIRMED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-400",
  SUBMITTED: "border-blue-400/30 bg-blue-500/10 text-blue-400",
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  FAILED: "border-red-400/30 bg-red-500/10 text-red-400",
}

export default function ProofHistoryPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["proofs"],
    queryFn: async () => {
      const res = await fetch("/api/proofs")
      return res.json()
    },
  })

  const proofs: Proof[] = data?.proofs || []

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/verify/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Proof History</h1>
          <p className="mt-1 text-sm text-slate-400">
            Every zero-knowledge proof you&apos;ve generated, with its on-chain status.
          </p>
        </div>
        <Link
          href="/proofs/generate"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Generate New Proof
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
          ))}
        </div>
      ) : proofs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 px-6 py-16 text-center">
          <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <History className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No proofs generated yet</h3>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            Build your first zero-knowledge proof from your verified claims — it takes under a minute.
          </p>
          <Link
            href="/proofs/generate"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] active:scale-[0.98]"
          >
            <Zap className="h-4 w-4" /> Generate a Proof
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 shadow-card-dark">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Proof</th>
                  <th className="px-5 py-4">Claims</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4">Expires</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {proofs.map((proof) => {
                  const isConfirmed = proof.midnightStatus === "CONFIRMED"
                  return (
                    <tr key={proof.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                              isConfirmed
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400"
                                : "border-blue-400/30 bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-mono text-xs text-slate-300">
                            #{proof.id.substring(0, 10)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {proof.proofClaims?.length || 0} claim{proof.proofClaims?.length === 1 ? "" : "s"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold ${
                            statusStyles[proof.midnightStatus] || statusStyles.PENDING
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isConfirmed ? "bg-emerald-400" : "bg-blue-400 animate-pulse"
                            }`}
                          />
                          {proof.midnightStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(proof.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {proof.expiresAt ? new Date(proof.expiresAt).toLocaleDateString() : "No expiry"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyLink(proof.shareToken)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-emerald-500/40 hover:text-emerald-300"
                          >
                            {copiedToken === proof.shareToken ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" /> Copy Link
                              </>
                            )}
                          </button>
                          <Link
                            href={`/verify/${proof.shareToken}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:border-emerald-500/40 hover:text-emerald-300"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-xs text-slate-600">
        <Clock className="h-3.5 w-3.5" />
        Proof commitments are anchored on the Midnight testnet. Share links stay valid until expiry.
      </p>
    </div>
  )
}
