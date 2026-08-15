"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useUploadThing } from "@/lib/uploadthing"
import {
  AlertCircle,
  Check,
  FileText,
  FileUp,
  GitBranch,
  Link2,
  Loader2,
  PenLine,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

type CredentialType = "CERTIFICATE" | "TRANSCRIPT" | "GITHUB_PROFILE" | "MANUAL_ENTRY"
type Status = "idle" | "uploading" | "analyzing" | "success" | "error"

interface ExtractedClaimPreview {
  id?: string
  claimType: string
  subject: string
  predicate: string
  value: string
  confidence: number
}

interface ListedCredential {
  id: string
  status: string
  claims: ExtractedClaimPreview[]
}

const typeOptions: Array<{ value: CredentialType; label: string; description: string; icon: React.ElementType }> = [
  { value: "CERTIFICATE", label: "Certificate", description: "PDF, PNG, JPG, or WebP", icon: ShieldCheck },
  { value: "TRANSCRIPT", label: "Transcript", description: "Academic records and results", icon: FileText },
  { value: "GITHUB_PROFILE", label: "GitHub profile", description: "Public profile or repository", icon: GitBranch },
  { value: "MANUAL_ENTRY", label: "Manual claim", description: "Describe a proof in your words", icon: PenLine },
]

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function formatClaim(claim: ExtractedClaimPreview) {
  if (claim.predicate === "has") return `${claim.subject} verified`
  return `${claim.subject} ${claim.predicate} ${claim.value}`
}

async function waitForCredential(credentialId: string): Promise<ListedCredential> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await fetch("/api/credentials", { cache: "no-store" })
    const payload = await response.json()
    const credential = payload.credentials?.find((item: ListedCredential) => item.id === credentialId)
    if (credential && credential.status !== "PENDING" && credential.status !== "ANALYZING") return credential
    await new Promise((resolve) => setTimeout(resolve, 900))
  }
  throw new Error("Analysis is taking longer than expected. Your credential is still processing in the background.")
}

export function CredentialUploader() {
  const [credType, setCredType] = useState<CredentialType>("CERTIFICATE")
  const [githubUrl, setGithubUrl] = useState("")
  const [manualTitle, setManualTitle] = useState("")
  const [manualIssuer, setManualIssuer] = useState("")
  const [manualContent, setManualContent] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFileName, setSelectedFileName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [claimsPreview, setClaimsPreview] = useState<ExtractedClaimPreview[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const { startUpload } = useUploadThing("credentialUploader", {
    onClientUploadComplete: async (res) => {
      const credentialId = (res?.[0] as { serverData?: { credentialId?: string } } | undefined)?.serverData?.credentialId
      if (!credentialId) {
        setStatus("error")
        setErrorMessage("The file uploaded, but ProofShield could not identify the processing job.")
        return
      }
      setStatus("analyzing")
      try {
        const credential = await waitForCredential(credentialId)
        if (credential.status === "FAILED") throw new Error("We could not extract claims from that file. Try a clearer document or enter the claim manually.")
        setClaimsPreview(credential.claims || [])
        setStatus("success")
      } catch (error: unknown) {
        setStatus("error")
        setErrorMessage(getErrorMessage(error, "Analysis failed"))
      }
    },
    onUploadProgress: (progress) => setUploadProgress(progress),
    onUploadError: (error) => {
      setStatus("error")
      setErrorMessage(error.message || "Failed to upload file")
    },
  })

  const reset = () => {
    setStatus("idle")
    setClaimsPreview([])
    setErrorMessage("")
    setUploadProgress(0)
    setSelectedFileName("")
  }

  const handleUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setStatus("error")
      setErrorMessage("Files must be smaller than 4 MB.")
      return
    }
    setSelectedFileName(file.name)
    setStatus("uploading")
    setUploadProgress(0)
    try {
      await startUpload([file])
    } catch (error: unknown) {
      setStatus("error")
      setErrorMessage(getErrorMessage(error, "Upload initialization failed"))
    }
  }

  const handleGithubSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    try {
      const parsed = new URL(githubUrl)
      if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") throw new Error("Use a public github.com profile or repository URL.")
      const segments = parsed.pathname.split("/").filter(Boolean)
      if (!segments[0]) throw new Error("Enter a GitHub profile or repository URL.")

      const owner = segments[0]
      const repo = segments[1]
      const apiUrl = repo ? `https://api.github.com/repos/${owner}/${repo}` : `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`
      const response = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } })
      if (!response.ok) throw new Error("GitHub could not find that public profile or repository.")
      const data = await response.json()
      const repositories = Array.isArray(data) ? data : [data]
      const languages = Array.from(new Set(repositories.flatMap((item) => Object.keys(item.language ? { [item.language]: true } : {}))))
      const projectCount = repositories.length
      const content = [
        `GitHub profile ${owner}.`,
        repo ? `Repository ${data.full_name || `${owner}/${repo}`} is public.` : `Public project portfolio with ${projectCount} projects.`,
        `Primary technologies: ${languages.join(", ") || "open-source software"}.`,
        data.description ? `Project description: ${data.description}.` : "Public software projects and repository activity.",
      ].join(" ")

      const analysisResponse = await fetch("/api/credentials/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "GITHUB_PROFILE", title: repo ? `${owner}/${repo}` : `${owner} GitHub profile`, content, sourceUrl: githubUrl }),
      })
      const payload = await analysisResponse.json()
      if (!analysisResponse.ok) throw new Error(payload.error || "GitHub analysis failed")
      setClaimsPreview(payload.claims || [])
      setStatus("success")
    } catch (error: unknown) {
      setStatus("error")
      setErrorMessage(getErrorMessage(error, "GitHub analysis failed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    try {
      const response = await fetch("/api/credentials/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MANUAL_ENTRY",
          title: manualTitle,
          issuer: manualIssuer,
          content: manualContent,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Manual analysis failed")
      setClaimsPreview(payload.claims || [])
      setStatus("success")
    } catch (error: unknown) {
      setStatus("error")
      setErrorMessage(getErrorMessage(error, "Manual analysis failed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1424]/90 p-5 shadow-[0_28px_90px_-36px_rgba(16,185,129,0.45)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/[0.08] blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80"><Sparkles className="h-3.5 w-3.5" /> Secure intake</div>
            <h2 className="text-xl font-bold text-white">Add a credential to your passport</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">Choose a source. ProofShield extracts claims while keeping the source credential private.</p>
          </div>
          <div className="hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-3 sm:block"><ShieldCheck className="h-5 w-5 text-emerald-300" /></div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {typeOptions.map((option) => {
            const Icon = option.icon
            const active = credType === option.value
            return (
              <button key={option.value} type="button" onClick={() => { setCredType(option.value); setStatus("idle"); setErrorMessage("") }} className={`group rounded-2xl border p-3 text-left transition-all ${active ? "border-emerald-400/35 bg-emerald-400/[0.09] shadow-[0_0_24px_rgba(16,185,129,0.1)]" : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.15] hover:bg-white/[0.05]"}`}>
                <Icon className={`mb-2 h-4 w-4 ${active ? "text-emerald-300" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className={`block text-xs font-semibold ${active ? "text-white" : "text-slate-300"}`}>{option.label}</span>
                <span className="mt-1 block text-[10px] leading-tight text-slate-500">{option.description}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {status === "idle" && credType === "GITHUB_PROFILE" && (
            <motion.form key="github" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleGithubSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-200" htmlFor="github-url">Public GitHub URL</label>
              <div className="relative"><GitBranch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input id="github-url" type="url" placeholder="https://github.com/username/repository" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} required className="w-full rounded-xl border border-white/[0.08] bg-[#080e1b] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10" /></div>
              <button type="submit" disabled={isSubmitting} className="button-primary w-full">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} Analyze public activity</button>
            </motion.form>
          )}

          {status === "idle" && credType === "MANUAL_ENTRY" && (
            <motion.form key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="manual-title">Credential title</label><input id="manual-title" value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder="e.g. Full-stack portfolio" required className="field-input" /></div><div><label className="field-label" htmlFor="manual-issuer">Issuer or source</label><input id="manual-issuer" value={manualIssuer} onChange={(event) => setManualIssuer(event.target.value)} placeholder="e.g. Acme Academy" className="field-input" /></div></div>
              <div><label className="field-label" htmlFor="manual-content">What should be verified?</label><textarea id="manual-content" value={manualContent} onChange={(event) => setManualContent(event.target.value)} placeholder="Describe the skill, certification, project count, or result you want to prove..." required minLength={12} rows={5} className="field-input resize-none" /></div>
              <button type="submit" disabled={isSubmitting} className="button-primary w-full">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />} Extract verifiable claims</button>
            </motion.form>
          )}

          {status === "idle" && credType !== "GITHUB_PROFILE" && credType !== "MANUAL_ENTRY" && (
            <motion.div key="file" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) handleUpload(file) }} className="group relative flex min-h-[218px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-[#080e1b]/75 px-6 text-center transition-all hover:border-emerald-400/45 hover:bg-emerald-400/[0.03]">
              <input type="file" id="file-upload" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleUpload(file) }} accept=".pdf,image/*" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
              <div className="mb-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07] p-4 transition-transform group-hover:scale-105"><FileUp className="h-7 w-7 text-emerald-300" /></div>
              <p className="text-sm font-semibold text-white">Drop your {credType === "TRANSCRIPT" ? "transcript" : "certificate"} here</p>
              <p className="mt-2 text-xs text-slate-500">or click to browse · PDF, PNG, JPG, WebP · up to 4 MB</p>
            </motion.div>
          )}

          {status === "uploading" && (
            <motion.div key="uploading" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-white/[0.08] bg-[#080e1b]/70 p-7 text-center"><div className="mx-auto mb-4 w-fit rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-4"><FileText className="h-7 w-7 animate-pulse text-emerald-300" /></div><p className="text-sm font-semibold text-white">Uploading {selectedFileName}</p><div className="mx-auto mt-5 h-2 max-w-sm overflow-hidden rounded-full bg-white/[0.07]"><motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" animate={{ width: `${uploadProgress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{uploadProgress}% complete</p></motion.div>
          )}

          {status === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.04] p-9 text-center"><div className="relative mx-auto mb-5 w-fit"><div className="absolute inset-0 rounded-full bg-violet-400/20 blur-xl" /><Loader2 className="relative h-9 w-9 animate-spin text-violet-300" /></div><p className="text-sm font-semibold text-white">Extracting private claims</p><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">The source is being analyzed. Only verifiable claim commitments are added to your passport.</p></motion.div>
          )}

          {status === "success" && (
            <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5"><div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4"><div className="rounded-full bg-emerald-400/15 p-1.5"><Check className="h-4 w-4 text-emerald-300" /></div><div><p className="text-sm font-semibold text-emerald-200">Claims added to your passport</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Your source stays private. Review the extracted claims before generating a proof.</p></div></div>{claimsPreview.length > 0 ? <div className="space-y-2">{claimsPreview.map((claim, index) => <div key={claim.id || `${claim.subject}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#080e1b]/70 p-3.5"><div><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{claim.claimType.replaceAll("_", " ")}</span><span className="mt-1 block text-sm font-medium text-slate-200">{formatClaim(claim)}</span></div><span className="shrink-0 text-xs font-semibold text-emerald-300">{Math.round(claim.confidence * 100)}%</span></div>)}</div> : <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4 text-sm text-amber-200">No claims were extracted. Add more evidence in a manual claim to continue.</div>}<button type="button" onClick={reset} className="button-secondary w-full"><RotateCcw className="h-4 w-4" /> Add another credential</button></motion.div>
          )}

          {status === "error" && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-7 text-center"><div className="mx-auto mb-4 w-fit rounded-full border border-red-400/20 bg-red-400/[0.08] p-3"><AlertCircle className="h-6 w-6 text-red-300" /></div><p className="text-sm font-semibold text-white">We could not finish that request</p><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-400">{errorMessage}</p><button type="button" onClick={reset} className="button-secondary mt-5"><RotateCcw className="h-4 w-4" /> Try again</button></motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
