"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { Shield, Lock, Unlock, RefreshCw, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Claim {
  id: string
  claimType: string
  subject: string
  predicate: string
  value: string
  isPublic: boolean
}

export default function PrivacyPassportPage() {
  const queryClient = useQueryClient()
  const [pulseGlow, setPulseGlow] = useState(false)

  const { data: claimsData, isLoading } = useQuery({
    queryKey: ["claims"],
    queryFn: async () => {
      const res = await fetch("/api/claims")
      return res.json()
    },
  })

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const res = await fetch(`/api/claims/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      })
      return res.json()
    },
    onMutate: async ({ id, isPublic }) => {
      await queryClient.cancelQueries({ queryKey: ["claims"] })
      const previousClaims = queryClient.getQueryData(["claims"])
      
      // Optimistic update
      queryClient.setQueryData(["claims"], (old: any) => {
        if (!old?.claims) return old
        return {
          claims: old.claims.map((c: Claim) =>
            c.id === id ? { ...c, isPublic } : c
          ),
        }
      })

      setPulseGlow(true)
      setTimeout(() => setPulseGlow(false), 500)

      return { previousClaims }
    },
    onError: (err, variables, context) => {
      if (context?.previousClaims) {
        queryClient.setQueryData(["claims"], context.previousClaims)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] })
    },
  })

  const claims: Claim[] = claimsData?.claims || []
  
  // Custom mock claims if DB is empty, ensuring demo operates smoothly
  const displayClaims = claims.length > 0 ? claims : [
    { id: "mock-1", claimType: "SKILL_PROFICIENCY", subject: "Python", predicate: ">=", value: "Advanced", isPublic: true },
    { id: "mock-2", claimType: "CERTIFICATION", subject: "CompTIA Security+", predicate: "has", value: "true", isPublic: true },
    { id: "mock-3", claimType: "PROJECT_COUNT", subject: "Web Apps", predicate: ">=", value: "5", isPublic: false },
    { id: "mock-4", claimType: "GPA_THRESHOLD", subject: "Cumulative GPA", predicate: ">=", value: "3.8", isPublic: false }
  ]

  const publicClaims = displayClaims.filter((c) => c.isPublic)
  const privateClaims = displayClaims.filter((c) => !c.isPublic)

  const handleToggle = (id: string, currentStatus: boolean) => {
    if (id.startsWith("mock-")) {
      // Local state change for mock demo data
      queryClient.setQueryData(["claims"], {
        claims: displayClaims.map((c) => (c.id === id ? { ...c, isPublic: !currentStatus } : c)),
      })
      setPulseGlow(true)
      setTimeout(() => setPulseGlow(false), 500)
    } else {
      toggleVisibilityMutation.mutate({ id, isPublic: !currentStatus })
    }
  }

  const handleReset = () => {
    // Reset all display claims to default setting
    const defaultState = displayClaims.map((c, idx) => ({ ...c, isPublic: idx < 2 }))
    queryClient.setQueryData(["claims"], { claims: defaultState })
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Privacy Passport</h1>
        <p className="text-sm text-slate-400 mt-1">Manage which verified credentials are provable (public) and which are hidden (private).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Privacy Passport Card */}
        <div className="lg:col-span-6 flex justify-center">
          <motion.div
            animate={pulseGlow ? { boxShadow: "0 0 30px rgba(16, 185, 129, 0.25)" } : { boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.01] to-violet-500/[0.01] pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-slate-200">Privacy Passport</h3>
              </div>
              <span className="font-mono text-2xs text-slate-500 font-bold bg-slate-950 px-2 py-1 rounded">CANDIDATE #9A81F</span>
            </div>

            {/* Provable Section */}
            <div className="space-y-3.5 mb-8">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">🔓 Provable (Public Claims)</span>
              {publicClaims.length === 0 ? (
                <div className="text-center py-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-xl text-xs text-slate-500">
                  No public claims. Toggle private items below to expose them.
                </div>
              ) : (
                <div className="space-y-2">
                  {publicClaims.map((claim) => (
                    <motion.div
                      layout
                      key={claim.id}
                      className="p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 rounded-lg flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">{claim.claimType}</span>
                        <span className="text-sm font-semibold text-slate-200">
                          {claim.subject} ✓ {claim.value}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggle(claim.id, true)}
                        className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-md transition-colors"
                      >
                        <Unlock className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-850 my-6" />

            {/* Private Section */}
            <div className="space-y-3.5 mb-6">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">🔒 Private (Hidden Claims)</span>
              {privateClaims.length === 0 ? (
                <div className="text-center py-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-xl text-xs text-slate-500">
                  No private claims. All credentials are fully provable.
                </div>
              ) : (
                <div className="space-y-2">
                  {privateClaims.map((claim) => (
                    <motion.div
                      layout
                      key={claim.id}
                      className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg flex items-center justify-between opacity-50 hover:opacity-75 transition-opacity"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">{claim.claimType}</span>
                        <span className="text-sm font-semibold text-slate-350 line-through decoration-slate-700">
                          {claim.subject}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggle(claim.id, false)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-md transition-colors"
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset / Controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-850 text-xs">
              <button
                onClick={handleReset}
                className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 font-medium"
              >
                <RefreshCw className="h-3 w-3" /> Reset to Defaults
              </button>
              <Link
                href="/proofs/generate"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-0.5"
              >
                Generate Proof &rarr;
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Generate Proof CTA Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200">How Recruiters See You</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              When sharing your credentials, recruiters will only be able to run verifications against the claims inside your <strong>🔓 Provable</strong> section.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Any private claims will remain completely hidden, and not even the existence of those credentials can be inferred.
            </p>
            
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
              <span className="text-2xs font-bold text-slate-500 uppercase block tracking-wider">Recruiter View Preview</span>
              <div className="space-y-2">
                {publicClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span>Candidate #9A81F possesses <strong>{claim.subject}</strong></span>
                  </div>
                ))}
                {publicClaims.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No public qualifications exposed</span>
                )}
              </div>
            </div>

            <Link
              href="/proofs/generate"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/15"
            >
              Generate Cryptographic ZK Proof
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
