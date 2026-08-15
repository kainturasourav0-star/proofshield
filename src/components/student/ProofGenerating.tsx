"use client"

import React, { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Shield, Loader2, Check } from "lucide-react"

interface ProofGeneratingProps {
  onComplete: (txId: string) => void
}

const steps = [
  "Creating cryptographic commitments",
  "Computing Zero-Knowledge proof",
  "Submitting to Midnight Network",
  "Awaiting blockchain confirmation",
]

export function ProofGenerating({ onComplete }: ProofGeneratingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (currentStep >= steps.length) {
      // Complete! Generate a dummy Tx Hash and trigger complete
      const dummyTx = "0x" + Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18)
      onComplete(dummyTx)
      return
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep((prev) => prev + 1)
    }, 2500) // 10 seconds total roughly

    return () => clearTimeout(timer)
  }, [currentStep, onComplete])

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl">
      {/* Animated Shield Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="p-5 bg-slate-950 border border-slate-850 rounded-full text-emerald-400 relative z-10"
        >
          <Shield className="h-12 w-12" />
        </motion.div>
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Computing Cryptographic Proof</h2>
      <p className="text-sm text-slate-450 mb-8 max-w-xs">
        Generating zero-knowledge commitments and writing registration keys to the ledger.
      </p>

      {/* Progress Steps */}
      <div className="w-full text-left space-y-4">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.includes(idx)
          const isCurrent = currentStep === idx

          return (
            <div
              key={idx}
              className={`flex items-center gap-3.5 p-3 rounded-lg border transition-all ${
                isCurrent
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : isCompleted
                  ? "bg-emerald-500/5 border-emerald-500/10 text-slate-400"
                  : "bg-transparent border-transparent text-slate-600"
              }`}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shrink-0"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              ) : isCurrent ? (
                <Loader2 className="h-4.5 w-4.5 text-emerald-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-800 shrink-0" />
              )}
              <span className="text-sm font-medium">{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
