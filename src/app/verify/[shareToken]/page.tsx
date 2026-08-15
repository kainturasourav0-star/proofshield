import React from "react"
import Link from "next/link"
import { AlertTriangle, Shield } from "lucide-react"
import { prisma } from "@/lib/db/prisma"
import { VerifyReceipt } from "@/components/public/VerifyReceipt"
import { demoCandidateProof, isDemoProofToken } from "@/lib/demo-data"

interface PageProps {
  params: {
    shareToken: string
  }
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Proof verification | ProofShield`,
    description: `Zero-knowledge proof verification receipt for share token ${params.shareToken}.`,
  }
}

async function getProofData(shareToken: string) {
  if (isDemoProofToken(shareToken)) return demoCandidateProof

  try {
    return await prisma.proof.findUnique({
      where: { shareToken },
      include: {
        proofClaims: {
          include: { claim: true },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function PublicVerifyPage({ params }: PageProps) {
  const proof = await getProofData(params.shareToken)

  if (!proof) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0f1e] px-6 py-16 text-slate-100">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60" />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-amber-400/20 bg-slate-900/70 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/[0.08]"><AlertTriangle className="h-7 w-7 text-amber-300" /></div>
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-white"><Shield className="h-4 w-4 text-emerald-300" /> ProofShield receipt</div>
          <h1 className="text-2xl font-bold text-white">Receipt not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">This share link is invalid, unavailable, or has been revoked. No verification result was created.</p>
          <Link href="/" className="mt-7 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400">Learn about ProofShield</Link>
        </div>
      </div>
    )
  }

  const isExpired = Boolean(proof.expiresAt && new Date() > new Date(proof.expiresAt))

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-[#0a0f1e] py-16 text-slate-100 selection:bg-emerald-500/20">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
      <VerifyReceipt proof={proof} isExpired={isExpired} />
    </div>
  )
}
