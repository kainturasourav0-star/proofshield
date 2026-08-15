import type { Metadata } from "next"

import type { ReactNode } from "react"



export const metadata: Metadata = {
  
  title: "ProofShield",
  
  description: "Proof, not exposure.",
  
}



export default function RootLayout({ children }: { children: ReactNode }) {
  
  return (
    
    <html lang="en">
    
      <body>{children}</body>body>
    
    </html>html>
    
  )
    
}</html>




