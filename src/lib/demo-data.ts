export const DEMO_CANDIDATE_ID = "demo-candidate"
export const DEMO_RECRUITER_ID = "demo-recruiter"

export const demoCandidateUser = {
  id: DEMO_CANDIDATE_ID,
  email: "demo@proofshield.io",
  name: "Demo Candidate",
  role: "CANDIDATE" as const,
  walletAddress: "0x8f2a7b1c3d9e5f6a8b0c2e4d6f8a0b2c4d6e8f0a",
}

export const demoRecruiterUser = {
  id: DEMO_RECRUITER_ID,
  email: "recruiter@testcompany.io",
  name: "Alice Recruiter",
  role: "RECRUITER" as const,
}

export const demoCandidateCredentials = [
  {
    id: "demo-credential-certification",
    userId: DEMO_CANDIDATE_ID,
    type: "CERTIFICATE",
    title: "AWS Certified Solutions Architect.pdf",
    status: "COMPLETE",
    analyzedAt: new Date("2026-08-01T10:00:00.000Z"),
    createdAt: new Date("2026-08-01T09:30:00.000Z"),
    claims: [
      {
        id: "demo-claim-aws",
        userId: DEMO_CANDIDATE_ID,
        credentialId: "demo-credential-certification",
        claimType: "CERTIFICATION",
        subject: "AWS Certified Solutions Architect - Associate",
        predicate: "has",
        value: "true",
        commitment: "0xec2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e0f",
        isPublic: true,
        createdAt: new Date("2026-08-01T10:05:00.000Z"),
      },
    ],
  },
  {
    id: "demo-credential-transcript",
    userId: DEMO_CANDIDATE_ID,
    type: "TRANSCRIPT",
    title: "Stanford University Official Transcript.pdf",
    status: "COMPLETE",
    analyzedAt: new Date("2026-08-02T10:00:00.000Z"),
    createdAt: new Date("2026-08-02T09:30:00.000Z"),
    claims: [
      {
        id: "demo-claim-gpa",
        userId: DEMO_CANDIDATE_ID,
        credentialId: "demo-credential-transcript",
        claimType: "GPA_THRESHOLD",
        subject: "Cumulative GPA",
        predicate: ">=",
        value: "3.85",
        commitment: "0xac3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
        isPublic: true,
        createdAt: new Date("2026-08-02T10:05:00.000Z"),
      },
    ],
  },
  {
    id: "demo-credential-github",
    userId: DEMO_CANDIDATE_ID,
    type: "GITHUB_PROFILE",
    title: "github.com/demouser-dev",
    status: "COMPLETE",
    analyzedAt: new Date("2026-08-03T10:00:00.000Z"),
    createdAt: new Date("2026-08-03T09:30:00.000Z"),
    claims: [
      {
        id: "demo-claim-projects",
        userId: DEMO_CANDIDATE_ID,
        credentialId: "demo-credential-github",
        claimType: "PROJECT_COUNT",
        subject: "Web Repositories",
        predicate: ">=",
        value: "12",
        commitment: "0xbc3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
        isPublic: true,
        createdAt: new Date("2026-08-03T10:05:00.000Z"),
      },
      {
        id: "demo-claim-typescript",
        userId: DEMO_CANDIDATE_ID,
        credentialId: "demo-credential-github",
        claimType: "SKILL_PROFICIENCY",
        subject: "TypeScript",
        predicate: ">=",
        value: "Expert",
        commitment: "0xcc3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
        isPublic: true,
        createdAt: new Date("2026-08-03T10:06:00.000Z"),
      },
      {
        id: "demo-claim-react",
        userId: DEMO_CANDIDATE_ID,
        credentialId: "demo-credential-github",
        claimType: "SKILL_PROFICIENCY",
        subject: "React / Next.js",
        predicate: ">=",
        value: "Expert",
        commitment: "0xdc3d2f9c3b8a10e4a781b0a1d48c0a23b9cd4b238a9f0e1c2b3d4f5a6b7c8d9e",
        isPublic: true,
        createdAt: new Date("2026-08-03T10:07:00.000Z"),
      },
    ],
  },
]

export const demoCandidateClaims = demoCandidateCredentials.flatMap((credential) => credential.claims)
export const demoCandidateProofs: unknown[] = []

export function isDemoCandidate(userId?: string | null) {
  return userId === DEMO_CANDIDATE_ID
}

export function isDemoRecruiter(userId?: string | null) {
  return userId === DEMO_RECRUITER_ID
}
