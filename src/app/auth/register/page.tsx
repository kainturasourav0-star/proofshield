"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  User,
  Lock,
  Mail,
  Wallet,
  Loader2,
  ArrowRight,
  GraduationCap,
  Briefcase,
} from "lucide-react"
import { motion } from "motion/react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. Create account
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          walletAddress: walletAddress || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // 2. Sign in automatically
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/dashboard",
      })

      if (result?.error) {
        setError("Account created, but automatic sign in failed. Please sign in manually.")
      } else {
        router.refresh()
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "block w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 text-sm transition-all"

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#070b16] py-12 sm:px-6 lg:px-8 selection:bg-emerald-500/30">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern bg-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_60%,transparent_100%)]" />
        <div className="absolute -top-32 left-1/2 h-[440px] w-[640px] -translate-x-1/2 rounded-full bg-emerald-500/[0.09] blur-[120px] animate-aurora" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-violet-600/[0.08] blur-[120px] animate-aurora [animation-delay:-6s]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="mb-8 inline-flex w-full items-center justify-center gap-3 hover:opacity-90 transition-opacity">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/40 blur-md opacity-50" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Proof<span className="text-gradient-emerald">Shield</span>
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="border-t-accent relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 shadow-card-dark backdrop-blur-xl sm:px-10">
          {/* Role selector tabs */}
          <div className="mb-7 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 p-1.5">
            {(
              [
                { value: "CANDIDATE", label: "Candidate", icon: GraduationCap },
                { value: "RECRUITER", label: "Recruiter", icon: Briefcase },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon
              const active = role === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setRole(tab.value)}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-glow-emerald"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="animate-fade-in rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 chars)"
                  className={inputClass}
                />
              </div>
            </div>

            {role === "CANDIDATE" && (
              <div>
                <label htmlFor="walletAddress" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Midnight Wallet Address (Optional)
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Wallet className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="walletAddress"
                    name="walletAddress"
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:shadow-[0_0_36px_rgba(16,185,129,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  <>
                    Register <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
