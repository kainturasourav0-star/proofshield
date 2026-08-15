"use client"

import React from "react"
import { CredentialUploader } from "@/components/student/CredentialUploader"

export default function CredentialsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Credentials</h1>
        <p className="text-sm text-slate-400 mt-1">Upload certificates, transcripts, or links to extract zero-knowledge claims.</p>
      </div>

      <div className="py-4">
        <CredentialUploader />
      </div>
    </div>
  )
}
