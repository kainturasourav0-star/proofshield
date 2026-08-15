import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { analyzeCredential } from "@/lib/ai/analyzer"
import { generateSalt, generateCommitment } from "@/lib/midnight/proofs"
import { auth } from "@/auth"

const credentialTypes = [
  "CERTIFICATE",
  "TRANSCRIPT",
  "GITHUB_PROFILE",
  "MANUAL_ENTRY",
  "PROJECT",
  "RESUME",
] as const

type CredentialType = (typeof credentialTypes)[number]

function isCredentialType(value: unknown): value is CredentialType {
  return typeof value === "string" && credentialTypes.includes(value as CredentialType)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to analyze credential"
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let credentialId: string | undefined

  try {
    const body = await req.json()
    const content = typeof body.content === "string" ? body.content.trim() : ""
    const type = isCredentialType(body.type) ? body.type : "MANUAL_ENTRY"
    const title = typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : type === "GITHUB_PROFILE" ? "GitHub profile analysis" : "Manual credential claim"
    const issuer = typeof body.issuer === "string" ? body.issuer.trim() : undefined
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : undefined

    if (content.length < 12) {
      return NextResponse.json({ error: "Add at least a few details so ProofShield can extract a verifiable claim." }, { status: 400 })
    }

    if (typeof body.credentialId === "string" && body.credentialId.length > 0) {
      credentialId = body.credentialId
      const existing = await prisma.credential.findUnique({ where: { id: credentialId } })
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Credential not found" }, { status: 404 })
      }
      await prisma.credential.update({
        where: { id: credentialId },
        data: { status: "ANALYZING" },
      })
    } else {
      const created = await prisma.credential.create({
        data: {
          userId: session.user.id,
          type,
          title,
          issuer: issuer || undefined,
          storageUrl: sourceUrl || undefined,
          status: "ANALYZING",
        },
      })
      credentialId = created.id
    }

    if (!credentialId) throw new Error("Credential could not be created")
    const currentCredentialId = credentialId
    const claims = await analyzeCredential(content)
    const savedClaims = []

    for (const claim of claims) {
      const salt = generateSalt()
      const commitment = generateCommitment(claim.value, salt)
      const createdClaim = await prisma.claim.create({
        data: {
          userId: session.user.id,
          credentialId: currentCredentialId,
          claimType: claim.claimType,
          subject: claim.subject,
          predicate: claim.predicate,
          value: claim.value,
          commitment,
          isPublic: true,
          verifiedByAI: true,
        },
      })
      savedClaims.push({ ...claim, id: createdClaim.id, salt, commitment })
    }

    await prisma.credential.update({
      where: { id: currentCredentialId },
      data: { status: "COMPLETE", analyzedAt: new Date() },
    })

    return NextResponse.json({ success: true, credentialId: currentCredentialId, claims: savedClaims })
  } catch (error: unknown) {
    if (credentialId) {
      await prisma.credential.updateMany({
        where: { id: credentialId, userId: session.user.id },
        data: { status: "FAILED" },
      }).catch(() => undefined)
    }
    console.error("Analysis endpoint error:", error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
