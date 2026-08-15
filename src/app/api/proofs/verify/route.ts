import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"

const SKILL_LEVELS: Record<string, number> = {
  "Beginner": 0,
  "Intermediate": 1,
  "Advanced": 2,
  "Expert": 3,
}

function evaluateRequirement(req: any, claim: any): boolean {
  if (req.claimType !== claim.claimType || req.subject.toLowerCase() !== claim.subject.toLowerCase()) {
    return false
  }

  // Compare skill levels
  if (req.claimType === "SKILL_PROFICIENCY") {
    const claimLevel = SKILL_LEVELS[claim.value] ?? 0
    const reqLevel = SKILL_LEVELS[req.value] ?? 0
    if (req.predicate === ">=") return claimLevel >= reqLevel
    if (req.predicate === "==") return claimLevel === reqLevel
    return false
  }

  // Compare numerical scores/counts (project counts, GPA, hackathons)
  if (["PROJECT_COUNT", "HACKATHON_COUNT", "GPA_THRESHOLD"].includes(req.claimType)) {
    const claimNum = parseFloat(claim.value)
    const reqNum = parseFloat(req.value)
    if (isNaN(claimNum) || isNaN(reqNum)) return false

    if (req.predicate === ">=") return claimNum >= reqNum
    if (req.predicate === "==") return claimNum === reqNum
    if (req.predicate === "<=") return claimNum <= reqNum
    return false
  }

  // Compare certification existence
  if (req.claimType === "CERTIFICATION") {
    if (req.predicate === "has") {
      return claim.value === "true" || claim.value === "yes"
    }
    return claim.value === req.value
  }

  return false
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const { shareToken, requirements } = await req.json()
    if (!shareToken || !requirements || !Array.isArray(requirements)) {
      return NextResponse.json({ error: "Missing shareToken or requirements" }, { status: 400 })
    }

    // Lookup proof by token
    const proof = await prisma.proof.findUnique({
      where: { shareToken: shareToken },
      include: {
        proofClaims: {
          include: {
            claim: true,
          },
        },
      },
    })

    if (!proof) {
      return NextResponse.json({ error: "Proof not found" }, { status: 404 })
    }

    // Check expiration
    if (proof.expiresAt && new Date() > new Date(proof.expiresAt)) {
      return NextResponse.json({
        result: "EXPIRED",
        candidateAlias: `#${proof.candidateId.substring(0, 4).toUpperCase()}`,
        requirementResults: [],
        privateDataDisclosed: false,
      })
    }

    // Extract actual claims associated with this ZK proof
    const claims = proof.proofClaims.map((pc) => pc.claim)

    // Evaluate requirements
    const requirementResults = requirements.map((reqReq: any) => {
      // Find matching claim
      const matchingClaim = claims.find(
        (c) => c.claimType === reqReq.claimType && c.subject.toLowerCase() === reqReq.subject.toLowerCase()
      )

      const pass = matchingClaim ? evaluateRequirement(reqReq, matchingClaim) : false

      return {
        requirement: reqReq,
        met: pass,
        // Hide the actual value to maintain zero-knowledge privacy!
        disclosedValue: null, 
      }
    })

    const overallVerified = requirementResults.every((r) => r.met)

    // Write verification ledger record if authenticated (i.e. if a recruiter is saving the verification)
    const recruiterId = session?.user?.id
    if (recruiterId) {
      await prisma.verification.create({
        data: {
          recruiterId: recruiterId,
          proofId: proof.id,
          result: overallVerified ? "VERIFIED" : "FAILED",
          requirementSet: requirements,
        },
      })
    }

    return NextResponse.json({
      result: overallVerified ? "VERIFIED" : "FAILED",
      candidateAlias: `#${proof.candidateId.substring(0, 4).toUpperCase()}`,
      requirementResults: requirementResults,
      privateDataDisclosed: false,
    })
  } catch (error: any) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 })
  }
}
