import React from "react"

import type { Metadata } from "next"



export const metadata: Metadata = { title: "ProofShield", description: "Proof, not exposure." }



export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  return React.createElement("html", { lang: "en" }, React.createElement("body", null, children))
  
}

