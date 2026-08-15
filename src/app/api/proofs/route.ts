import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"

export async function GET(req: Request) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const proofs = await prisma.proof.findMany({
      where: { candidateId: session.user.id! },
      include: {
        proofClaims: {
          include: {
            claim: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ proofs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch proofs" }, { status: 500 })
  }
}
