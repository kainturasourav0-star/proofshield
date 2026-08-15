"use client"

import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Search, Plus, Trash2, Cpu, FileCheck } from "lucide-react"
import { VerificationResult } from "@/components/recruiter/VerificationResult"

interface Requirement {
  claimType: "SKILL_PROFICIENCY" | "PROJECT_COUNT" | "CERTIFICATION" | "HACKATHON_COUNT" | "GPA_THRESHOLD"
  subject: string
  predicate: ">=" | "==" | "has"
  value: string
}

export default function VerifyPage() {
  const [proofUrl, setProofUrl] = useState("")
  const [requirements, setRequirements] = useState<Requirement[]>([
    { claimType: "SKILL_PROFICIENCY", subject: "Python", predicate: ">=", value: "Advanced" },
    { claimType: "CERTIFICATION", subject: "CompTIA Security+", predicate: "has", value: "true" }
  ])

  // Requirement Form Modal Builder states
  const [showModal, setShowModal] = useState(false)
  const [newClaimType, setNewClaimType] = useState<Requirement["claimType"]>("SKILL_PROFICIENCY")
  const [newSubject, setNewSubject] = useState("")
  const [newPredicate, setNewPredicate] = useState<Requirement["predicate"]>(">=")
  const [newValue, setNewValue] = useState("Intermediate")

  const [resultData, setResultData] = useState<any | null>(null)

  const verifyMutation = useMutation({
    mutationFn: async () => {
      // Extract shareToken from Url if pasted as full link
      let shareToken = proofUrl.trim()
      if (shareToken.includes("/verify/")) {
        const parts = shareToken.split("/verify/")
        shareToken = parts[parts.length - 1]
      }

      const res = await fetch("/api/proofs/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareToken, requirements }),
      })
      return res.json()
    },
    onSuccess: (data) => {
      setResultData(data)
    },
  })

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject) return
    setRequirements((prev) => [
      ...prev,
      { claimType: newClaimType, subject: newSubject, predicate: newPredicate, value: newValue },
    ])
    setShowModal(false)
    setNewSubject("")
  }

  const handleRemoveRequirement = (idx: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofUrl) return
    verifyMutation.mutate()
  }

  const handleReset = () => {
    setResultData(null)
    setProofUrl("")
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Verify Candidate</h1>
        <p className="text-sm text-slate-400 mt-1">Verify qualifications using cryptographic proof links securely.</p>
      </div>

      {!resultData ? (
        <form onSubmit={handleVerifySubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main verification inputs */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Candidate proof link or ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Paste candidate proof link (e.g. http://localhost:3000/verify/clxb...) or share token"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Requirement list builder */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">Requirements Set</span>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Requirement
                </button>
              </div>

              <div className="space-y-2">
                {requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block uppercase">{req.claimType}</span>
                      <span className="font-semibold text-slate-200">
                        {req.subject} {req.predicate === "has" ? "Possession" : `${req.predicate} ${req.value}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {requirements.length === 0 && (
                  <div className="text-center py-6 bg-slate-950/40 border border-dashed border-slate-850 rounded-xl text-xs text-slate-500">
                    No requirements specified. The proof will pass automatically.
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending || !proofUrl}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold rounded-lg shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {verifyMutation.isPending ? <Cpu className="h-4.5 w-4.5 animate-spin" /> : <FileCheck className="h-4.5 w-4.5" />}
              Verify Now
            </button>
          </div>
        </form>
      ) : (
        <div className="py-4 animate-fade-in">
          <VerificationResult
            result={resultData.result}
            candidateAlias={resultData.candidateAlias}
            requirementResults={resultData.requirementResults}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Requirement Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-slate-200">Add Requirement</h3>
            
            <form onSubmit={handleAddRequirement} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
                <select
                  value={newClaimType}
                  onChange={(e) => setNewClaimType(e.target.value as Requirement["claimType"])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 text-sm focus:outline-none"
                >
                  <option value="SKILL_PROFICIENCY">Skill Proficiency</option>
                  <option value="CERTIFICATION">Certification</option>
                  <option value="PROJECT_COUNT">Project Count</option>
                  <option value="HACKATHON_COUNT">Hackathon Count</option>
                  <option value="GPA_THRESHOLD">GPA Threshold</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Python, AWS Solutions Architect"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Predicate</label>
                  <select
                    value={newPredicate}
                    onChange={(e) => setNewPredicate(e.target.value as Requirement["predicate"])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 text-sm focus:outline-none"
                  >
                    <option value=">=">&ge; (Greater/Equal)</option>
                    <option value="==">== (Exact Match)</option>
                    <option value="has">Has (Existence)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Value</label>
                  <input
                    type="text"
                    placeholder="e.g. Expert, 5, true"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-3 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
