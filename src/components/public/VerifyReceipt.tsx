"use client"

import React from "react"
import { motion } from "motion/react"
import {
  Shield,
  Check,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Lock,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface ProofClaim {
  claim: {
    claimType: string
    subject: string
  }
}

interface ProofData {
  id: string
  shareToken: string
  proofHash?: string
  midnightTxId?: string | null
  midnightStatus: string
  expiresAt?: Date | string | null
  createdAt: Date | string
  proofClaims: ProofClaim[]
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] as const } },
}

const popIn = {
  hidden: { opacity: 0, scale: 0.5, rotate: -15 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 20 },
  },
}

const checkDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.45, ease: "easeOut" as const }, opacity: { duration: 0.15 } },
  },
}

export function VerifyReceipt({
  proof,
  isExpired,
}: {
  proof: ProofData
  isExpired: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="relative z-10 w-full max-w-xl mx-auto px-6 space-y-8"
    >
      {/* Logo Branding */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center space-y-3"
      >
        <motion.div
          variants={popIn}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-xl"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative p-3 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-glow-emerald">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>
        <motion.h2 variants={item} className="text-xl font-bold tracking-tight text-white mt-3">
          ProofShield Cryptographic Receipt
        </motion.h2>
        <motion.p variants={item} className="text-xs text-slate-500 uppercase tracking-wider font-mono">
          Zero-Knowledge Verification Receipt
        </motion.p>
      </motion.div>

      {isExpired ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="bg-red-500/10 border border-red-500/25 rounded-2xl p-8 text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.2 }}
          >
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
          </motion.div>
          <h3 className="text-lg font-bold text-white">This proof has expired</h3>
          <p className="text-sm text-slate-400">
            The cryptographic keys for this proof were invalidated on{" "}
            {proof.expiresAt ? new Date(proof.expiresAt).toLocaleDateString() : ""}.
          </p>
          <motion.div variants={container} initial="hidden" animate="visible">
            <motion.div variants={item}>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Learn more about ProofShield &rarr;
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="border-t-accent bg-slate-900/60 border border-slate-800/70 rounded-2xl p-6 backdrop-blur-md shadow-card-dark space-y-6"
        >
          {/* Badges and ID */}
          <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Verification Status</span>
              <span className="inline-flex items-center gap-2 text-2xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 font-mono">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {proof.midnightStatus} ON MIDNIGHT TESTNET
              </span>
            </div>
            <div className="text-left sm:text-right space-y-1.5">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Token Identifier</span>
              <span className="font-mono text-xs text-slate-200 flex sm:justify-end items-center gap-1.5">
                <Fingerprint className="h-3.5 w-3.5 text-emerald-400/60" />
                #{proof.shareToken.substring(0, 12)}...
              </span>
            </div>
          </motion.div>

          {/* Claims list */}
          <div className="space-y-3.5">
            <motion.span variants={item} className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
              Proven Qualifications
            </motion.span>
            <motion.div variants={container} initial="hidden" animate="visible" className="space-y-2">
              {proof.proofClaims.map((pc: any, idx: number) => (
                <motion.div
                  key={idx}
                  variants={item}
                  whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.4)" }}
                  className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">
                      {pc.claim.claimType}
                    </span>
                    <span className="font-semibold text-slate-200">{pc.claim.subject}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/25">
                    <motion.svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-emerald-400 stroke-2">
                      <motion.path
                        d="M5 13l4 4L19 7"
                        variants={checkDraw}
                        initial="hidden"
                        animate="visible"
                      />
                    </motion.svg>
                    Meets requirement
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Metadata */}
          <motion.div variants={item} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-500 font-semibold uppercase flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" /> Created On
              </span>
              <span className="text-slate-400">{new Date(proof.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-500 font-semibold uppercase flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" /> Expires On
              </span>
              <span className="text-slate-400">
                {proof.expiresAt ? new Date(proof.expiresAt).toLocaleDateString() : "No expiry"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold uppercase flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-500" /> Midnight TX
              </span>
              {proof.midnightTxId ? (
                <span className="font-mono text-2xs text-slate-300 font-semibold flex items-center gap-1">
                  {proof.midnightTxId.substring(0, 14)}...
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  PENDING_TX_COMMIT
                </span>
              )}
            </div>
          </motion.div>

          {/* Recruiter CTA callout */}
          <motion.div variants={item} className="pt-4 border-t border-slate-800 flex flex-col items-center text-center space-y-4">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xs text-slate-500 leading-relaxed max-w-sm"
            >
              Recruiters: Log in to save this verification to your ledger and test against custom requirement sets.
            </motion.p>
            <motion.div variants={popIn} className="w-full">
              <Link
                href="/auth/login?recruiter=true"
                className="group w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-glow-emerald hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98]"
              >
                Verify Against Your Requirements
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
