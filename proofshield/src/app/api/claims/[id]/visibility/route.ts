import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { isPublic } = await req.json()
    const claimId = params.id

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
    })

    if (!claim || claim.userId !== session.user.id) {
      return NextResponse.json({ error: "Claim not found or unauthorized" }, { status: 403 })
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { isPublic },
    })

    return NextResponse.json({ claim: updatedClaim })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update claim" }, { status: 500 })
  }
}
