"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowUpRight,
  Bell,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Clock3,
  FileText,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  Wallet,
  X,
  Zap,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  hint?: string
}

const studentNav: NavItem[] = [
  { name: "Dashboard", href: "/student-dashboard", icon: Home, hint: "Overview" },
  { name: "My Credentials", href: "/credentials", icon: FileText, hint: "Add and review" },
  { name: "Privacy Passport", href: "/passport", icon: Shield, hint: "Visibility control" },
  { name: "Generate Proof", href: "/proofs/generate", icon: Zap, hint: "Create receipt" },
  { name: "Proof History", href: "/proofs", icon: Clock3, hint: "Past receipts" },
  { name: "Settings", href: "/settings", icon: Settings, hint: "Preferences" },
]

const recruiterNav: NavItem[] = [
  { name: "Dashboard", href: "/recruiter-dashboard", icon: Home, hint: "Overview" },
  { name: "Verify Candidate", href: "/verify", icon: Search, hint: "Check a receipt" },
  { name: "My Requirements", href: "/requirements", icon: CheckSquare, hint: "Role criteria" },
  { name: "Verification Ledger", href: "/ledger", icon: ClipboardList, hint: "Audit trail" },
  { name: "Settings", href: "/settings", icon: Settings, hint: "Preferences" },
]

const easing = [0.16, 1, 0.3, 1] as const

export function AppShell({ role, children }: { role: "STUDENT" | "RECRUITER"; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const nav = role === "STUDENT" ? studentNav : recruiterNav
  const roleLabel = role === "STUDENT" ? "Student workspace" : "Recruiter workspace"
  const displayName = session?.user?.name || (role === "STUDENT" ? "Your workspace" : "Recruiter portal")
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  const commandItems = useMemo(() => nav.filter((item) => item.href !== "/settings"), [nav])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault()
        setCommandOpen(true)
      }
      if (event.key === "Escape") {
        setCommandOpen(false)
        setProfileOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const isActive = (href: string) => pathname === href || (href === "/proofs" && pathname.startsWith("/proofs"))
  const go = (href: string) => {
    setCommandOpen(false)
    setMobileOpen(false)
    router.push(href)
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <motion.div initial="hidden" animate="visible" className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-8 pt-6">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-lime-300/25 bg-lime-300/[0.08] shadow-[0_0_30px_-14px_rgba(184,242,109,.7)]">
            <span className="absolute inset-[6px] rounded-xl border border-lime-200/15" />
            <Shield className="relative h-5 w-5 text-lime-200" strokeWidth={1.7} />
          </span>
          <span><span className="block text-base font-semibold tracking-[-0.04em] text-[#f4f1e9]">Proof<span className="text-lime-300">Shield</span></span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#73836f]">Private proof OS</span></span>
        </Link>
        {mobile && <button type="button" onClick={() => setMobileOpen(false)} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white" aria-label="Close menu"><X className="h-4 w-4" /></button>}
      </div>
      <div className="px-5 pb-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#60705e]">Navigate</div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)} className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-300 ${active ? "bg-lime-300/[0.09] text-lime-200" : "text-[#879481] hover:bg-white/[0.04] hover:text-[#f4f1e9]"}`}>
            {active && <motion.span layoutId="workspace-active" className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-r-full bg-lime-300" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${active ? "border-lime-300/20 bg-lime-300/[0.08]" : "border-white/[0.06] bg-white/[0.025] group-hover:border-white/15"}`}><Icon className={`h-4 w-4 ${active ? "text-lime-300" : "text-[#657463] group-hover:text-[#b7c4ae]"}`} /></span>
            <span className="min-w-0"><span className="block text-sm font-medium">{item.name}</span><span className="mt-0.5 block text-[10px] text-[#5f6d5e]">{item.hint}</span></span>
          </Link>
        })}
      </nav>
      <div className="space-y-3 border-t border-white/[0.07] px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-3 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.06] text-xs font-semibold text-violet-200">{initials || "PS"}</div><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-200">{displayName}</p><p className="truncate text-[10px] text-[#667364]">{session?.user?.email || roleLabel}</p></div></div>
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#728170] transition hover:bg-red-400/[0.06] hover:text-red-300"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </motion.div>
  )

  return <div className="min-h-screen overflow-hidden bg-[#080b09] text-[#f4f1e9] selection:bg-lime-300/20">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-white/[0.07] bg-[#0b100d]/95 lg:block"><Sidebar /></aside>
    <AnimatePresence>{mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" /><motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ duration: 0.32, ease: easing }} className="absolute inset-y-0 left-0 w-[290px] border-r border-white/10 bg-[#0b100d]"><Sidebar mobile /></motion.aside></div>}</AnimatePresence>
    <div className="min-h-screen lg:pl-[280px]">
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#080b09]/90 px-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-white/[0.08] p-2.5 text-[#97a593] hover:text-white lg:hidden" aria-label="Open menu"><Menu className="h-4 w-4" /></button><div className="hidden items-center gap-2 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /><span className="text-xs font-medium text-[#859582]">{roleLabel}</span></div></div>
        <div className="flex items-center gap-2.5"><button type="button" onClick={() => setCommandOpen(true)} className="hidden h-10 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-xs text-[#778675] transition hover:border-white/15 hover:text-[#dce9c9] sm:flex"><Search className="h-3.5 w-3.5" /><span>Jump to a page</span><kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#657463]">⌘K</kbd></button><button type="button" onClick={() => setCommandOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-[#82917e] hover:text-white sm:hidden" aria-label="Open page search"><Search className="h-4 w-4" /></button><button type="button" className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-[#728170] hover:text-white sm:flex" aria-label="Notifications"><Bell className="h-4 w-4" /></button><div className="relative"><button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-2.5 text-xs font-semibold text-[#dce9c9]" aria-expanded={profileOpen}><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime-300/15 text-[10px] text-lime-200">{initials || "PS"}</span><span className="hidden max-w-[110px] truncate sm:block">{displayName}</span></button><AnimatePresence>{profileOpen && <motion.div initial={{ opacity: 0, y: 8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} className="absolute right-0 top-12 w-56 rounded-2xl border border-white/10 bg-[#111813] p-2 shadow-2xl"><div className="border-b border-white/[0.07] px-3 py-2.5"><p className="text-xs font-semibold text-white">{displayName}</p><p className="mt-1 truncate text-[10px] text-[#71806c]">{session?.user?.email || "Workspace member"}</p></div><button type="button" onClick={() => { setProfileOpen(false); router.push("/settings") }} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-[#aebca7] hover:bg-white/[0.05] hover:text-white"><UserRound className="h-3.5 w-3.5" /> Account settings <ArrowUpRight className="ml-auto h-3 w-3" /></button><button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-[#aebca7] hover:bg-red-400/[0.06] hover:text-red-300"><LogOut className="h-3.5 w-3.5" /> Sign out</button></motion.div>}</AnimatePresence></div></div>
      </header>
      <main className="relative min-h-[calc(100vh-76px)]"><div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(184,242,109,.06),transparent_70%)]" /><div className="relative p-4 sm:p-8 xl:p-10">{children}</div></main>
    </div>
    <AnimatePresence>{commandOpen && <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/65 px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={() => setCommandOpen(false)}><motion.div initial={{ opacity: 0, y: -18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -18, scale: .98 }} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-[26px] border border-white/10 bg-[#111813] shadow-[0_32px_100px_-35px_rgba(184,242,109,.35)]"><div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4"><Search className="h-4 w-4 text-lime-300" /><input autoFocus placeholder="Search workspace" className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#657463]" onKeyDown={(event) => { const key = event.key.toLowerCase(); const item = commandItems.find((candidate) => candidate.name.toLowerCase().startsWith(key)); if (event.key === "Enter" && item) go(item.href) }} /><button type="button" onClick={() => setCommandOpen(false)} className="rounded-lg p-1.5 text-[#71806c] hover:text-white" aria-label="Close search"><X className="h-4 w-4" /></button></div><div className="p-3"><p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#60705e]">Quick navigation</p>{commandItems.map((item) => { const Icon = item.icon; return <button key={item.href} type="button" onClick={() => go(item.href)} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-lime-300/[0.07]"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#7d8f79] group-hover:border-lime-300/20 group-hover:text-lime-300"><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-medium text-[#dce9c9]">{item.name}</span><span className="block text-[10px] text-[#667364]">{item.hint}</span></span><ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[#526050] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-lime-300" /></button>})}</div></motion.div></div>}</AnimatePresence>
  </div>
}
