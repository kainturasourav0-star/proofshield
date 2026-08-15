"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { ArrowUpRight, CheckCircle2, Clock3, ExternalLink, FileText, Fingerprint, Plus, Shield, Sparkles, Zap } from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"
import { CredentialCard } from "@/components/student/CredentialCard"
import Link from "next/link"
import { stagger, staggerItem } from "@/lib/animations"

export default function StudentDashboard() {
  const { data: credData, isLoading: credLoading } = useQuery({
    queryKey: ["credentials"],
    queryFn: async () => (await fetch("/api/credentials")).json(),
  })
  const { data: proofData, isLoading: proofLoading } = useQuery({
    queryKey: ["proofs"],
    queryFn: async () => (await fetch("/api/proofs")).json(),
  })

  const credentials = credData?.credentials || []
  const proofs = proofData?.proofs || []
  const claimsCount = credentials.reduce((acc: number, current: any) => acc + (current.claims?.length || 0), 0)
  const completedCredentials = credentials.filter((credential: any) => credential.status === "COMPLETE").length
  const passportProgress = credentials.length === 0 ? 0 : Math.min(100, Math.round((completedCredentials / credentials.length) * 100))

  return (
    <div className="space-y-9 pb-10">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-[28px] border border-emerald-400/15 bg-gradient-to-br from-emerald-400/[0.1] via-[#0d1424] to-[#0d1424] p-6 shadow-[0_24px_70px_-42px_rgba(16,185,129,0.6)] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/[0.09] blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_260px] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300"><Sparkles className="h-3.5 w-3.5" /> Your privacy workspace</div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Build proof that travels<span className="text-gradient-emerald">.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">Add the credentials that matter, decide what stays private, and create a proof receipt when you are ready.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/credentials" className="button-primary"><Plus className="h-4 w-4" /> Add a credential</Link><Link href="/passport" className="button-secondary"><Shield className="h-4 w-4 text-emerald-300" /> Open Privacy Passport</Link></div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Passport readiness</span><span className="font-mono text-xs text-emerald-300">{passportProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.07]"><motion.div initial={{ width: 0 }} animate={{ width: `${passportProgress}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" /></div><p className="mt-3 text-xs leading-relaxed text-slate-500">{credentials.length === 0 ? "Start with one credential." : `${completedCredentials} of ${credentials.length} credentials are ready.`}</p></div>
        </div>
      </motion.section>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: "Credentials", value: credentials.length, icon: FileText, color: "emerald" as const }, { label: "Claims extracted", value: claimsCount, icon: Fingerprint, color: "violet" as const }, { label: "Proofs generated", value: proofs.length, icon: Zap, color: "emerald" as const }, { label: "Verification status", value: proofs.length ? "Active" : "Ready", icon: Clock3, color: "blue" as const }].map((stat) => { const Icon = stat.icon; return <motion.div key={stat.label} variants={staggerItem}><StatsCard label={stat.label} value={stat.value} icon={Icon} color={stat.color} /></motion.div> })}
      </motion.div>

      <section className="space-y-4"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">Your sources</p><h2 className="mt-1 text-xl font-semibold text-white">Credentials</h2></div><Link href="/credentials" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>{credLoading ? <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />)}</div> : credentials.length === 0 ? <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-10 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06]"><FileText className="h-5 w-5 text-emerald-300" /></div><h3 className="text-sm font-semibold text-white">Your passport is empty</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">Upload a credential or write a manual claim. ProofShield will turn it into a reviewable, privacy-preserving statement.</p><Link href="/credentials" className="button-primary mt-5">Add your first credential <ArrowUpRight className="h-3.5 w-3.5" /></Link></div> : <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 md:grid-cols-3">{credentials.map((credential: any) => <motion.div key={credential.id} variants={staggerItem}><CredentialCard id={credential.id} title={credential.title} type={credential.type} status={credential.status} claimCount={credential.claims?.length || 0} /></motion.div>)}</motion.div>}</section>

      <section className="space-y-4"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/80">Your activity</p><h2 className="mt-1 text-xl font-semibold text-white">Recent proofs</h2></div><Link href="/proofs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200">Proof history <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>{proofLoading ? <div className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" /> : proofs.length === 0 ? <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-8 text-center"><CheckCircle2 className="mx-auto mb-3 h-7 w-7 text-slate-600" /><p className="text-xs text-slate-500">Your generated proof receipts will appear here.</p><Link href="/proofs/generate" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">Generate a proof <ArrowUpRight className="h-3.5 w-3.5" /></Link></div> : <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-white/[0.07] text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500"><th className="p-4">Receipt</th><th className="p-4">Created</th><th className="p-4">Claims</th><th className="p-4">Network</th><th className="p-4">Expiry</th><th className="p-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/[0.05] text-xs text-slate-300">{proofs.map((proof: any, index: number) => <motion.tr key={proof.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: index * 0.06 }} className="transition hover:bg-white/[0.025]"><td className="p-4 font-mono text-cyan-200/75">{proof.id.substring(0, 10)}...</td><td className="p-4 text-slate-500">{new Date(proof.createdAt).toLocaleDateString()}</td><td className="p-4">{proof.proofClaims?.length || 0} claims</td><td className="p-4"><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 font-mono text-[10px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{proof.midnightStatus}</span></td><td className="p-4 text-slate-500">{proof.expiresAt ? new Date(proof.expiresAt).toLocaleDateString() : "No expiry"}</td><td className="p-4 text-right"><Link href={`/verify/${proof.shareToken}`} target="_blank" className="inline-flex items-center gap-1.5 font-semibold text-emerald-300 transition hover:text-emerald-200">Open receipt <ExternalLink className="h-3 w-3" /></Link></td></motion.tr>)}</tbody></table></div></div>}</section>
    </div>
  )
}
