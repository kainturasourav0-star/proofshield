"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  CheckSquare,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  FolderOpen,
  Copy,
  Check,
} from "lucide-react"

type ClaimType =
  | "SKILL_PROFICIENCY"
  | "PROJECT_COUNT"
  | "CERTIFICATION"
  | "HACKATHON_COUNT"
  | "GPA_THRESHOLD"

interface Requirement {
  claimType: ClaimType
  subject: string
  predicate: ">=" | "==" | "has"
  value: string
}

interface RequirementSet {
  id: string
  name: string
  requirements: Requirement[]
  createdAt: string
}

const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  SKILL_PROFICIENCY: "Skill Proficiency",
  PROJECT_COUNT: "Project Count",
  CERTIFICATION: "Certification",
  HACKATHON_COUNT: "Hackathon Count",
  GPA_THRESHOLD: "GPA Threshold",
}

const STORAGE_KEY = "proofshield.requirementSets"

const emptyRequirement: Requirement = {
  claimType: "SKILL_PROFICIENCY",
  subject: "",
  predicate: ">=",
  value: "Intermediate",
}

export default function RequirementsPage() {
  const [sets, setSets] = useState<RequirementSet[]>([])
  const [name, setName] = useState("")
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSets(JSON.parse(raw))
    } catch {
      /* ignore corrupted storage */
    }
  }, [])

  useEffect(() => {
    if (savedId) setTimeout(() => setSavedId(null), 2000)
  }, [savedId])

  const persist = (next: RequirementSet[]) => {
    setSets(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const updateRequirement = (idx: number, patch: Partial<Requirement>) => {
    setRequirements((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || requirements.length === 0) return
    const set: RequirementSet = {
      id: crypto.randomUUID(),
      name: name.trim(),
      requirements,
      createdAt: new Date().toISOString(),
    }
    persist([set, ...sets])
    setName("")
    setRequirements([emptyRequirement])
    setSavedId(set.id)
  }

  const handleDelete = (id: string) => {
    persist(sets.filter((s) => s.id !== id))
  }

  const handleDuplicate = (set: RequirementSet) => {
    persist([{ ...set, id: crypto.randomUUID(), name: `${set.name} (copy)` }, ...sets])
  }

  const inputClass =
    "w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all"

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Requirements</h1>
          <p className="mt-1 text-sm text-slate-400">
            Build reusable qualification sets to check candidates against.
          </p>
        </div>
        <Link
          href="/verify"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] active:scale-[0.98]"
        >
          Verify Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Builder */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSave}
            className="border-t-accent space-y-5 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 shadow-card-dark"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10">
                <CheckSquare className="h-4.5 w-4.5 text-emerald-400" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-100">Build a Requirement Set</h2>
                <p className="text-xs text-slate-500">Name it, add criteria, and save for reuse.</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Set Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Type
                      </label>
                      <select
                        value={req.claimType}
                        onChange={(e) => updateRequirement(idx, { claimType: e.target.value as ClaimType })}
                        className={inputClass}
                      >
                        {(Object.keys(CLAIM_TYPE_LABELS) as ClaimType[]).map((t) => (
                          <option key={t} value={t}>
                            {CLAIM_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={req.subject}
                        onChange={(e) => updateRequirement(idx, { subject: e.target.value })}
                        placeholder="e.g. Python, AWS, Repos"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Predicate
                      </label>
                      <select
                        value={req.predicate}
                        onChange={(e) => updateRequirement(idx, { predicate: e.target.value as Requirement["predicate"] })}
                        className={inputClass}
                      >
                        <option value=">=">≥ (Greater/Equal)</option>
                        <option value="==">== (Exact)</option>
                        <option value="has">Has (Existence)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Value
                      </label>
                      <input
                        type="text"
                        value={req.value}
                        onChange={(e) => updateRequirement(idx, { value: e.target.value })}
                        placeholder="e.g. Advanced, 5, true"
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequirements((prev) => prev.filter((_, i) => i !== idx))}
                      className="mb-0.5 rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-500 transition-colors hover:border-red-500/40 hover:text-red-400"
                      aria-label="Remove requirement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setRequirements((prev) => [...prev, { ...emptyRequirement }])}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 py-3 text-sm font-semibold text-slate-400 transition-all hover:border-emerald-500/40 hover:text-emerald-300"
              >
                <Plus className="h-4 w-4" /> Add Requirement
              </button>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || requirements.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-glow-emerald transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
            >
              <Save className="h-4 w-4" /> Save Requirement Set
            </button>
          </form>
        </div>

        {/* Saved sets */}
        <div className="lg:col-span-5">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-base font-bold text-slate-200">Saved Sets ({sets.length})</h2>
          </div>

          {sets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 px-6 py-14 text-center">
              <FolderOpen className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm font-medium text-slate-300">No saved sets yet</p>
              <p className="mt-1 max-w-[220px] text-xs text-slate-500">
                Build your first requirement set on the left and it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sets.map((set) => (
                <div
                  key={set.id}
                  className="group rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5 transition-all hover:border-emerald-500/25 hover:bg-slate-900/60"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-100">{set.name}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {set.requirements.length} criterion · {new Date(set.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {savedId === set.id && (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <Check className="h-3 w-3" /> Saved
                      </span>
                    )}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {set.requirements.map((r, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1 text-[10px] font-medium text-slate-400"
                      >
                        {r.subject} {r.predicate === "has" ? "" : r.predicate} {r.value}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDuplicate(set)}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 p-1.5 text-slate-500 transition-colors hover:border-violet-500/40 hover:text-violet-400"
                        aria-label="Duplicate set"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(set.id)}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 p-1.5 text-slate-500 transition-colors hover:border-red-500/40 hover:text-red-400"
                        aria-label="Delete set"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Link
                      href="/verify"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                      Use set <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
