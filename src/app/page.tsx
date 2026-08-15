"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Menu,
  Network,
  ScanLine,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react"
import { editorialEase, editorialStagger, editorialStaggerItem, softSpring } from "@/lib/animations"

const navItems = [
  ["The method", "#method"],
  ["Passport", "#passport"],
  ["Why it matters", "#why-it-matters"],
] as const

const methodSteps = [
  { number: "01", label: "Source", title: "Bring the evidence", body: "A certificate, transcript, portfolio, or public GitHub project. ProofShield accepts the material you already have." },
  { number: "02", label: "Read", title: "Find the claims", body: "The system extracts concrete, reviewable statements instead of turning your history into another opaque profile." },
  { number: "03", label: "Prove", title: "Keep the source private", body: "The credential stays yours. Only the commitments needed to prove a claim move into the receipt." },
  { number: "04", label: "Share", title: "Let the result travel", body: "A recruiter gets a precise answer, not a copy of your life. You choose what the receipt reveals." },
]

const principles = [
  { icon: EyeOff, label: "Selective by default", body: "A proof starts private. Disclosure is a deliberate action, not a side effect." },
  { icon: Fingerprint, label: "Specific, not vague", body: "Claims are expressed as evidence-backed statements a reviewer can actually assess." },
  { icon: Network, label: "Built for the handoff", body: "The receipt is designed for the moment your work moves from you to someone new." },
]

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="ProofShield home">
      <span className={`relative flex h-9 w-9 items-center justify-center rounded-[11px] border ${light ? "border-[#0b0d0c]/20 bg-[#0b0d0c]/[0.06]" : "border-lime-300/25 bg-lime-300/[0.08]"}`}>
        <span className={`absolute inset-[5px] rounded-[7px] border ${light ? "border-[#0b0d0c]/15" : "border-lime-200/15"}`} />
        <Shield className={`relative h-[17px] w-[17px] ${light ? "text-[#0b0d0c]" : "text-lime-200"}`} strokeWidth={1.7} />
      </span>
      <span className={`text-[17px] font-semibold tracking-[-0.04em] ${light ? "text-[#0b0d0c]" : "text-[#f4f1e9]"}`}>Proof<span className={light ? "text-[#6c8e2b]" : "text-lime-300"}>Shield</span></span>
    </Link>
  )
}

function SectionMarker({ index, label, tone = "dark" }: { index: string; label: string; tone?: "dark" | "light" }) {
  return (
    <div className={`flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] ${tone === "light" ? "text-[#536044]" : "text-slate-500"}`}>
      <span className={`font-mono ${tone === "light" ? "text-[#6c8e2b]" : "text-lime-300/80"}`}>{index}</span>
      <span className={`h-px w-8 ${tone === "light" ? "bg-[#9aae77]" : "bg-slate-700"}`} />
      <span>{label}</span>
    </div>
  )
}

function MagneticLink({ href, children, inverse = false }: { href: string; children: React.ReactNode; inverse?: boolean }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 240, damping: 20 })
  const springY = useSpring(y, { stiffness: 240, damping: 20 })
  const handleMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * 0.12)
    y.set((event.clientY - rect.top - rect.height / 2) * 0.12)
  }
  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <Link href={href} onMouseMove={handleMove} onMouseLeave={reset} className={`group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${inverse ? "bg-[#0b0d0c] text-[#f4f1e9] hover:bg-[#1b2419]" : "bg-lime-300 text-[#0b0d0c] hover:bg-lime-200"}`}>
        <span>{children}</span>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${inverse ? "bg-[#f4f1e9]/10" : "bg-[#0b0d0c]/10"}`}><ArrowRight className="h-3.5 w-3.5" /></span>
      </Link>
    </motion.div>
  )
}

function HeroProofObject() {
  const [active, setActive] = useState([true, true, false])
  const reducedMotion = useReducedMotion()
  const objectRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: objectRef, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [reducedMotion ? 0 : -28, reducedMotion ? 0 : 28])
  const rotate = useTransform(scrollYProgress, [0, 1], [reducedMotion ? 0 : -1.2, reducedMotion ? 0 : 1.2])
  const [copied, setCopied] = useState(false)
  const toggle = (index: number) => setActive((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))
  const copyProof = async () => {
    try {
      await navigator.clipboard.writeText("ps_7d2a91f4e1c8")
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch { setCopied(false) }
  }

  return (
    <motion.div ref={objectRef} style={{ y, rotate }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...editorialEase, delay: 0.35, duration: 1 }} className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
      <div className="absolute -inset-10 rounded-[50%] bg-lime-300/[0.04] blur-[100px]" />
      <div className="relative border border-[#d6e6bd]/15 bg-[#111813] p-3 shadow-[0_32px_100px_-44px_rgba(182,242,109,0.5)] sm:p-4">
        <div className="border border-[#d6e6bd]/15 bg-[#0b100d] p-5 sm:p-7">
          <div className="mb-7 flex items-center justify-between border-b border-[#d6e6bd]/10 pb-4">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f37f6d]" /><span className="h-2 w-2 rounded-full bg-[#d2b95d]" /><span className="h-2 w-2 rounded-full bg-lime-300" /></div>
            <button type="button" onClick={copyProof} className="group flex items-center gap-2 font-mono text-[9px] tracking-[0.08em] text-[#a3b69d] transition-colors hover:text-[#f4f1e9]" title="Copy proof ID"><span>PS / 7D2A·91F4·E1C8</span>{copied ? <Check className="h-3 w-3 text-lime-300" /> : <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />}</button>
          </div>
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#71806c]">Privacy passport</p><p className="mt-2 font-serif text-[28px] leading-none tracking-[-0.04em] text-[#f4f1e9]">Candidate / A81F</p></div><div className="flex h-11 w-11 items-center justify-center border border-lime-300/25 bg-lime-300/[0.06]"><ShieldCheck className="h-5 w-5 text-lime-300" strokeWidth={1.5} /></div></div>
          <div className="space-y-2">
            {["Python proficiency ≥ Advanced", "Security+ certification", "GPA ≥ 3.50"].map((claim, index) => (
              <motion.button key={claim} type="button" onClick={() => toggle(index)} whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }} className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-colors duration-300 ${active[index] ? "border-lime-300/25 bg-lime-300/[0.055]" : "border-[#d6e6bd]/10 bg-[#d6e6bd]/[0.025]"}`}>
                <div><span className="block font-mono text-[9px] tracking-[0.12em] text-[#71806c]">CLAIM / {String(index + 1).padStart(2, "0")}</span><AnimatePresence mode="wait" initial={false}><motion.span key={active[index] ? "open" : "closed"} initial={{ opacity: 0, filter: "blur(4px)", y: 4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(4px)", y: -4 }} transition={{ duration: 0.22 }} className={`mt-1 block text-sm ${active[index] ? "text-[#e5efdc]" : "text-[#71806c]"}`}>{active[index] ? claim : "Private claim locked"}</motion.span></AnimatePresence></div>
                <AnimatePresence mode="wait" initial={false}>{active[index] ? <motion.span key="shared" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={softSpring} className="flex items-center gap-1.5 text-[10px] font-semibold text-lime-300"><Check className="h-3 w-3" /> Shared</motion.span> : <motion.span key="locked" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={softSpring} className="flex items-center gap-1.5 text-[10px] font-semibold text-[#71806c]"><LockKeyhole className="h-3 w-3" /> Locked</motion.span>}</AnimatePresence>
              </motion.button>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between border-t border-[#d6e6bd]/10 pt-4"><div className="flex items-center gap-2 text-[10px] text-[#71806c]"><ScanLine className="h-3.5 w-3.5 text-[#9aae77]" /> Commitment recorded</div><span className="font-mono text-[9px] text-[#506052]">MIDNIGHT / TESTNET</span></div>
        </div>
      </div>
      <div className="absolute -bottom-7 -left-4 flex items-center gap-3 border border-[#d6e6bd]/15 bg-[#111813] px-4 py-3 shadow-2xl sm:-left-12"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime-300 text-[#0b0d0c]"><Check className="h-4 w-4" /></span><div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71806c]">Current state</p><p className="mt-0.5 text-xs text-[#e5efdc]">Qualified / data withheld</p></div></div>
    </motion.div>
  )
}

function MethodRail() {
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-3 hidden h-[calc(100%-24px)] w-px bg-[#b8c9a3]/20 md:block" />
      <div className="space-y-10 md:space-y-0">
        {methodSteps.map((step, index) => (
          <motion.div key={step.number} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={editorialStagger} className="relative grid gap-5 md:grid-cols-[32px_150px_1fr] md:gap-8 md:py-9">
            <motion.div variants={editorialStaggerItem} className="relative z-10 flex h-8 w-8 items-center justify-center border border-[#8ba16b]/35 bg-[#111813] font-mono text-[10px] text-lime-300">{step.number}</motion.div>
            <motion.p variants={editorialStaggerItem} className="pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6d7c68]">{step.label}</motion.p>
            <motion.div variants={editorialStaggerItem} className="max-w-xl"><h3 className="font-serif text-3xl tracking-[-0.04em] text-[#f4f1e9] sm:text-4xl">{step.title}</h3><p className="mt-3 max-w-md text-sm leading-relaxed text-[#8f9e8a]">{step.body}</p></motion.div>
            {index < methodSteps.length - 1 && <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ ...editorialEase, delay: 0.3 }} className="origin-left border-b border-[#b8c9a3]/10 md:hidden" />}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroLine = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25])

  return (
    <div className="site-shell min-h-screen overflow-hidden bg-[#0b0d0c] text-[#f4f1e9]">
      <div className="site-noise pointer-events-none fixed inset-0 z-[1]" />
      <header className="site-header sticky top-0 z-50 border-b border-[#d6e6bd]/10 bg-[#0b0d0c]/85 backdrop-blur-md"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><Wordmark /><nav className="hidden items-center gap-9 md:flex">{navItems.map(([label, href]) => <a key={href} href={href} className="nav-link text-xs font-medium text-[#9eaa99]">{label}</a>)}</nav><div className="flex items-center gap-4"><Link href="/auth/login" className="hidden text-xs font-medium text-[#9eaa99] transition hover:text-[#f4f1e9] sm:block">Sign in</Link><MagneticLink href="/auth/register">Start proving</MagneticLink><button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center border border-[#d6e6bd]/15 text-[#d6e6bd] md:hidden">{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button></div></div><AnimatePresence>{mobileOpen && <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="border-t border-[#d6e6bd]/10 bg-[#0b0d0c] px-5 md:hidden">{navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block border-b border-[#d6e6bd]/10 py-4 text-sm text-[#b6c1af]">{label}</a>)}<Link href="/auth/login" className="block py-4 text-sm text-lime-300">Sign in</Link></motion.nav>}</AnimatePresence></header>

      <main className="relative z-10">
        <motion.section ref={heroRef} style={{ opacity: heroOpacity }} className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-[1440px] items-center gap-20 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-12 lg:py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d6e6bd]/[0.04] lg:block" /><motion.div style={{ y: heroLine }} className="pointer-events-none absolute left-[7%] top-[14%] hidden h-36 w-px origin-top bg-gradient-to-b from-transparent via-lime-300/60 to-transparent lg:block" />
          <motion.div variants={editorialStagger} initial="hidden" animate="visible" className="relative max-w-[680px]"><motion.div variants={editorialStaggerItem}><SectionMarker index="00" label="Private credentials / public confidence" /></motion.div><motion.h1 variants={editorialStaggerItem} className="mt-8 max-w-3xl text-balance font-serif text-[clamp(3.6rem,8vw,7.8rem)] leading-[0.89] tracking-[-0.075em] text-[#f4f1e9]">Proof, <span className="italic text-lime-300">not</span><br />exposure.</motion.h1><motion.p variants={editorialStaggerItem} className="mt-8 max-w-lg text-base leading-relaxed text-[#9eaa99] sm:text-lg">A quieter way to prove what you know. ProofShield turns credentials into precise, verifiable claims without asking you to hand over the whole story.</motion.p><motion.div variants={editorialStaggerItem} className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"><MagneticLink href="/auth/register">Create your passport</MagneticLink><a href="#method" className="editorial-link group inline-flex items-center gap-2 text-sm text-[#aab8a1]">See how it works <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1 group-hover:translate-x-1" /></a></motion.div><motion.div variants={editorialStaggerItem} className="mt-16 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#647262]"><span className="h-px w-12 bg-[#71806c]" /> Your source files never become the product</motion.div></motion.div><HeroProofObject />
        </motion.section>

        <section className="border-y border-[#d6e6bd]/10 bg-[#dce9c9] text-[#0b0d0c]"><div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12"><p className="max-w-md font-serif text-xl leading-tight tracking-[-0.03em] sm:text-2xl">The best proof is the proof that leaves your private life out of it.</p><div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#54624b]"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#6c8e2b]" /> Zero-knowledge by design</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#6c8e2b]" /> Human-readable receipts</span></div></div></section>

        <section id="method" className="mx-auto max-w-[1440px] px-5 py-28 sm:px-8 lg:px-12 lg:py-40"><div className="grid gap-20 lg:grid-cols-[0.32fr_0.68fr]"><div className="lg:sticky lg:top-32 lg:self-start"><SectionMarker index="01" label="The method" /><h2 className="mt-8 max-w-sm font-serif text-5xl leading-[0.95] tracking-[-0.06em] text-[#f4f1e9] sm:text-6xl">A proof is a conversation, not a file dump.</h2><p className="mt-6 max-w-xs text-sm leading-relaxed text-[#879481]">Every step is designed around the handoff: from your source material to a person deciding whether to trust the result.</p></div><MethodRail /></div></section>

        <section id="passport" className="relative overflow-hidden bg-[#dce9c9] text-[#0b0d0c]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,.55),transparent_32%)]" /><div className="relative mx-auto grid max-w-[1440px] gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:py-36"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={editorialStagger}><motion.div variants={editorialStaggerItem}><SectionMarker index="02" label="The passport" tone="light" /></motion.div><motion.h2 variants={editorialStaggerItem} className="mt-8 max-w-xl font-serif text-5xl leading-[0.94] tracking-[-0.065em] sm:text-7xl">Make privacy a part of the interface.</motion.h2><motion.p variants={editorialStaggerItem} className="mt-6 max-w-md text-sm leading-relaxed text-[#586751] sm:text-base">A Privacy Passport gives your achievements somewhere to live without forcing your identity into every room they enter.</motion.p><motion.div variants={editorialStaggerItem} className="mt-9"><Link href="/auth/register" className="group inline-flex items-center gap-3 text-sm font-semibold text-[#283323]">Build a passport <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#7b9360] transition-transform duration-300 group-hover:rotate-45"><ArrowRight className="h-3.5 w-3.5" /></span></Link></motion.div></motion.div><motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={editorialEase} className="relative"><div className="absolute -inset-8 rounded-full bg-white/35 blur-3xl" /><div className="relative ml-auto max-w-xl border border-[#9aae77] bg-[#f4f1e9] p-5 shadow-[20px_24px_0_0_rgba(27,46,21,0.1)] sm:p-8"><div className="flex items-start justify-between border-b border-[#aebc9b] pb-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71806c]">Passport / A81F</p><p className="mt-4 font-serif text-3xl tracking-[-0.04em] text-[#0b0d0c]">Proof of capability</p></div><ShieldCheck className="h-7 w-7 text-[#6c8e2b]" strokeWidth={1.4} /></div><div className="grid gap-4 py-7 sm:grid-cols-2"><div className="border border-[#bec9b0] p-4"><p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#798974]">Source</p><p className="mt-2 text-sm font-medium text-[#263323]">CompTIA Security+</p><p className="mt-5 text-[10px] text-[#687965]">Original credential / private</p></div><div className="border border-[#bec9b0] bg-[#edf3e6] p-4"><p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#798974]">Claim available</p><p className="mt-2 text-sm font-medium text-[#263323]">Certification verified</p><p className="mt-5 flex items-center gap-1.5 text-[10px] font-semibold text-[#6c8e2b]"><CheckCircle2 className="h-3.5 w-3.5" /> Ready to prove</p></div></div><div className="flex items-center justify-between border-t border-[#aebc9b] pt-4 text-[10px] text-[#71806c]"><span>Disclosure control / 03 claims</span><span className="font-mono">0x8F2A…9E1C</span></div></div></motion.div></div></section>

        <section id="why-it-matters" className="mx-auto max-w-[1440px] px-5 py-28 sm:px-8 lg:px-12 lg:py-40"><div className="grid gap-16 lg:grid-cols-[0.48fr_0.52fr]"><div><SectionMarker index="03" label="Why it matters" /><h2 className="mt-8 max-w-xl font-serif text-5xl leading-[0.95] tracking-[-0.06em] text-[#f4f1e9] sm:text-7xl">More signal.<br /><span className="italic text-lime-300">Less exposure.</span></h2><p className="mt-7 max-w-md text-base leading-relaxed text-[#879481]">The internet is already full of resumes. ProofShield is for the moment when a claim needs to become trusted without becoming invasive.</p></div><div className="divide-y divide-[#d6e6bd]/10 border-y border-[#d6e6bd]/10">{principles.map((principle, index) => { const Icon = principle.icon; return <motion.div key={principle.label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ ...editorialEase, delay: index * 0.08 }} className="group grid gap-6 py-8 sm:grid-cols-[52px_1fr] sm:items-start"><div className="flex h-11 w-11 items-center justify-center border border-[#d6e6bd]/15 text-lime-300 transition-colors duration-300 group-hover:border-lime-300/45 group-hover:bg-lime-300/[0.06]"><Icon className="h-5 w-5" strokeWidth={1.5} /></div><div><h3 className="font-serif text-2xl tracking-[-0.035em] text-[#f4f1e9]">{principle.label}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-[#879481]">{principle.body}</p></div></motion.div> })}</div></div></section>

        <section className="mx-auto max-w-[1440px] px-5 pb-28 sm:px-8 lg:px-12 lg:pb-40"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={editorialStagger} className="relative overflow-hidden border border-[#d6e6bd]/15 bg-[#131a13] px-6 py-16 sm:px-12 lg:px-20 lg:py-24"><div className="absolute right-[-8%] top-[-45%] h-[520px] w-[520px] rounded-full border border-lime-300/[0.08]" /><div className="absolute right-[6%] top-[-18%] h-[300px] w-[300px] rounded-full border border-lime-300/[0.08]" /><div className="relative max-w-3xl"><motion.div variants={editorialStaggerItem}><SectionMarker index="04" label="Begin here" /></motion.div><motion.h2 variants={editorialStaggerItem} className="mt-8 max-w-2xl font-serif text-5xl leading-[0.95] tracking-[-0.065em] text-[#f4f1e9] sm:text-7xl">Let your work speak for itself.</motion.h2><motion.p variants={editorialStaggerItem} className="mt-6 max-w-lg text-base leading-relaxed text-[#9eaa99]">Create a passport, bring one piece of evidence, and decide exactly what the world gets to know.</motion.p><motion.div variants={editorialStaggerItem} className="mt-9"><MagneticLink href="/auth/register">Start with one credential</MagneticLink></motion.div></div></motion.div></section>
      </main>

      <footer className="border-t border-[#d6e6bd]/10 bg-[#080a09]"><div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12"><Wordmark /><div className="flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#71806c]"><a href="#method" className="transition-colors hover:text-[#d6e6bd]">The method</a><a href="#passport" className="transition-colors hover:text-[#d6e6bd]">Passport</a><a href="#why-it-matters" className="transition-colors hover:text-[#d6e6bd]">Why it matters</a><Link href="/auth/login" className="transition-colors hover:text-[#d6e6bd]">Sign in</Link></div><p className="text-[10px] uppercase tracking-[0.16em] text-[#4c5a4b]">Proof, not exposure / {new Date().getFullYear()}</p></div></footer>
    </div>
  )
}
