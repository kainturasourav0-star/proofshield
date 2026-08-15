# Technical Requirements Document (TRD)
## ProofShield — Technical Architecture & Implementation Spec

**Version:** 1.0  
**Stack:** Next.js 14 · TypeScript · Midnight Network · PostgreSQL · Prisma · Claude AI  

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                     │
│   Student Dashboard │ Recruiter Dashboard │ Privacy Passport     │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ REST / tRPC
┌─────────────────────────────────▼───────────────────────────────┐
│                        BACKEND (Node.js + TypeScript)            │
│   Auth API │ Credential API │ AI Analysis │ Proof Engine         │
└────────┬──────────────┬──────────────────────────────┬──────────┘
         │              │                              │
┌────────▼───┐  ┌───────▼────────┐         ┌──────────▼──────────┐
│ PostgreSQL │  │  Claude AI API │         │  Midnight Network    │
│  (Prisma)  │  │  (Analysis)    │         │  (ZK Verification)   │
└────────────┘  └────────────────┘         └─────────────────────┘
```

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.x (App Router) | Full-stack React framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility styling |
| Framer Motion / Motion Dev | latest | Animations and transitions |
| shadcn/ui | latest | Component library |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| Tanstack Query | 5.x | Data fetching & caching |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Runtime |
| TypeScript | 5.x | Type safety |
| Next.js API Routes | 14.x | Backend endpoints |
| Prisma | 5.x | ORM |
| PostgreSQL | 15.x | Primary database |
| NextAuth.js | 4.x | Authentication |
| Anthropic Claude API | latest | Credential AI analysis |

### Blockchain
| Technology | Purpose |
|---|---|
| Midnight Network | Privacy-preserving blockchain |
| Midnight SDK / Compact | Smart contract language |
| ZK Circuits (Midnight native) | Zero-knowledge proof generation |
| Midnight Wallet API | User wallet integration |

### Infrastructure
| Technology | Purpose |
|---|---|
| Vercel | Frontend + API hosting |
| Supabase / Neon | Managed PostgreSQL |
| Uploadthing / S3 | File storage (credential documents) |
| Railway | Background job workers |

---

## 3. Directory Structure

```
proofshield/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (student)/
│   │   ├── dashboard/
│   │   ├── credentials/
│   │   │   ├── upload/
│   │   │   └── [id]/
│   │   ├── passport/
│   │   ├── proofs/
│   │   │   ├── generate/
│   │   │   └── history/
│   │   └── layout.tsx
│   ├── (recruiter)/
│   │   ├── dashboard/
│   │   ├── verify/
│   │   │   └── [proofId]/
│   │   ├── requirements/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── credentials/
│   │   │   ├── upload/
│   │   │   └── analyze/
│   │   ├── proofs/
│   │   │   ├── generate/
│   │   │   └── verify/
│   │   └── midnight/
│   │       ├── submit/
│   │       └── status/
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn components
│   ├── student/
│   │   ├── PrivacyPassport.tsx
│   │   ├── CredentialCard.tsx
│   │   ├── ProofGenerator.tsx
│   │   └── ClaimBadge.tsx
│   ├── recruiter/
│   │   ├── VerificationPanel.tsx
│   │   ├── RequirementBuilder.tsx
│   │   └── CandidateLedger.tsx
│   └── shared/
│       ├── WalletConnect.tsx
│       ├── BlockchainStatus.tsx
│       └── AnimatedLayout.tsx
├── lib/
│   ├── midnight/
│   │   ├── client.ts             # Midnight SDK setup
│   │   ├── contracts.ts          # Smart contract interfaces
│   │   └── proofs.ts             # ZK proof generation
│   ├── ai/
│   │   ├── analyzer.ts           # Claude credential analyzer
│   │   └── claimExtractor.ts     # Claim parsing logic
│   ├── db/
│   │   └── prisma.ts
│   └── utils/
│       ├── hash.ts               # Credential hashing
│       └── proofLink.ts          # Proof URL generation
├── prisma/
│   └── schema.prisma
├── contracts/                    # Midnight Compact contracts
│   ├── credential_verifier.compact
│   └── proof_registry.compact
└── types/
    ├── credentials.ts
    ├── proofs.ts
    └── midnight.ts
```

---

## 4. Database Schema (PostgreSQL / Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Users ───────────────────────────────────────────────

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  role            UserRole @default(CANDIDATE)
  walletAddress   String?  @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  credentials     Credential[]
  claims          Claim[]
  proofs          Proof[]       @relation("CandidateProofs")
  verifications   Verification[] @relation("RecruiterVerifications")
  passport        PrivacyPassport?
}

enum UserRole {
  CANDIDATE
  RECRUITER
  ADMIN
}

// ─── Credentials ─────────────────────────────────────────

model Credential {
  id              String           @id @default(cuid())
  userId          String
  user            User             @relation(fields: [userId], references: [id])
  type            CredentialType
  title           String
  issuer          String?
  rawDataHash     String           // SHA-256 hash of original credential
  storageUrl      String?          // Encrypted file URL (never raw PII)
  analyzedAt      DateTime?
  status          AnalysisStatus   @default(PENDING)
  createdAt       DateTime         @default(now())

  claims          Claim[]
}

enum CredentialType {
  CERTIFICATE
  TRANSCRIPT
  GITHUB_PROFILE
  PROJECT
  RESUME
  MANUAL_ENTRY
}

enum AnalysisStatus {
  PENDING
  ANALYZING
  COMPLETE
  FAILED
}

// ─── Claims ──────────────────────────────────────────────

model Claim {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  credentialId    String?
  credential      Credential? @relation(fields: [credentialId], references: [id])
  claimType       ClaimType
  subject         String      // e.g., "Python", "Cybersecurity"
  predicate       String      // e.g., ">=", "==", "has"
  value           String      // e.g., "Intermediate", "3", "true"
  commitment      String      // ZK commitment hash
  isPublic        Boolean     @default(false)
  verifiedByAI    Boolean     @default(false)
  createdAt       DateTime    @default(now())

  proofClaims     ProofClaim[]
}

enum ClaimType {
  SKILL_PROFICIENCY
  PROJECT_COUNT
  CERTIFICATION
  HACKATHON_COUNT
  GPA_THRESHOLD
  EMPLOYMENT_DURATION
  CUSTOM
}

// ─── Privacy Passport ─────────────────────────────────────

model PrivacyPassport {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  publicClaimIds  String[] // Array of claim IDs set to public
  lastUpdated     DateTime @updatedAt
}

// ─── Proofs ───────────────────────────────────────────────

model Proof {
  id                String          @id @default(cuid())
  candidateId       String
  candidate         User            @relation("CandidateProofs", fields: [candidateId], references: [id])
  proofHash         String          @unique // ZK proof hash
  midnightTxId      String?         // Midnight blockchain transaction ID
  midnightStatus    MidnightStatus  @default(PENDING)
  shareToken        String          @unique @default(cuid()) // shareable URL token
  expiresAt         DateTime?
  createdAt         DateTime        @default(now())

  proofClaims       ProofClaim[]
  verifications     Verification[]
}

model ProofClaim {
  id          String  @id @default(cuid())
  proofId     String
  proof       Proof   @relation(fields: [proofId], references: [id])
  claimId     String
  claim       Claim   @relation(fields: [claimId], references: [id])
  zkProofData String  // Serialized ZK proof for this specific claim
}

enum MidnightStatus {
  PENDING
  SUBMITTED
  CONFIRMED
  FAILED
}

// ─── Verifications ────────────────────────────────────────

model Verification {
  id              String             @id @default(cuid())
  recruiterId     String
  recruiter       User               @relation("RecruiterVerifications", fields: [recruiterId], references: [id])
  proofId         String
  proof           Proof              @relation(fields: [proofId], references: [id])
  result          VerificationResult
  requirementSet  Json               // The requirement spec used
  verifiedAt      DateTime           @default(now())
}

enum VerificationResult {
  VERIFIED
  FAILED
  PARTIAL
  EXPIRED
}

// ─── Requirements ─────────────────────────────────────────

model RequirementSet {
  id              String   @id @default(cuid())
  recruiterId     String
  name            String
  description     String?
  requirements    Json     // Array of { claimType, subject, predicate, value }
  createdAt       DateTime @default(now())
}
```

---

## 5. API Endpoints

### Credential APIs
```
POST   /api/credentials/upload         Upload credential file → returns credentialId
POST   /api/credentials/analyze        Trigger AI analysis on credentialId
GET    /api/credentials                List user's credentials + status
GET    /api/credentials/[id]           Get credential details + claims
```

### Proof APIs
```
POST   /api/proofs/generate            Generate ZK proof for selected claim IDs
GET    /api/proofs/[shareToken]        Get proof summary (no raw data)
POST   /api/proofs/verify              Recruiter verifies proof against requirements
GET    /api/proofs/history             User's proof generation history
```

### Midnight APIs
```
POST   /api/midnight/submit            Submit proof hash to Midnight blockchain
GET    /api/midnight/status/[txId]     Poll Midnight transaction status
POST   /api/midnight/verify            On-chain verification call
```

### Claims APIs
```
GET    /api/claims                     Get user's extracted claims
PATCH  /api/claims/[id]/visibility     Toggle claim public/private
GET    /api/passport                   Get privacy passport state
```

---

## 6. Midnight Smart Contract (Compact)

```compact
// contracts/credential_verifier.compact

pragma language_version >= 0.14.0;

import CompactStandardLibrary;

// ─── State ───────────────────────────────────────────────

ledger ProofRegistry {
  proofHashes: Set<Bytes<32>>;
  verificationRecords: Map<Bytes<32>, VerificationRecord>;
}

struct VerificationRecord {
  candidateCommitment: Bytes<32>;  // Hash of candidate ID (anonymous)
  claimCommitments:    Bytes<32>[];
  timestamp:           Uint<64>;
  verified:            Boolean;
}

// ─── Circuits ────────────────────────────────────────────

// Register a proof on-chain (candidate action)
export circuit register_proof(
  proof_hash: Bytes<32>,
  candidate_commitment: Bytes<32>,
  claim_commitments: Bytes<32>[],
  timestamp: Uint<64>
): [] {
  // Ensure proof not already registered
  assert !ProofRegistry.proofHashes.member(proof_hash),
    "Proof already registered";

  // Add to registry
  ProofRegistry.proofHashes = ProofRegistry.proofHashes.insert(proof_hash);
  ProofRegistry.verificationRecords[proof_hash] = VerificationRecord {
    candidateCommitment: candidate_commitment,
    claimCommitments: claim_commitments,
    timestamp: timestamp,
    verified: true
  };
}

// Verify a proof exists and is valid (recruiter action)
export circuit verify_proof(
  proof_hash: Bytes<32>
): Boolean {
  return ProofRegistry.proofHashes.member(proof_hash);
}

// Skill threshold proof circuit
// Proves: candidate_skill_value >= threshold  WITHOUT revealing actual value
export circuit prove_skill_threshold(
  // Private witnesses (never on-chain)
  private actual_skill_level: Uint<8>,    // 0-100 scale
  private skill_salt:         Bytes<16>,

  // Public inputs
  threshold:                  Uint<8>,
  skill_commitment:           Bytes<32>   // Commitment to (actual_level + salt)
): Boolean {
  // Verify commitment matches
  const expected_commitment = hash_pair(actual_skill_level, skill_salt);
  assert expected_commitment == skill_commitment, "Invalid commitment";

  // Prove threshold (this is the ZK magic)
  return actual_skill_level >= threshold;
}
```

---

## 7. AI Credential Analysis (Claude API)

```typescript
// lib/ai/analyzer.ts

const SYSTEM_PROMPT = `
You are a credential analysis engine for ProofShield, a privacy-preserving 
verification platform. Your job is to extract structured, verifiable claims 
from uploaded credential documents.

Analyze the provided credential and return ONLY a JSON array of claims.
Each claim must follow this structure:

{
  "claimType": "SKILL_PROFICIENCY" | "PROJECT_COUNT" | "CERTIFICATION" | 
               "HACKATHON_COUNT" | "GPA_THRESHOLD" | "EMPLOYMENT_DURATION",
  "subject": "<skill name or credential name>",
  "predicate": ">=" | "==" | "has" | "count>=",
  "value": "<value as string>",
  "confidence": 0.0-1.0,
  "sourceEvidence": "<brief description of what in the doc proves this>"
}

Rules:
- Only extract claims you can confidently support from the document
- For skill levels: use scale Beginner / Intermediate / Advanced / Expert
- For counts: use integer strings ("3", "5")
- For GPA: use decimal strings ("8.5", "3.7")
- Never invent claims not evidenced in the document
- Return ONLY the JSON array, no other text
`.trim();

export async function analyzeCredential(
  credentialText: string,
  credentialType: string
): Promise<ExtractedClaim[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Credential Type: ${credentialType}\n\nContent:\n${credentialText}`
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text) as ExtractedClaim[];
}
```

---

## 8. ZK Proof Generation (Client-side)

```typescript
// lib/midnight/proofs.ts

export interface ZKProofInput {
  claimType: ClaimType;
  actualValue: number | string;   // Private — never leaves client
  threshold: number | string;     // Public — part of proof
  salt: string;                   // Random salt for commitment
}

export interface ZKProof {
  proofHash: string;
  commitment: string;
  publicInputs: Record<string, string>;
  midnightCircuit: string;
}

// Generate commitment (hash of value + salt)
export function generateCommitment(value: string, salt: string): string {
  return crypto.SHA256(value + salt).toString();
}

// Generate full ZK proof via Midnight SDK
export async function generateZKProof(input: ZKProofInput): Promise<ZKProof> {
  const salt = generateSalt();
  const commitment = generateCommitment(String(input.actualValue), salt);

  // Call Midnight's proof generation
  const proof = await midnightClient.prove({
    circuit: 'prove_skill_threshold',
    privateWitnesses: {
      actual_skill_level: input.actualValue,
      skill_salt: salt,
    },
    publicInputs: {
      threshold: input.threshold,
      skill_commitment: commitment,
    }
  });

  return {
    proofHash: proof.hash,
    commitment,
    publicInputs: { threshold: String(input.threshold), commitment },
    midnightCircuit: 'prove_skill_threshold',
  };
}
```

---

## 9. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# AI
ANTHROPIC_API_KEY="..."

# Midnight
MIDNIGHT_NETWORK_URL="..."
MIDNIGHT_CONTRACT_ADDRESS="..."
MIDNIGHT_DEPLOYER_KEY="..."

# Storage
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PROOF_LINK_SECRET="..."
```

---

## 10. Security Requirements

| Requirement | Implementation |
|---|---|
| No raw PII stored | Only SHA-256 hashes of credentials stored |
| Credential files encrypted | AES-256 encryption before S3 upload |
| Proof links time-limited | JWT with configurable expiry |
| ZK proofs client-side | Private witnesses never sent to server |
| Wallet auth | Midnight wallet signature for blockchain actions |
| API rate limiting | 10 req/min on proof generation |
| Audit trail | All verifications logged with timestamps |

---

## 11. Performance Requirements

| Metric | Target |
|---|---|
| AI analysis latency | < 10 seconds |
| ZK proof generation | < 15 seconds |
| Midnight tx confirmation | < 30 seconds (testnet) |
| Page load time | < 2 seconds |
| Verification API response | < 3 seconds |
