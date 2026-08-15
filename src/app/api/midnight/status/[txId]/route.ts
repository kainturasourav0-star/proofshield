import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  req: Request,
  { params }: { params: { txId: string } }
) {
  try {
    const { txId } = params
    const proof = await prisma.proof.findFirst({
      where: { midnightTxId: txId },
    })

    if (!proof) {
      // Fallback for mocked Explorer transaction links
      return NextResponse.json({ status: "CONFIRMED" })
    }

    return NextResponse.json({ status: proof.midnightStatus })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch status" }, { status: 500 })
  }
}
