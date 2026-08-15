import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, walletAddress: true },
  })

  return NextResponse.json({ user })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : ""
    const walletAddress = typeof body.walletAddress === "string" ? body.walletAddress.trim().slice(0, 120) : ""

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        walletAddress: walletAddress || null,
      },
      select: { id: true, email: true, name: true, walletAddress: true },
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: 500 },
    )
  }
}
