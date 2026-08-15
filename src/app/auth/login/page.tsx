"use client"

import React, { Suspense, useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  Check,
  Copy,
  Fingerprint,
  Globe2,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

const DEMO_ACCOUNTS = {
  CANDIDATE: { role: "CANDIDATE" as const, label: "Candidate", email: "demo@proofshield.io", password: "demo1234", tone: "lime" as const },
  RECRUITER: { role: "RECRUITER" as const, label: "Recruiter", email: "recruiter@testcompany.io", password: "recruiter1234", tone: "violet" as const },
}

type Role = keyof typeof DEMO_ACCOUNTS

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080b09]" />}>
      <LoginForm />
    </Suspense>
  )
}

function ProofSignal() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative mx-auto mt-10 aspect-square w-full max-w-[470px] lg:mt-0">
      <motion.div
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={reducedMotion ? undefined : { duration: 34, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[9%] rounded-full border border-lime-300/15"
      />
      <motion.div
        animate={reducedMotion ? undefined : { rotate: -360 }}
        transition={reducedMotion ? undefined : { duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[19%] rounded-full border border-dashed border-lime-300/15"
      />
      <div className="absolute inset-[30%] rounded-full border border-lime-300/20 bg-lime-300/[0.04] shadow-[0_0_90px_-28px_rgba(184,242,109,.75)]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-[34%] flex flex-col items-center justify-center border border-lime-300/25 bg-[#101710] text-center"
      >
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/[0.08] text-lime-200">
          <Fingerprint className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#778875]">ProofShield / 01</span>
        <span className="mt-2 font-serif text-2xl tracking-[-0.05em] text-[#f4f1e9]">Identity, held lightly.</span>
      </motion.div>
      <div className="absolute left-[3%] top-[25%] flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#758874]"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Source stays private</div>
      <div className="absolute bottom-[18%] right-[2%] flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#758874]"><span className="h-1.5 w-1.5 rounded-full bg-violet-300" /> Claim becomes portable</div>
      <div className="auth-orbit-dot absolute left-[18%] top-[15%] h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(184,242,109,.8)]" />
      <div className="auth-orbit-dot absolute bottom-[12%] left-[27%] h-1.5 w-1.5 rounded-full bg-violet-300" />
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reducedMotion = useReducedMotion()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("CANDIDATE")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [copied, setCopied] = useState<Role | null>(null)

  useEffect(() => {
    const demo = searchParams.get("demo")
    if (searchParams.get("recruiter") === "true" || demo === "recruiter") {
      setRole("RECRUITER")
      if (demo === "recruiter") {
        setEmail(DEMO_ACCOUNTS.RECRUITER.email)
        setPassword(DEMO_ACCOUNTS.RECRUITER.password)
        setNotice("Recruiter demo loaded — ready when you are.")
      }
    } else if (demo === "candidate") {
      setRole("CANDIDATE")
      setEmail(DEMO_ACCOUNTS.CANDIDATE.email)
      setPassword(DEMO_ACCOUNTS.CANDIDATE.password)
      setNotice("Candidate demo loaded — ready when you are.")
    }
  }, [searchParams])

  const loadDemo = (account: (typeof DEMO_ACCOUNTS)[Role]) => {
    setRole(account.role)
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
    setNotice(`${account.label} demo loaded — ready when you are.`)
  }

  const launchDemo = async (account: (typeof DEMO_ACCOUNTS)[Role]) => {
    loadDemo(account)
    setDemoLoading(account.role)
    setError(null)
    try {
      const result = await signIn("credentials", { redirect: false, email: account.email, password: account.password, callbackUrl: "/dashboard" })
      if (result?.error) setError("The demo account is unavailable right now. Try the regular sign-in.")
      else { router.refresh(); router.push("/dashboard") }
    } catch { setError("The demo could not start. Please try again.") }
    finally { setDemoLoading(null) }
  }

  const copyDemo = async (account: (typeof DEMO_ACCOUNTS)[Role]) => {
    try {
      await navigator.clipboard.writeText(`${account.email}\n${account.password}`)
      setCopied(account.role)
      window.setTimeout(() => setCopied(null), 1600)
    } catch { setNotice("Copy is unavailable in this browser. Use the credentials shown.") }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)
    try {
      const result = await signIn("credentials", { redirect: false, email, password, callbackUrl: "/dashboard" })
      if (result?.error) setError("Invalid email or password")
      else { router.refresh(); router.push("/dashboard") }
    } catch { setError("An unexpected error occurred. Please try again.") }
    finally { setLoading(false) }
  }

  const activeAccount = DEMO_ACCOUNTS[role]
  const inputClass = "field-input pl-11"

  return (
    <div className="auth-page relative min-h-screen overflow-hidden bg-[#080b09] text-[#f4f1e9] selection:bg-lime-300/20">
      <div className="auth-grid pointer-events-none absolute inset-0" />
      <div className="auth-noise pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-32 top-20 h-[460px] w-[460px] rounded-full bg-lime-300/[0.06] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-100px] h-[500px] w-[500px] rounded-full bg-violet-400/[0.05] blur-[140px]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1560px] lg:grid-cols-[1.05fr_.95fr]">
        <section className="flex flex-col px-6 pb-10 pt-7 sm:px-10 lg:px-16 lg:py-10">
          <Link href="/" className="group inline-flex w-fit items-center gap-3" aria-label="ProofShield home">
            <span className="relative flex h-10 w-10 items-center justify-center border border-lime-300/25 bg-lime-300/[0.08] transition-transform duration-500 group-hover:rotate-[-8deg]">
              <span className="absolute inset-[6px] border border-lime-200/15" />
              <Shield className="relative h-5 w-5 text-lime-200" strokeWidth={1.6} />
            </span>
            <span className="text-lg font-semibold tracking-[-0.05em]">Proof<span className="text-lime-300">Shield</span></span>
          </Link>

          <div className="my-auto grid gap-10 py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-12">
            <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } } }} className="max-w-xl">
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: .65, ease: [0.16, 1, .3, 1] } } }} className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#73836f]"><span className="font-mono text-lime-300">00</span><span className="h-px w-8 bg-lime-300/40" /> Private proof infrastructure</motion.div>
              <motion.h1 variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: .78, ease: [0.16, 1, .3, 1] } } }} className="mt-7 max-w-xl font-serif text-[clamp(3.6rem,7vw,6.7rem)] leading-[.88] tracking-[-.075em]">Welcome to the <span className="italic text-lime-300">quiet</span> side of trust.</motion.h1>
              <motion.p variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: .7, ease: [0.16, 1, .3, 1] } } }} className="mt-7 max-w-md text-sm leading-relaxed text-[#9aa996] sm:text-base">Sign in to turn credentials into selective, verifiable claims — without turning your whole story into a data product.</motion.p>
              <motion.div variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: .7, ease: [0.16, 1, .3, 1] } } }} className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#697a68]"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Selective disclosure</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-violet-300" /> Human-readable receipts</span></motion.div>
            </motion.div>
            <ProofSignal />
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.08] pt-5 text-[10px] uppercase tracking-[0.18em] text-[#5f705f]"><span className="flex items-center gap-2"><Globe2 className="h-3.5 w-3.5 text-lime-300/70" /> Midnight testnet ready</span><span className="hidden sm:inline">Proof, not exposure / 2026</span></div>
        </section>

        <section className="relative flex items-center border-t border-white/[0.08] px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-16">
          <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .14, ease: [0.16, 1, .3, 1] }} className="w-full max-w-[520px]">
            <div className="mb-8 flex items-start justify-between gap-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime-300">Secure access / 02</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.06em] sm:text-5xl">Enter your workspace.</h2><p className="mt-3 text-sm text-[#849482]">New to ProofShield? <Link href="/auth/register" className="font-semibold text-lime-300 transition-colors hover:text-lime-200">Create an account <ArrowRight className="ml-1 inline h-3 w-3" /></Link></p></div><div className="hidden h-12 w-12 items-center justify-center border border-lime-300/20 bg-lime-300/[0.06] text-lime-300 sm:flex"><Lock className="h-5 w-5" strokeWidth={1.5} /></div></div>
            <div className="auth-card border border-white/[0.09] bg-[#0d130f]/90 p-5 shadow-[0_28px_90px_-42px_rgba(184,242,109,.42)] backdrop-blur-xl sm:p-8">
              <div className="mb-7 flex items-center justify-between border-b border-white/[0.08] pb-4"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#647563]">Choose a door</span><span className="flex items-center gap-2 font-mono text-[9px] text-[#637461]"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Encrypted session</span></div>
              <div className="relative mb-7 grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.08] bg-black/20 p-1.5">
                {(["CANDIDATE", "RECRUITER"] as Role[]).map((value) => { const account = DEMO_ACCOUNTS[value]; const active = role === value; const Icon = value === "CANDIDATE" ? GraduationCap : Briefcase; return <button key={value} type="button" onClick={() => { setRole(value); setNotice(null) }} className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-colors ${active ? "text-[#0b0d0c]" : "text-[#849482] hover:text-[#dce9c9]"}`}><span className="relative z-10 flex items-center gap-2"><Icon className="h-4 w-4" /> {account.label}</span>{active && <motion.span layoutId="auth-role-pill" transition={{ type: "spring", stiffness: 360, damping: 28 }} className="absolute inset-0 rounded-xl bg-lime-300" />}</button> })}
              </div>

              <AnimatePresence mode="wait" initial={false}>{(error || notice) && <motion.div key={error || notice} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className={`mb-5 flex items-start gap-2 border p-3 text-xs ${error ? "border-red-300/20 bg-red-300/[0.06] text-red-200" : "border-lime-300/20 bg-lime-300/[0.06] text-lime-100"}`}><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error || notice}</motion.div>}</AnimatePresence>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div><label htmlFor="email" className="field-label">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647563]" /><input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" className={inputClass} /></div></div>
                <div><label htmlFor="password" className="field-label">Password</label><div className="relative"><Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#647563]" /><input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className={inputClass} /></div></div>
                <button type="submit" disabled={loading || Boolean(demoLoading)} className="group flex w-full items-center justify-between border border-lime-300/20 bg-lime-300 px-4 py-3.5 text-sm font-semibold text-[#0b0d0c] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-lime-200 active:translate-y-0 active:scale-[.99] disabled:pointer-events-none disabled:opacity-50"><span className="flex items-center gap-2">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign in securely <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></>}</span><span className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-60">{activeAccount.label}</span></button>
              </form>

              <div className="mt-8 border-t border-white/[0.08] pt-6"><div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#667765]"><KeyRound className="h-3 w-3 text-lime-300" /> Instant demo access</span><span className="font-mono text-[9px] text-[#596857]">NO SETUP</span></div><div className="grid gap-3 sm:grid-cols-2">{(Object.values(DEMO_ACCOUNTS)).map((account) => <div key={account.role} className={`demo-card group border p-3 ${account.tone === "lime" ? "border-lime-300/15 bg-lime-300/[0.035]" : "border-violet-300/15 bg-violet-300/[0.035]"}`}><div className="flex items-center justify-between"><p className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${account.tone === "lime" ? "text-lime-300" : "text-violet-200"}`}>{account.role === "CANDIDATE" ? <GraduationCap className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />} {account.label}</p><button type="button" onClick={() => copyDemo(account)} className="text-[#6e7d6d] transition-colors hover:text-white" aria-label={`Copy ${account.label} demo credentials`}>{copied === account.role ? <Check className="h-3.5 w-3.5 text-lime-300" /> : <Copy className="h-3.5 w-3.5" />}</button></div><p className="mt-2 truncate font-mono text-[10px] text-[#dce9c9]">{account.email}</p><p className="mt-1 font-mono text-[10px] text-[#728170]">{account.password}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => loadDemo(account)} className="flex-1 border border-white/[0.08] px-2 py-2 text-[10px] font-semibold text-[#aebca7] transition-colors hover:border-white/20 hover:text-white">Use details</button><button type="button" onClick={() => launchDemo(account)} disabled={Boolean(demoLoading)} className="flex items-center justify-center gap-1 border border-lime-300/20 bg-lime-300/[0.09] px-2 py-2 text-[10px] font-semibold text-lime-200 transition-colors hover:bg-lime-300/15 disabled:opacity-50">{demoLoading === account.role ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />} Launch</button></div></div>)}</div></div>
            </div>
            <p className="mt-5 text-center text-[10px] leading-relaxed text-[#5f705f]">By continuing, you agree to keep source credentials under your control. ProofShield only shares the claims you choose.</p>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
