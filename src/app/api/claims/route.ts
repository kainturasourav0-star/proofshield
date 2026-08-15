import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"

export async function GET(req: Request) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const claims = await prisma.claim.findMany({
      where: { userId: session.user.id! },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ claims })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch claims" }, { status: 500 })
  }
}
