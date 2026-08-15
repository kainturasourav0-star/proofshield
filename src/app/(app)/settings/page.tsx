"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import {
  User,
  Mail,
  ShieldCheck,
  Bell,
  Wallet,
  KeyRound,
  Check,
} from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [ledgerNotifs, setLedgerNotifs] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your profile, privacy preferences, and notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <section className="border-t-accent space-y-5 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 shadow-card-dark">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10">
              <User className="h-4.5 w-4.5 text-emerald-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">Profile</h2>
              <p className="text-xs text-slate-500">Your public account details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={session?.user?.name || ""}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  defaultValue={session?.user?.email || ""}
                  className={`${inputClass} pl-10`}
                  readOnly
                />
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="border-t-accent space-y-5 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 shadow-card-dark">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10">
              <ShieldCheck className="h-4.5 w-4.5 text-violet-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">Privacy</h2>
              <p className="text-xs text-slate-500">Your data stays yours — always.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Midnight Wallet
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Wallet className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="0x8f...9e1c"
                  className={`${inputClass} pl-10 font-mono text-xs`}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Passphrase
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="border-t-accent space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 shadow-card-dark">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10">
              <Bell className="h-4.5 w-4.5 text-blue-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">Notifications</h2>
              <p className="text-xs text-slate-500">Choose what you hear about.</p>
            </div>
          </div>

          {[
            {
              key: "email" as const,
              title: "Email notifications",
              desc: "Proof confirmations and verification updates by email.",
              checked: emailNotifs,
              set: setEmailNotifs,
            },
            {
              key: "ledger" as const,
              title: "Ledger activity",
              desc: "Get notified when a recruiter verifies your proof.",
              checked: ledgerNotifs,
              set: setLedgerNotifs,
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3.5 transition-colors hover:border-slate-700"
            >
              <div>
                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.checked}
                onClick={() => item.set(!item.checked)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  item.checked ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    item.checked ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          ))}
        </section>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] active:scale-[0.98] sm:w-auto sm:px-8"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  )
}
