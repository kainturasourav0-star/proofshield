"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { AppShell } from "@/components/shared/AppShell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const role =
    session?.user?.role === "RECRUITER" || session?.user?.role === "ADMIN"
      ? "RECRUITER"
      : "STUDENT"

  return <AppShell role={role}>{children}</AppShell>
}
