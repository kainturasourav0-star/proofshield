import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  req: Request,
  { params }: { params: { shareToken: string } }
) {
  try {
    const { shareToken } = params
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

    if (proof.expiresAt && new Date() > new Date(proof.expiresAt)) {
      return NextResponse.json({ error: "Proof has expired" }, { status: 410 })
    }

    return NextResponse.json({ proof })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch proof" }, { status: 500 })
  }
}
