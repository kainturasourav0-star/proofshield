"use client"

import React, { useState } from "react"
import {
  ClipboardList,
  ShieldCheck,
  ShieldX,
  Search,
  ExternalLink,
  Info,
} from "lucide-react"
import Link from "next/link"

interface LedgerEntry {
  id: string
  candidateAlias: string
  result: "VERIFIED" | "FAILED" | "EXPIRED"
  date: string
  requirements: string
  proofToken: string
}

const DEMO_LEDGER: LedgerEntry[] = [
  {
    id: "v-1",
    candidateAlias: "#A81F",
    result: "VERIFIED",
    date: "2026-08-12",
    requirements: "Python ≥ Intermediate, Security+",
    proofToken: "clx-demo-8a1f",
  },
  {
    id: "v-2",
    candidateAlias: "#B92C",
    result: "FAILED",
    date: "2026-08-11",
    requirements: "Projects ≥ 5, React",
    proofToken: "clx-demo-b92c",
  },
  {
    id: "v-3",
    candidateAlias: "#C44D",
    result: "VERIFIED",
    date: "2026-08-10",
    requirements: "GPA ≥ 3.5, AWS Certified",
    proofToken: "clx-demo-c44d",
  },
  {
    id: "v-4",
    candidateAlias: "#D71E",
    result: "EXPIRED",
    date: "2026-08-09",
    requirements: "TypeScript ≥ Expert",
    proofToken: "clx-demo-d71e",
  },
]

const resultStyles: Record<LedgerEntry["result"], string> = {
  VERIFIED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-400",
  FAILED: "border-red-400/30 bg-red-500/10 text-red-400",
  EXPIRED: "border-amber-400/30 bg-amber-500/10 text-amber-400",
}

export default function LedgerPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"ALL" | "VERIFIED" | "FAILED" | "EXPIRED">("ALL")

  const entries = DEMO_LEDGER.filter((e) => {
    const matchesQuery =
      !query ||
      e.candidateAlias.toLowerCase().includes(query.toLowerCase()) ||
      e.requirements.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === "ALL" || e.result === filter
    return matchesQuery && matchesFilter
  })

  const verified = DEMO_LEDGER.filter((e) => e.result === "VERIFIED").length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Verification Ledger</h1>
        <p className="mt-1 text-sm text-slate-400">
          A cryptographically-auditable record of every verification performed.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <ClipboardList className="h-3.5 w-3.5" /> Total Verifications
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{DEMO_LEDGER.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verified
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{verified}</p>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <ShieldX className="h-3.5 w-3.5 text-red-400" /> Not Qualified
          </div>
          <p className="mt-2 text-2xl font-bold text-red-400">
            {DEMO_LEDGER.length - verified}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by candidate or requirement..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
          {(["ALL", "VERIFIED", "FAILED", "EXPIRED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 shadow-card-dark">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <Search className="mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No matching records</p>
            <p className="mt-1 text-xs text-slate-500">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Candidate</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Requirements</th>
                  <th className="px-5 py-4">Result</th>
                  <th className="px-5 py-4 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {entries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-bold text-slate-200">
                        Candidate {entry.candidateAlias}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{entry.date}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-slate-400">
                      {entry.requirements}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          resultStyles[entry.result]
                        }`}
                      >
                        {entry.result === "VERIFIED" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : entry.result === "FAILED" ? (
                          <ShieldX className="h-3 w-3" />
                        ) : (
                          <Info className="h-3 w-3" />
                        )}
                        {entry.result}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/verify/${entry.proofToken}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                      >
                        View proof <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-600">
        <Info className="h-3.5 w-3.5" />
        Ledger entries are recorded when you verify a proof while signed in as a recruiter. Showing demo records.
      </p>
    </div>
  )
}
