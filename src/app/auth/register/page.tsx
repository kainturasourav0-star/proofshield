"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Briefcase, Fingerprint, GraduationCap, Loader2, Lock, Mail, Shield, User, Wallet } from "lucide-react"
import { motion } from "motion/react"

const roles = [
  { value: "CANDIDATE" as const, label: "Candidate", icon: GraduationCap, detail: "Build a private credential passport" },
  { value: "RECRUITER" as const, label: "Recruiter", icon: Briefcase, detail: "Verify claims with less noise" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, role, walletAddress: walletAddress || undefined }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create account")
      const result = await signIn("credentials", { redirect: false, email, password, callbackUrl: "/dashboard" })
      if (result?.error) setError("Account created, but automatic sign in failed. Please sign in manually.")
      else { router.refresh(); router.push("/dashboard") }
    } catch (err: any) { setError(err.message || "An unexpected error occurred. Please try again.") }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page relative min-h-screen overflow-hidden bg-[#080b09] text-[#f4f1e9] selection:bg-lime-300/20">
      <div className="auth-grid pointer-events-none absolute inset-0" /><div className="auth-noise pointer-events-none absolute inset-0" /><div className="pointer-events-none absolute right-[-160px] top-[-100px] h-[520px] w-[520px] rounded-full bg-lime-300/[0.05] blur-[140px]" />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1560px] lg:grid-cols-[.9fr_1.1fr]">
        <section className="flex flex-col px-6 pb-10 pt-7 sm:px-10 lg:px-16 lg:py-10">
          <Link href="/" className="group inline-flex w-fit items-center gap-3" aria-label="ProofShield home"><span className="relative flex h-10 w-10 items-center justify-center border border-lime-300/25 bg-lime-300/[0.08] transition-transform duration-500 group-hover:rotate-[-8deg]"><span className="absolute inset-[6px] border border-lime-200/15" /><Shield className="relative h-5 w-5 text-lime-200" strokeWidth={1.6} /></span><span className="text-lg font-semibold tracking-[-0.05em]">Proof<span className="text-lime-300">Shield</span></span></Link>
          <div className="my-auto max-w-xl py-16"><div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#73836f]"><span className="font-mono text-lime-300">01</span><span className="h-px w-8 bg-lime-300/40" /> Build your proof layer</div><h1 className="mt-7 max-w-lg font-serif text-[clamp(3.8rem,7vw,7rem)] leading-[.86] tracking-[-.08em]">Make trust more <span className="italic text-lime-300">precise.</span></h1><p className="mt-7 max-w-md text-sm leading-relaxed text-[#9aa996] sm:text-base">Create a workspace for evidence-backed claims, selective disclosure, and the conversations that matter after the application is sent.</p><div className="mt-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-[#657564]"><span className="flex h-10 w-10 items-center justify-center border border-lime-300/20 bg-lime-300/[0.06] text-lime-300"><Fingerprint className="h-5 w-5" strokeWidth={1.5} /></span><span>Your source files stay under your control.</span></div></div><div className="border-t border-white/[0.08] pt-5 text-[10px] uppercase tracking-[0.18em] text-[#5f705f]">Proof, not exposure / 2026</div>
        </section>
        <section className="flex items-center border-t border-white/[0.08] px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-16"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .68, ease: [0.16, 1, .3, 1] }} className="w-full max-w-[560px]"><div className="mb-8"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-300">New workspace / 01</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.06em] sm:text-5xl">Start with the right context.</h2><p className="mt-3 text-sm text-[#849482]">Already have an account? <Link href="/auth/login" className="font-semibold text-lime-300 transition-colors hover:text-lime-200">Sign in instead <ArrowRight className="ml-1 inline h-3 w-3" /></Link></p></div><div className="auth-card border border-white/[0.09] bg-[#0d130f]/90 p-5 shadow-[0_28px_90px_-42px_rgba(184,242,109,.42)] backdrop-blur-xl sm:p-8"><div className="mb-7 grid gap-2 sm:grid-cols-2">{roles.map((item) => { const Icon = item.icon; const active = role === item.value; return <button key={item.value} type="button" onClick={() => setRole(item.value)} className={`flex items-start gap-3 border p-3 text-left transition-all duration-300 ${active ? "border-lime-300/35 bg-lime-300/[0.08]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"}`}><span className={`mt-0.5 flex h-8 w-8 items-center justify-center ${active ? "bg-lime-300 text-[#0b0d0c]" : "bg-white/[0.05] text-[#758874]"}`}><Icon className="h-4 w-4" /></span><span><span className={`block text-xs font-semibold ${active ? "text-lime-100" : "text-[#aebca7]"}`}>{item.label}</span><span className="mt-1 block text-[10px] leading-relaxed text-[#71806c]">{item.detail}</span></span></button> })}</div>{error && <div className="mb-5 border border-red-300/20 bg-red-300/[0.06] p-3 text-xs text-red-200">{error}</div>}<form className="space-y-4" onSubmit={handleSubmit}><div><label htmlFor="name" className="field-label">Full name</label><div className="relative"><User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647563]" /><input id="name" name="name" type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" className="field-input pl-11" /></div></div><div><label htmlFor="email" className="field-label">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647563]" /><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="field-input pl-11" /></div></div><div><label htmlFor="password" className="field-label">Password</label><div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647563]" /><input id="password" name="password" type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="field-input pl-11" /></div></div>{role === "CANDIDATE" && <div><label htmlFor="walletAddress" className="field-label">Midnight wallet address <span className="font-normal normal-case tracking-normal text-[#596857]">optional</span></label><div className="relative"><Wallet className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647563]" /><input id="walletAddress" name="walletAddress" type="text" value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} placeholder="0x..." className="field-input pl-11" /></div></div>}<button type="submit" disabled={loading} className="group mt-2 flex w-full items-center justify-between border border-lime-300/20 bg-lime-300 px-4 py-3.5 text-sm font-semibold text-[#0b0d0c] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-lime-200 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50">{loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating workspace...</span> : <span className="flex items-center gap-2">Create workspace <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></span>}<span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-60">{role === "CANDIDATE" ? "PASSPORT" : "VERIFY"}</span></button></form></div><p className="mt-5 text-center text-[10px] leading-relaxed text-[#5f705f]">No source credential is required to get started. You can add evidence when you are ready.</p></motion.div></section>
      </div>
    </div>
  )
}
