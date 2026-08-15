"use client"

import React from "react"
import { motion } from "motion/react"
import { CheckCircle2, XCircle, Cpu, ExternalLink } from "lucide-react"

interface RequirementResult {
  requirement: {
    claimType: string
    subject: string
    predicate: string
    value: string
  }
  met: boolean
}

interface VerificationResultProps {
  result: "VERIFIED" | "FAILED" | "EXPIRED"
  candidateAlias: string
  txHash?: string
  requirementResults: RequirementResult[]
  onReset: () => void
}

export function VerificationResult({
  result,
  candidateAlias,
  txHash = "0x8f2a7b1c3d9e5f6a8b0c2e4d6f8a0b2c4d6e8f0a",
  requirementResults,
  onReset,
}: VerificationResultProps) {
  const isVerified = result === "VERIFIED"

  const glowColor = isVerified ? "shadow-emerald-500/10 border-emerald-500/30" : "shadow-red-500/10 border-red-500/30"
  const bannerBg = isVerified ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full max-w-xl mx-auto bg-slate-900 border rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6 ${glowColor}`}
    >
      {/* Top Banner Result */}
      <div className={`p-4 rounded-xl flex items-center justify-between border ${bannerBg}`}>
        <div className="flex items-center gap-3">
          {isVerified ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 animate-bounce" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-bold tracking-wide uppercase">
              {isVerified ? "VERIFIED SUCCESS" : "FAILED / NOT QUALIFIED"}
            </h4>
            <p className="text-xs opacity-80">Candidate matches requirement parameters.</p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          {candidateAlias}
        </span>
      </div>

      {/* Midnight ledger metadata */}
      <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-850/60 pb-2">
          <span className="text-slate-500 font-semibold uppercase">Verification Engine</span>
          <span className="text-slate-300 font-bold">Midnight Cryptographic Circuit</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-semibold uppercase">Blockchain TX</span>
          <a
            href={`https://explorer.midnight.network/tx/${txHash}`}
            target="_blank"
            className="font-mono text-emerald-400 hover:underline inline-flex items-center gap-0.5"
          >
            {txHash.substring(0, 12)}... <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Requirements evaluation list */}
      <div className="space-y-3">
        <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">Requirements Evaluation</span>
        <div className="space-y-2">
          {requirementResults.map((res, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center justify-between text-sm"
            >
              <div>
                <span className="text-[10px] text-slate-500 font-mono block uppercase">
                  {res.requirement.claimType}
                </span>
                <span className="font-semibold text-slate-200">
                  {res.requirement.subject} {res.requirement.predicate === "has" ? "Possession" : `${res.requirement.predicate} ${res.requirement.value}`}
                </span>
              </div>
              <span
                className={`text-2xs font-extrabold px-2 py-0.5 rounded border uppercase ${
                  res.met
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
                }`}
              >
                {res.met ? "PASS" : "FAIL"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom privacy notice */}
      <div className="pt-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-2xs text-slate-500 flex items-center gap-1">
          <Cpu className="h-3.5 w-3.5 text-emerald-500/60" />
          🔒 Private credentials not disclosed · Verified on Midnight Network
        </span>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors w-full sm:w-auto text-right"
        >
          Verify Another Link &rarr;
        </button>
      </div>
    </motion.div>
  )
}
