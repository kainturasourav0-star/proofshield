"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { CredentialStatus, CredentialType } from "@prisma/client"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, ExternalLink, FileText, Fingerprint, Plus, RefreshCw, Shield, Sparkles, Zap } from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"
import { CredentialCard } from "@/components/student/CredentialCard"
import { stagger, staggerItem } from "@/lib/animations"

async function loadJson(path: string) {
  const response = await fetch(path, { cache: "no-store" })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || "Workspace data could not be loaded")
  return payload
}

type DashboardClaim = {
  id: string
  claimType: string
  subject: string
  predicate: string
  value: string
  isPublic?: boolean
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-2xl border border-red-300/15 bg-red-300/[0.04] p-7 text-center"><AlertCircle className="mx-auto mb-3 h-6 w-6 text-red-300" /><p className="text-sm font-medium text-[#f4f1e9]">The workspace could not refresh</p><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#9a817c]">Your data is safe. Try the connection again, or open another section while the service recovers.</p><button type="button" onClick={onRetry} className="button-secondary mt-5"><RefreshCw className="h-3.5 w-3.5" /> Retry now</button></div>
}

export default function StudentDashboard() {
  const credentialsQuery = useQuery({ queryKey: ["credentials"], queryFn: () => loadJson("/api/credentials") })
  const proofsQuery = useQuery({ queryKey: ["proofs"], queryFn: () => loadJson("/api/proofs") })
  const credentials = credentialsQuery.data?.credentials || []
  const proofs = proofsQuery.data?.proofs || []
  const claimsCount = credentials.reduce((acc: number, current: { claims?: unknown[] }) => acc + (current.claims?.length || 0), 0)
  const completedCredentials = credentials.filter((credential: { status: string }) => credential.status === "COMPLETE").length
  const passportProgress = credentials.length === 0 ? 0 : Math.min(100, Math.round((completedCredentials / credentials.length) * 100))
  const isLoading = credentialsQuery.isLoading || proofsQuery.isLoading
  const isError = credentialsQuery.isError || proofsQuery.isError
  const refresh = () => { void credentialsQuery.refetch(); void proofsQuery.refetch() }
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null)
  const selectedCredential = credentials.find((credential: { id: string }) => credential.id === selectedCredentialId) as { title: string; claims?: DashboardClaim[] } | undefined

  return <div className="space-y-9 pb-10">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="relative overflow-hidden rounded-[30px] border border-lime-300/15 bg-[linear-gradient(135deg,rgba(184,242,109,.1),rgba(17,24,19,.96)_46%)] p-6 shadow-[0_30px_90px_-54px_rgba(184,242,109,.6)] sm:p-8">
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-lime-300/[0.08]" /><div className="pointer-events-none absolute right-12 top-16 h-32 w-32 rounded-full bg-lime-300/[0.06] blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_270px] lg:items-end"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/15 bg-lime-300/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-200"><Sparkles className="h-3.5 w-3.5" /> Your privacy workspace</div><h1 className="max-w-2xl font-serif text-4xl leading-[0.95] tracking-[-0.06em] text-[#f4f1e9] sm:text-5xl">Build proof that <span className="italic text-lime-300">travels.</span></h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-[#9eaa99]">Add the credentials that matter, decide what stays private, and create a proof receipt when you are ready.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/credentials" className="button-primary"><Plus className="h-4 w-4" /> Add a credential</Link><Link href="/proofs/generate" className="button-secondary"><Zap className="h-4 w-4 text-lime-300" /> Create a proof</Link><button type="button" onClick={refresh} className="button-secondary" disabled={credentialsQuery.isFetching || proofsQuery.isFetching}><RefreshCw className={`h-4 w-4 ${credentialsQuery.isFetching || proofsQuery.isFetching ? "animate-spin" : ""}`} /> Refresh</button></div></div><div className="rounded-2xl border border-white/[0.09] bg-black/20 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71806c]">Passport readiness</span><span className="font-mono text-xs text-lime-300">{passportProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.07]"><motion.div initial={{ width: 0 }} animate={{ width: `${passportProgress}%` }} transition={{ duration: 0.9, delay: 0.3 }} className="h-full rounded-full bg-lime-300" /></div><p className="mt-3 text-xs leading-relaxed text-[#71806c]">{credentials.length === 0 ? "Start with one credential." : `${completedCredentials} of ${credentials.length} credentials are ready.`}</p><div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6d7c68]"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Source stays private</div></div></div>
    </motion.section>

    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ label: "Credentials", value: credentials.length, icon: FileText, color: "emerald" as const }, { label: "Claims extracted", value: claimsCount, icon: Fingerprint, color: "violet" as const }, { label: "Proofs generated", value: proofs.length, icon: Zap, color: "emerald" as const }, { label: "Verification status", value: proofs.length ? "Active" : "Ready", icon: Clock3, color: "blue" as const }].map((stat) => { const Icon = stat.icon; return <motion.div key={stat.label} variants={staggerItem}><StatsCard label={stat.label} value={stat.value} icon={Icon} color={stat.color} /></motion.div> })}</motion.div>

    <section className="space-y-4"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300/80">Your sources</p><h2 className="mt-1 font-serif text-3xl tracking-[-0.04em] text-[#f4f1e9]">Credentials</h2></div><Link href="/credentials" className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-300 transition hover:text-lime-200">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>{isLoading ? <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />)}</div> : credentialsQuery.isError ? <ErrorState onRetry={refresh} /> : credentials.length === 0 ? <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-10 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-300/15 bg-lime-300/[0.06]"><FileText className="h-5 w-5 text-lime-300" /></div><h3 className="text-sm font-semibold text-[#f4f1e9]">Your passport is empty</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[#71806c]">Upload a credential, connect GitHub, or write a manual claim. ProofShield turns it into a reviewable statement.</p><Link href="/credentials" className="button-primary mt-5">Add your first credential <ArrowUpRight className="h-3.5 w-3.5" /></Link></div> : <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 md:grid-cols-3">{credentials.map((credential: { id: string; title: string; type: CredentialType; status: CredentialStatus; claims?: unknown[] }) => <motion.div key={credential.id} variants={staggerItem}><CredentialCard id={credential.id} title={credential.title} type={credential.type} status={credential.status} claimCount={credential.claims?.length || 0} onViewClaims={() => setSelectedCredentialId(credential.id)} /></motion.div>)}</motion.div>}</section>

    <section className="space-y-4"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">Your activity</p><h2 className="mt-1 font-serif text-3xl tracking-[-0.04em] text-[#f4f1e9]">Recent proofs</h2></div><Link href="/proofs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-300 transition hover:text-lime-200">Proof history <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>{isLoading ? <div className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" /> : proofsQuery.isError ? <ErrorState onRetry={refresh} /> : proofs.length === 0 ? <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-8 text-center"><CheckCircle2 className="mx-auto mb-3 h-7 w-7 text-[#526050]" /><p className="text-xs text-[#71806c]">Your generated proof receipts will appear here.</p><Link href="/proofs/generate" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-lime-300">Generate a proof <ArrowUpRight className="h-3.5 w-3.5" /></Link></div> : <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-white/[0.07] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#657463]"><th className="p-4">Receipt</th><th className="p-4">Created</th><th className="p-4">Claims</th><th className="p-4">Network</th><th className="p-4">Expiry</th><th className="p-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/[0.05] text-xs text-[#bac6b5]">{proofs.map((proof: { id: string; createdAt: string; proofClaims?: unknown[]; midnightStatus: string; expiresAt?: string | null; shareToken: string }, index: number) => <motion.tr key={proof.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: index * 0.06 }} className="transition hover:bg-lime-300/[0.025]"><td className="p-4 font-mono text-lime-200/75">{proof.id.substring(0, 10)}...</td><td className="p-4 text-[#71806c]">{new Date(proof.createdAt).toLocaleDateString()}</td><td className="p-4">{proof.proofClaims?.length || 0} claims</td><td className="p-4"><span className="inline-flex items-center gap-1.5 rounded-full border border-lime-300/15 bg-lime-300/[0.06] px-2 py-1 font-mono text-[10px] text-lime-300"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" />{proof.midnightStatus}</span></td><td className="p-4 text-[#71806c]">{proof.expiresAt ? new Date(proof.expiresAt).toLocaleDateString() : "No expiry"}</td><td className="p-4 text-right"><Link href={`/verify/${proof.shareToken}`} target="_blank" className="inline-flex items-center gap-1.5 font-semibold text-lime-300 transition hover:text-lime-200">Open receipt <ExternalLink className="h-3 w-3" /></Link></td></motion.tr>)}</tbody></table></div></div>}</section>

    {isError && !credentialsQuery.isError && !proofsQuery.isError && <div className="text-center text-xs text-[#71806c]">Some workspace data is unavailable. <button type="button" onClick={refresh} className="text-lime-300 hover:underline">Refresh</button></div>}

    <AnimatePresence>
      {selectedCredential && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedCredentialId(null)}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="credential-claims-title"
            className="w-full max-w-lg rounded-[24px] border border-lime-300/15 bg-[#121a14] p-6 shadow-[0_30px_100px_-35px_rgba(184,242,109,.5)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300/80">Extracted claims</p>
                <h2 id="credential-claims-title" className="mt-1 font-serif text-3xl tracking-[-0.04em] text-[#f4f1e9]">{selectedCredential.title}</h2>
              </div>
              <button type="button" aria-label="Close claims" onClick={() => setSelectedCredentialId(null)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#9eaa99] transition hover:border-lime-300/30 hover:text-lime-200">Close</button>
            </div>
            <div className="mt-6 space-y-3">
              {(selectedCredential.claims || []).map((claim) => (
                <div key={claim.id} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#71806c]">{claim.claimType.replaceAll("_", " ")}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${claim.isPublic === false ? "bg-white/[0.06] text-[#8f9b89]" : "bg-lime-300/10 text-lime-200"}`}>{claim.isPublic === false ? "Private" : "Provable"}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#f4f1e9]">{claim.subject}</p>
                  <p className="mt-1 text-xs text-[#9eaa99]">{claim.predicate} {claim.value}</p>
                </div>
              ))}
              {(selectedCredential.claims || []).length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-xs text-[#71806c]">No claims have been extracted yet.</p>}
            </div>
            <Link href="/passport" className="button-secondary mt-6 w-full justify-center">Manage visibility <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
}
