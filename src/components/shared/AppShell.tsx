"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { motion } from "motion/react"
import {
  Shield,
  Home,
  FileText,
  Zap,
  Clock,
  Settings,
  LogOut,
  Wallet,
  Search,
  ClipboardList,
  CheckSquare,
  Briefcase,
  Menu,
  X,
  Sparkles,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const studentNav: NavItem[] = [
  { name: "Dashboard", href: "/student-dashboard", icon: Home },
  { name: "My Credentials", href: "/credentials", icon: FileText },
  { name: "Privacy Passport", href: "/passport", icon: Shield },
  { name: "Generate Proof", href: "/proofs/generate", icon: Zap },
  { name: "Proof History", href: "/proofs", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
]

const recruiterNav: NavItem[] = [
  { name: "Dashboard", href: "/recruiter-dashboard", icon: Home },
  { name: "Verify Candidate", href: "/verify", icon: Search },
  { name: "My Requirements", href: "/requirements", icon: CheckSquare },
  { name: "Verification Ledger", href: "/ledger", icon: ClipboardList },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppShell({
  role,
  children,
}: {
  role: "STUDENT" | "RECRUITER"
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = role === "STUDENT" ? studentNav : recruiterNav
  const roleLabel = role === "STUDENT" ? "Student Area" : "Recruiter Portal"

  const sidebarContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  }

  const sidebarItem = {
    hidden: { opacity: 0, x: -14 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] as const } },
  }

  const Sidebar = (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarContainer}
      className="flex h-full flex-col"
    >
      {/* Brand */}
      <motion.div variants={sidebarItem} className="flex items-center gap-3 px-4 pt-6 pb-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-emerald-500/40 blur-lg opacity-60" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 shadow-glow-emerald">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <span className="block text-base font-bold tracking-tight text-white">
            ProofShield
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
            Proof, not exposure
          </span>
        </div>
      </motion.div>

      {/* Section label */}
      <motion.div variants={sidebarItem} className="px-6 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Menu
        </span>
      </motion.div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href === "/proofs" && pathname.startsWith("/proofs"))

          return (
            <motion.div key={item.name} variants={sidebarItem}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/15 to-transparent text-emerald-300"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-400 shadow-glow-emerald"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                {item.name}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom */}
      <motion.div variants={sidebarItem} className="space-y-3 border-t border-slate-800/60 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-slate-800/60 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-violet-400/20">
            <Briefcase className="h-4 w-4 text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">
              {session?.user?.name || roleLabel}
            </p>
            <p className="truncate text-[10px] text-slate-500">
              {session?.user?.email || "Signed in"}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#070b16] text-slate-100 selection:bg-emerald-500/20">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.07] bg-[#0a0f1e]/90 shadow-[18px_0_60px_-44px_rgba(16,185,129,0.45)] backdrop-blur-xl lg:block">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-slate-800 bg-[#0a0f1e] shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="glass-nav sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-4 shadow-[0_14px_36px_-30px_rgba(0,0,0,0.75)] sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <Sparkles className="h-4 w-4 text-emerald-400/70" />
              <span className="text-sm font-medium text-slate-400">{roleLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-1.5 sm:flex">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Midnight · Connected</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-glow-emerald" />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-bold uppercase text-slate-200">
              {(session?.user?.name || roleLabel).charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="relative flex-1">
          {/* Ambient background glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.06),transparent_70%)]" />
          <div className="relative p-4 sm:p-8 xl:p-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
