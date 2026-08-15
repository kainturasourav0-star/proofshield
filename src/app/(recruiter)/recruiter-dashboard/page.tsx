"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { Search, ClipboardList, ShieldAlert, CheckCircle2, Settings, ExternalLink } from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"
import Link from "next/link"

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] as const } },
}

export default function RecruiterDashboard() {
  // We can fetch verification history if implemented
  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ["verifications"],
    queryFn: async () => {
      // In production, GET /api/verifications
      return { verifications: [] }
    },
  })

  const verifications = ledgerData?.verifications || []

  // Custom mock verification records for demonstration
  const displayVerifications = verifications.length > 0 ? verifications : [
    { id: "v-1", candidateAlias: "#A81F", result: "VERIFIED", date: "2026-08-12", requirements: "Python >= Intermediate, Security+" },
    { id: "v-2", candidateAlias: "#B92C", result: "FAILED", date: "2026-08-11", requirements: "Projects >= 5, React" },
  ]

  const verifiedCount = displayVerifications.filter((v) => v.result === "VERIFIED").length
  const failedCount = displayVerifications.filter((v) => v.result === "FAILED").length

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white font-sans">
          Recruiter Dashboard<span className="text-gradient-emerald">.</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Audit verification logs, compile target requirement sets, and inspect candidate proofs.</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={fadeUp}>
          <StatsCard label="Total Verifications" value={displayVerifications.length} icon={ClipboardList} color="emerald" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatsCard label="Verified Count" value={verifiedCount} icon={CheckCircle2} color="emerald" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatsCard label="Failed Count" value={failedCount} icon={ShieldAlert} color="violet" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatsCard label="Saved Requirement Sets" value={2} icon={Settings} color="violet" />
        </motion.div>
      </motion.div>

      {/* Main Ledger Section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-lg font-bold text-slate-200">Verification Ledger</h2>
          <Link
            href="/verify"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold rounded-lg shadow-glow-emerald hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98]"
          >
            <Search className="h-3.5 w-3.5" /> Verify Candidate
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="h-32 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse" />
        ) : displayVerifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="border border-dashed border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center"
          >
            <ClipboardList className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No verifications performed yet.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-slate-900/40 border border-slate-800/70 rounded-2xl overflow-hidden shadow-card-dark"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/20">
                  <th className="p-4">Candidate ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Requirements</th>
                  <th className="p-4">Result</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-350">
                {displayVerifications.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
                    className="hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-slate-200">{v.candidateAlias}</td>
                    <td className="p-4 text-slate-400">{v.date}</td>
                    <td className="p-4 text-slate-400 line-clamp-1 truncate max-w-xs">{v.requirements}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded border ${
                          v.result === "VERIFIED"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-red-400 bg-red-500/10 border-red-500/20"
                        }`}
                      >
                        {v.result}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
                        View Details <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  )
}
