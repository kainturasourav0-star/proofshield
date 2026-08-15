# UI & UX Design Specification — ProofShield
## Motion Dev Animation Guide + Design System

---

## 1. Design Philosophy

**Theme:** Dark, cryptographic, trustworthy. Not "blockchain bro" — think more *intelligence agency meets modern SaaS*.

**Mood Board keywords:** Dark mode · Teal/emerald accents · Glowing proof elements · Clean sans-serif type · Monospace for hashes/proofs · Smooth reveals · Privacy-first visual language.

**Core UX principle:** Every animation should reinforce the privacy metaphor:
- **Locking** = hiding private data (slide in + blur + lock icon)
- **Unlocking/proving** = reveal (glow pulse + slide out from shield)
- **Blockchain confirmation** = progress pulse (chain links lighting up)
- **Verification** = satisfying pop + checkmark bloom

---

## 2. Color System

```css
/* globals.css */
:root {
  /* Backgrounds */
  --bg-base:         #0a0f1e;   /* near-black with navy tint */
  --bg-surface:      #111827;   /* card backgrounds */
  --bg-elevated:     #1f2937;   /* modals, dropdowns */
  --bg-hover:        #263040;

  /* Brand Colors */
  --brand-primary:   #10b981;   /* emerald-500 — proof/verified */
  --brand-glow:      #34d399;   /* emerald-400 — highlights */
  --brand-purple:    #8b5cf6;   /* violet-500 — ZK/blockchain */
  --brand-blue:      #3b82f6;   /* blue-500 — Midnight Network */

  /* Status */
  --status-verified: #10b981;   /* green */
  --status-private:  #6b7280;   /* gray — locked */
  --status-pending:  #f59e0b;   /* amber */
  --status-failed:   #ef4444;   /* red */

  /* Text */
  --text-primary:    #f9fafb;
  --text-secondary:  #9ca3af;
  --text-muted:      #4b5563;
  --text-code:       #a5f3fc;   /* cyan for hashes */

  /* Borders */
  --border-base:     rgba(255,255,255,0.08);
  --border-brand:    rgba(16,185,129,0.3);
  --border-purple:   rgba(139,92,246,0.3);

  /* Glows */
  --glow-green:      0 0 20px rgba(16,185,129,0.4);
  --glow-purple:     0 0 20px rgba(139,92,246,0.4);
  --glow-blue:       0 0 20px rgba(59,130,246,0.3);
}
```

---

## 3. Typography

```css
/* Font Stack */
--font-sans:  'Inter', system-ui, sans-serif;         /* UI text */
--font-mono:  'JetBrains Mono', 'Fira Code', monospace; /* Hashes, proof IDs */
--font-display: 'Cal Sans', 'Inter', sans-serif;       /* Hero headlines */

/* Scale */
--text-xs:    0.75rem;   /* 12px — labels */
--text-sm:    0.875rem;  /* 14px — secondary */
--text-base:  1rem;      /* 16px — body */
--text-lg:    1.125rem;  /* 18px — emphasis */
--text-xl:    1.25rem;   /* 20px — card titles */
--text-2xl:   1.5rem;    /* 24px — section heads */
--text-4xl:   2.25rem;   /* 36px — page titles */
--text-6xl:   3.75rem;   /* 60px — hero */
```

---

## 4. Motion Dev Animation System

### Install
```bash
npm install motion
```

### 4.1 Animation Tokens (reuse these everywhere)

```typescript
// src/lib/animations.ts
import type { Variants, Transition } from 'motion/react';

// ─── Transitions ──────────────────────────────────────
export const spring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
};

export const easeOut: Transition = {
  duration: 0.4,
  ease: [0.0, 0.0, 0.2, 1],
};

export const easeInOut: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};

// ─── Page & Section Variants ──────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeOut },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: springGentle },
  exit:    { opacity: 0, x: 40, transition: { duration: 0.2 } },
};

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: springGentle },
};

// ─── Stagger Container ────────────────────────────────
export const stagger: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

// ─── Proof / ZK Specific ──────────────────────────────
export const glowPulse: Variants = {
  idle:   { boxShadow: '0 0 0px rgba(16,185,129,0)' },
  glow:   {
    boxShadow: [
      '0 0 0px rgba(16,185,129,0)',
      '0 0 30px rgba(16,185,129,0.6)',
      '0 0 10px rgba(16,185,129,0.3)',
    ],
    transition: { duration: 1.5, ease: 'easeInOut' },
  },
};

export const lockAnimation: Variants = {
  unlocked: { rotate: 0,   opacity: 1 },
  locking:  { rotate: -10, opacity: 0.5, transition: { duration: 0.15 } },
  locked:   { rotate: 0,   opacity: 1,   transition: spring },
};

export const checkmarkDraw: Variants = {
  hidden:  { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 0.5, ease: 'easeOut' }, opacity: { duration: 0.1 } },
  },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: spring },
  exit:    { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};
```

---

## 5. Page-by-Page Animation Specs

### 5.1 Landing Page

```tsx
// src/app/page.tsx
'use client';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { stagger, staggerItem, fadeUp, glowPulse } from '@/lib/animations';
import { useRef } from 'react';

// ── HERO SECTION ──────────────────────────────────────
// Animation: Words cascade in from bottom, one by one
// "Prove you're qualified. Reveal nothing."

function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* Background: Animated grid + radial glow */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="text-center relative z-10 max-w-5xl mx-auto px-6"
      >
        {/* Badge */}
        <motion.div variants={staggerItem} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
            🔐 Built on Midnight Network · Powered by ZK Proofs
          </span>
        </motion.div>

        {/* Headline — each word animates separately */}
        <motion.h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-none">
          {['Prove', "you're", 'qualified.'].map((word, i) => (
            <motion.span
              key={i}
              variants={staggerItem}
              className="inline-block mr-4"
            >
              {word}
            </motion.span>
          ))}
          <br />
          {['Reveal', 'nothing.'].map((word, i) => (
            <motion.span
              key={i}
              variants={staggerItem}
              className={`inline-block mr-4 ${i === 1 ? 'text-emerald-400' : ''}`}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={staggerItem} className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          ProofShield uses Zero-Knowledge Proofs on Midnight to let you prove skills,
          certifications, and experience — without exposing your personal data.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={staggerItem} className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-lg"
          >
            Start Proving
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-lg"
          >
            Verify a Candidate
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── HOW IT WORKS SECTION ──────────────────────────────
// Animation: Flow diagram that draws itself on scroll

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    { icon: '📄', title: 'Upload Credentials', desc: 'Certificates, transcripts, GitHub — AI analyzes them all' },
    { icon: '🤖', title: 'AI Extracts Claims', desc: 'Python ≥ Intermediate, Cybersecurity ≥ Advanced, etc.' },
    { icon: '🔐', title: 'Generate ZK Proof', desc: 'Cryptographic proof created — your data never leaves your device' },
    { icon: '⛓️', title: 'Midnight Records It', desc: 'Proof hash recorded on Midnight blockchain permanently' },
    { icon: '✅', title: 'Recruiter Verifies', desc: 'QUALIFIED / NOT QUALIFIED — no personal data disclosed' },
  ];

  return (
    <section ref={ref} className="py-32 px-6">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="text-4xl font-bold text-white text-center mb-20"
      >
        How ProofShield Works
      </motion.h2>

      <div className="max-w-5xl mx-auto flex flex-col gap-0">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.15, ...easeOut }}
            className="flex items-start gap-6 relative"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <motion.div
                className="absolute left-7 top-16 w-0.5 h-16 bg-gradient-to-b from-emerald-500/50 to-transparent"
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ delay: i * 0.15 + 0.3 }}
                style={{ originY: 0 }}
              />
            )}
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">
              {step.icon}
            </div>
            <div className="pt-2 pb-12">
              <h3 className="text-white font-semibold text-lg">{step.title}</h3>
              <p className="text-slate-400 mt-1">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

---

### 5.2 Privacy Passport Animation

```tsx
// src/components/student/PrivacyPassport.tsx
'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Lock, Unlock, Shield, Eye, EyeOff } from 'lucide-react';

// ── ANIMATED CLAIM CARD ──────────────────────────────
function ClaimCard({ claim, onToggle }: { claim: Claim; onToggle: () => void }) {
  return (
    <motion.div
      layout                               // Smooth reorder on toggle
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        flex items-center justify-between rounded-xl px-4 py-3 border cursor-pointer
        ${claim.isPublic
          ? 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'
          : 'bg-slate-800/50 border-slate-700/30 hover:border-slate-600/50'
        }
      `}
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="text-white text-sm font-medium">{claim.subject}</span>
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {claim.isPublic ? (
            <motion.div
              key="public"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-emerald-400 text-sm"
            >
              <span>✓ {claim.value}</span>
              <Unlock className="w-3.5 h-3.5" />
            </motion.div>
          ) : (
            <motion.div
              key="private"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Lock className="w-4 h-4 text-slate-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
```

---

### 5.3 Proof Generation Animation

```tsx
// src/components/student/ProofGenerating.tsx
'use client';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

const PROOF_STEPS = [
  { id: 1, label: 'Creating cryptographic commitments', duration: 2000 },
  { id: 2, label: 'Computing Zero-Knowledge proof',     duration: 4000 },
  { id: 3, label: 'Submitting to Midnight Network',     duration: 3000 },
  { id: 4, label: 'Awaiting blockchain confirmation',   duration: 3000 },
];

export function ProofGenerating({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let cumulative = 0;
    PROOF_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i + 1);
        setCompletedSteps(prev => [...prev, i]);
        if (i === PROOF_STEPS.length - 1) setTimeout(onComplete, 800);
      }, cumulative + step.duration);
      cumulative += step.duration;
    });
  }, []);

  return (
    <div className="flex flex-col items-center py-16 px-8">
      
      {/* Animated Shield Logo */}
      <motion.div
        className="w-24 h-24 mb-10 relative"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="w-full h-full rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-4xl">🔐</span>
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2">Generating ZK Proof</h2>
      <p className="text-slate-400 mb-10">Your private data never leaves your device</p>

      {/* Step Progress */}
      <div className="w-full max-w-sm space-y-4">
        {PROOF_STEPS.map((step, i) => {
          const isComplete  = completedSteps.includes(i);
          const isActive    = currentStep === i + 1 && !isComplete;
          const isPending   = currentStep < i + 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              {/* Step indicator */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-none stroke-white stroke-2">
                        <motion.path
                          d="M5 13l4 4L19 7"
                          variants={checkmarkDraw}
                          initial="hidden"
                          animate="visible"
                        />
                      </svg>
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      key="spinner"
                      className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <motion.div
                      key="pending"
                      className="w-8 h-8 rounded-full border-2 border-slate-700"
                    />
                  )}
                </AnimatePresence>
              </div>

              <span className={`text-sm ${isComplete ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 5.4 Verification Result Animation

```tsx
// src/components/recruiter/VerificationResult.tsx
'use client';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Lock } from 'lucide-react';

export function VerificationResult({ result }: { result: VerificationData }) {
  const isVerified = result.overall === 'VERIFIED';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: isVerified ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)',
          boxShadow: isVerified
            ? '0 0 40px rgba(16,185,129,0.2)'
            : '0 0 40px rgba(239,68,68,0.15)',
        }}
      >
        {/* Header */}
        <motion.div
          className={`px-8 py-6 ${isVerified ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              {isVerified
                ? <CheckCircle className="w-10 h-10 text-emerald-400" />
                : <XCircle className="w-10 h-10 text-red-400" />
              }
            </motion.div>
            <div>
              <p className="text-slate-400 text-sm">Candidate {result.candidateAlias}</p>
              <h2 className={`text-3xl font-bold ${isVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                {isVerified ? '✅ QUALIFIED' : '❌ NOT QUALIFIED'}
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Requirements */}
        <div className="px-8 py-6 space-y-3">
          {result.requirements.map((req, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center justify-between py-3 border-b border-white/5"
            >
              <span className="text-slate-300 text-sm">{req.label}</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                className={`font-semibold text-sm ${req.passed ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {req.passed ? '✓ PASS' : '✗ FAIL'}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Private data disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="px-8 py-4 bg-slate-800/50 flex items-center gap-3"
        >
          <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <p className="text-slate-500 text-sm">
            Private credentials not disclosed · Verified on Midnight Network · TX: {result.midnightTxId}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 6. Shared Components

### 6.1 Animated Page Wrapper

```tsx
// src/components/shared/AnimatedPage.tsx
'use client';
import { motion } from 'motion/react';
import { fadeUp } from '@/lib/animations';

export function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
```

### 6.2 Blockchain Status Badge

```tsx
// src/components/shared/BlockchainStatus.tsx
'use client';
import { motion, AnimatePresence } from 'motion/react';

type Status = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';

const config: Record<Status, { color: string; label: string; pulse: boolean }> = {
  PENDING:   { color: '#f59e0b', label: 'Pending',   pulse: true },
  SUBMITTED: { color: '#3b82f6', label: 'Submitted', pulse: true },
  CONFIRMED: { color: '#10b981', label: 'Confirmed', pulse: false },
  FAILED:    { color: '#ef4444', label: 'Failed',    pulse: false },
};

export function BlockchainStatus({ status }: { status: Status }) {
  const { color, label, pulse } = config[status];
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        {pulse && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: color }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      <span className="text-xs font-medium" style={{ color }}>
        Midnight · {label}
      </span>
    </div>
  );
}
```

### 6.3 Scroll-triggered Counter

```tsx
// src/components/shared/AnimatedCounter.tsx
'use client';
import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useRef } from 'react';

export function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (inView) {
      animate(count, to, { duration: 1.5, ease: 'easeOut' });
    }
  }, [inView]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}
```

---

## 7. Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: '#10b981',
          purple:  '#8b5cf6',
          blue:    '#3b82f6',
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        'radial-glow': 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
      boxShadow: {
        'glow-emerald': '0 0 20px rgba(16,185,129,0.4)',
        'glow-purple':  '0 0 20px rgba(139,92,246,0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 8. UX Micro-interactions Summary

| Interaction | Animation | Library |
|---|---|---|
| Button hover | scale(1.05) + glow shadow | Motion whileHover |
| Button press | scale(0.97) | Motion whileTap |
| Page transition | fadeUp (opacity + y) | Motion + AnimatePresence |
| Claim toggle lock/unlock | rotate + fade swap | AnimatePresence mode="wait" |
| Proof steps | stagger slide-in from left | motion.div + delay |
| Proof step complete | spring scale checkmark | motion.path pathLength |
| Verification result | scale+fade in with glow | spring transition |
| Blockchain pulse | ring scale + opacity | animate loop |
| Cards on scroll | fadeUp triggered by useInView | motion + useInView |
| Privacy Passport claim rows | layout animation on reorder | motion layout prop |
| Counter stats | useMotionValue animate to N | useTransform + animate |
