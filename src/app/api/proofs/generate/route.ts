import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { generateProofHash } from "@/lib/midnight/proofs"
import { MidnightClient } from "@/lib/midnight/client"
import { demoCandidateProof, isDemoCandidate } from "@/lib/demo-data"

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { claimIds, expiresInDays = 7 } = await req.json()
    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json({ error: "Missing or invalid claimIds" }, { status: 400 })
    }

    const userId = session.user.id!

    if (isDemoCandidate(userId)) {
      const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin
      return NextResponse.json({
        proofId: demoCandidateProof.id,
        shareToken: demoCandidateProof.shareToken,
        shareUrl: `${baseUrl}/verify/${demoCandidateProof.shareToken}`,
        expiresAt: expiresInDays === null ? null : demoCandidateProof.expiresAt,
        mock: true,
      })
    }

    // Validate claims belong to authenticated user
    const claims = await prisma.claim.findMany({
      where: {
        id: { in: claimIds },
        userId: userId,
      },
    })

    if (claims.length !== claimIds.length) {
      return NextResponse.json({ error: "One or more claims not found or unauthorized" }, { status: 403 })
    }

    const commitments = claims.map((c) => c.commitment)
    const proofHash = generateProofHash(commitments)

    const expiresAt = expiresInDays === null ? null : new Date()
    if (expiresAt) expiresAt.setDate(expiresAt.getDate() + Number(expiresInDays))

    // Create Proof + ProofClaims in DB
    const proof = await prisma.proof.create({
      data: {
        candidateId: userId,
        proofHash: proofHash,
        expiresAt: expiresAt,
        proofClaims: {
          create: claims.map((c) => ({
            claimId: c.id,
          })),
        },
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin
    const shareUrl = `${baseUrl}/verify/${proof.shareToken}`

    // Trigger async Midnight submission securely without external HTTP requests
    ;(() => {
      MidnightClient.registerProof(proofHash, commitments)
        .then(async ({ txId }) => {
          await prisma.proof.update({
            where: { id: proof.id },
            data: {
              midnightTxId: txId,
              midnightStatus: "SUBMITTED",
            },
          })

          // Simulate block confirmation after 3 seconds
          setTimeout(async () => {
            try {
              await prisma.proof.update({
                where: { id: proof.id },
                data: {
                  midnightStatus: "CONFIRMED",
                },
              })
              console.log(`[MIDNIGHT SIMULATED] Proof ${proof.id} updated to CONFIRMED in DB`)
            } catch (err) {
              console.error("Failed to update status async:", err)
            }
          }, 3000)
        })
        .catch((err) => {
          console.error("Async Midnight registration failed:", err)
        })
    })()

    return NextResponse.json({
      proofId: proof.id,
      shareToken: proof.shareToken,
      shareUrl: shareUrl,
      expiresAt: proof.expiresAt,
    })
  } catch (error: any) {
    console.error("Proof generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate proof" }, { status: 500 })
  }
}
