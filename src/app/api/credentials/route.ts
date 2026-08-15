import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { auth } from "@/auth"
import { demoCandidateCredentials, isDemoCandidate } from "@/lib/demo-data"

export async function GET(req: Request) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (isDemoCandidate(session.user.id)) {
    return NextResponse.json({ credentials: demoCandidateCredentials })
  }

  try {
    const credentials = await prisma.credential.findMany({
      where: { userId: session.user.id! },
      include: {
        claims: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ credentials })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch credentials" }, { status: 500 })
  }
}
