"use client"

import { motion } from "motion/react"
import { ArrowRight, FileCheck2, LockKeyhole, Sparkles } from "lucide-react"
import { CredentialUploader } from "@/components/student/CredentialUploader"

const steps = ["Bring evidence", "Review claims", "Choose disclosure"]

export default function CredentialsPage() {
  return <div className="mx-auto max-w-6xl space-y-9 pb-10">
    <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end"><div><div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-300/80"><Sparkles className="h-3.5 w-3.5" /> Credential studio</div><h1 className="font-serif text-4xl leading-none tracking-[-0.06em] text-[#f4f1e9] sm:text-5xl">Bring the proof.<br /><span className="italic text-lime-300">Keep the source.</span></h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-[#8f9e8a]">Add a document, connect a public GitHub source, or write a claim from scratch. You stay in control of what becomes shareable.</p></div><div className="flex items-center gap-2 text-xs text-[#71806c]"><LockKeyhole className="h-4 w-4 text-lime-300" /> Private by default</div></motion.header>
    <div className="grid gap-3 sm:grid-cols-3">{steps.map((step, index) => <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.45 }} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"><span className="font-mono text-[10px] text-lime-300">0{index + 1}</span><span className="text-xs font-medium text-[#b9c6b3]">{step}</span>{index < steps.length - 1 && <ArrowRight className="ml-auto hidden h-3.5 w-3.5 text-[#526050] sm:block" />}</motion.div>)}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px] xl:items-start"><CredentialUploader /><aside className="space-y-3"><div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><FileCheck2 className="h-5 w-5 text-lime-300" /><h2 className="mt-4 text-sm font-semibold text-[#f4f1e9]">What gets saved?</h2><p className="mt-2 text-xs leading-relaxed text-[#71806c]">Only extracted claims and a secure commitment. Your original file is never displayed in a proof receipt.</p></div><div className="rounded-2xl border border-lime-300/15 bg-lime-300/[0.05] p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300">Tip</p><p className="mt-2 text-xs leading-relaxed text-[#9eaa99]">Start with one clear claim. You can add more sources and combine them later.</p></div></aside></div>
  </div>
}
