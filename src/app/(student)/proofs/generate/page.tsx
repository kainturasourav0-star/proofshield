"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
  Shield,
  Check,
  Copy,
  ExternalLink,
  Mail,
  ArrowLeft,
  Cpu,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { ProofGenerating } from "@/components/student/ProofGenerating"
import Link from "next/link"

interface Claim {
  id: string
  claimType: string
  subject: string
  predicate: string
  value: string
  isPublic: boolean
}

interface ShareData {
  proofId: string
  shareToken: string
  shareUrl: string
  expiresAt: string
  mock?: boolean
}

export default function ProofGeneratorPage() {
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  const [expiryDays, setExpiryDays] = useState(7)
  const [step, setStep] = useState<"form" | "generating" | "success">("form")
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [copied, setCopied] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const { data: claimsData } = useQuery({
    queryKey: ["claims"],
    queryFn: async () => {
      const res = await fetch("/api/claims")
      return res.json()
    },
  })

  // While on the success screen, poll the backend until the async Midnight
  // submission lands, so we show the real on-chain transaction id.
  const { data: proofListData } = useQuery({
    queryKey: ["proofs", shareData?.proofId],
    queryFn: async () => {
      const res = await fetch("/api/proofs")
      return res.json()
    },
    enabled: step === "success" && !!shareData && !shareData.mock,
    refetchInterval: 3000,
  })

  const realProof = proofListData?.proofs?.find(
    (p: any) => p.id === shareData?.proofId
  )
  const midnightTxId = realProof?.midnightTxId || ""
  const midnightStatus: string = realProof?.midnightStatus || "PENDING"

  const generateProofMutation = useMutation({
    mutationFn: async () => {
      // Demo fallback: mock claims are not in the DB, so synthesize a local
      // proof so the full demo flow works even without a seeded database.
      if (selectedClaims.some((id) => id.startsWith("mock-"))) {
        const shareToken = "demo-" + Math.random().toString(36).substring(2, 10)
        const expiresAt = new Date(Date.now() + expiryDays * 86400000)
        return {
          proofId: "demo-proof",
          shareToken,
          shareUrl: `${window.location.origin}/verify/${shareToken}`,
          expiresAt: expiresAt.toISOString(),
          mock: true,
        }
      }

      const res = await fetch("/api/proofs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimIds: selectedClaims, expiresInDays: expiryDays }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate proof")
      }
      return data as ShareData
    },
    onSuccess: (data) => {
      setShareData(data)
      setGenerateError(null)
      setStep("generating")
    },
    onError: (err: any) => {
      setGenerateError(err.message || "Failed to generate proof")
    },
  })

  const claims: Claim[] = claimsData?.claims || []

  // Custom mock claims if DB is empty, ensuring demo operates smoothly
  const displayClaims = claims.length > 0 ? claims.filter((c) => c.isPublic) : [
    { id: "mock-1", claimType: "SKILL_PROFICIENCY", subject: "Python", predicate: ">=", value: "Advanced", isPublic: true },
    { id: "mock-2", claimType: "CERTIFICATION", subject: "CompTIA Security+", predicate: "has", value: "true", isPublic: true },
  ]

  const handleClaimToggle = (id: string) => {
    setSelectedClaims((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedClaims.length === displayClaims.length) {
      setSelectedClaims([])
    } else {
      setSelectedClaims(displayClaims.map((c) => c.id))
    }
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedClaims.length === 0) return
    setGenerateError(null)
    generateProofMutation.mutate()
  }

  const handleGenerationComplete = () => {
    setStep("success")
  }

  const handleCopy = () => {
    if (shareData?.shareUrl) {
      navigator.clipboard.writeText(shareData.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const activeSelectedClaims = displayClaims.filter((c) => selectedClaims.includes(c.id))

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {step === "form" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Build Your Proof</h1>
            <p className="text-sm text-slate-400 mt-1">Select which claims to include. Only what you choose will be provable.</p>
          </div>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form list */}
            <div className="lg:col-span-7 border-t-accent bg-slate-900/40 border border-slate-800/70 rounded-2xl p-6 space-y-6 shadow-card-dark">
              {generateError && (
                <div className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {generateError}
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-sm font-semibold text-slate-200">Select Verifiable Claims</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                >
                  {selectedClaims.length === displayClaims.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="space-y-2">
                {displayClaims.map((claim) => {
                  const isChecked = selectedClaims.includes(claim.id)
                  return (
                    <div
                      key={claim.id}
                      onClick={() => handleClaimToggle(claim.id)}
                      className={`p-3.5 bg-slate-950/60 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-[0_0_16px_rgba(16,185,129,0.08)]"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-900"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">{claim.claimType}</span>
                        <span className="text-sm font-semibold text-slate-200">
                          {claim.subject} {claim.predicate === "has" ? "Possession" : `${claim.predicate} ${claim.value}`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Expiry Selector */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry duration</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value={7}>7 Days (Recommended)</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={999}>No Expiry</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={selectedClaims.length === 0 || generateProofMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold rounded-xl shadow-glow-emerald hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {generateProofMutation.isPending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Cpu className="h-4.5 w-4.5" />}
                Generate ZK Proof
              </button>
            </div>

            {/* Recruiter View Preview */}
            <div className="lg:col-span-5 border-t-accent bg-slate-900/60 border border-slate-800/70 rounded-2xl p-6 space-y-4 shadow-card-dark">
              <h3 className="text-base font-bold text-slate-200">Recruiter Will See:</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Recruiters verifying the proof link will only see a cryptographically sealed confirmation of the selected criteria. No personal data, files, or actual values will be shown.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[140px] flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-2xs font-bold text-slate-500 uppercase block tracking-wider">Verifiable receipt preview</span>
                  {activeSelectedClaims.length === 0 ? (
                    <span className="text-xs text-slate-500 italic block py-2">Select at least one claim above to preview receipt...</span>
                  ) : (
                    <div className="space-y-2">
                      {activeSelectedClaims.map((claim) => (
                        <div key={claim.id} className="flex items-center gap-2 text-xs text-slate-400">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Candidate meets criteria: <strong>{claim.subject}</strong></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-2xs text-slate-500">
                  <span>EXPIRES: {expiryDays === 999 ? "NEVER" : `${expiryDays} DAYS`}</span>
                  <span>ID: CANDIDATE_#9A81F</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {step === "generating" && (
        <div className="py-8">
          <ProofGenerating onComplete={handleGenerationComplete} />
        </div>
      )}

      {step === "success" && shareData && (
        <div className="w-full max-w-xl mx-auto border-t-accent bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-card-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] to-violet-500/[0.03] pointer-events-none" />

          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-4 shadow-glow-emerald">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Proof Generated Successfully!</h2>
            <p className="text-sm text-slate-500 mt-1">Midnight testnet node has confirmed the registration.</p>
          </div>

          <div className="space-y-4 bg-slate-950/60 border border-slate-800 rounded-xl p-5 text-sm font-medium">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400 font-semibold">Proof ID:</span>
              <span className="font-mono text-xs text-slate-200">
                #{(shareData.proofId || "proof").substring(0, 10).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400 font-semibold">Midnight TX:</span>
              {shareData.mock ? (
                <span className="font-mono text-xs text-emerald-400">
                  {midnightTxId ? `${midnightTxId.substring(0, 10)}...` : "0x9c3d…0f1a"}
                </span>
              ) : midnightTxId ? (
                <a
                  href={`https://explorer.midnight.network/tx/${midnightTxId}`}
                  target="_blank"
                  className="font-mono text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  {midnightTxId.substring(0, 10)}... <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="font-mono text-xs text-amber-400 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> {midnightStatus} — confirming…
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Expires:</span>
              <span className="text-slate-200">
                {shareData.expiresAt ? new Date(shareData.expiresAt).toLocaleDateString() : "No expiry"}
              </span>
            </div>
          </div>

          {/* Share Url controls */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Shareable URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareData.shareUrl || ""}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <a
              href={`mailto:?subject=Verifiable%20Credentials%20Proof&body=Verify%20my%20qualifications%20on%20Midnight%20Network:%20${shareData.shareUrl}`}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Mail className="h-4 w-4" /> Share via Email
            </a>
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-glow-emerald"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
