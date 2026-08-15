"use client"

import React from "react"
import { AppShell } from "@/components/shared/AppShell"

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="RECRUITER">{children}</AppShell>
}
