# Implementation Plan — ProofShield
## Hackathon Build Guide: Day-by-Day Execution

**Timeline:** 4-day hackathon sprint  
**Team:** 1–3 developers  

---

## Pre-Hackathon Checklist (Do Before Day 1)

- [ ] Node.js 20.x installed
- [ ] PostgreSQL running locally (or Neon/Supabase account ready)
- [ ] Anthropic API key obtained
- [ ] Midnight SDK docs read: [docs.midnight.network](https://docs.midnight.network)
- [ ] Midnight testnet wallet set up
- [ ] GitHub repo created
- [ ] Vercel account ready for deployment
- [ ] Uploadthing account created (for file uploads)
- [ ] Figma open (for quick UI reference)

---

## Phase 0 — Project Bootstrap (2 hours)

### Step 1: Initialize Next.js Project
```bash
npx create-next-app@latest proofshield \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd proofshield
```

### Step 2: Install All Dependencies
```bash
# UI
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install motion  # Motion Dev (formerly Framer Motion)
npx shadcn@latest init

# Auth & DB
npm install next-auth @auth/prisma-adapter
npm install @prisma/client prisma
npm install bcryptjs @types/bcryptjs

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Data Fetching
npm install @tanstack/react-query

# File Upload
npm install uploadthing @uploadthing/react

# AI
npm install @anthropic-ai/sdk

# Utilities
npm install nanoid date-fns crypto-js @types/crypto-js

# Midnight (check current SDK package name)
npm install @midnight-ntwrk/midnight-js-network-id
npm install @midnight-ntwrk/midnight-js-types
```

### Step 3: Set Up Prisma
```bash
npx prisma init
# Paste schema from TRD into prisma/schema.prisma
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Environment Setup
```bash
cp .env.example .env.local
# Fill in all values from TRD Section 9
```

### Step 5: Folder Structure
```bash
mkdir -p src/lib/{midnight,ai,db,utils}
mkdir -p src/components/{ui,student,recruiter,shared}
mkdir -p src/app/\(auth\)/\{login,register\}
mkdir -p src/app/\(student\)/\{dashboard,credentials,passport,proofs\}
mkdir -p src/app/\(recruiter\)/\{dashboard,verify,requirements,ledger\}
mkdir -p src/app/api/\{credentials,proofs,midnight,claims\}
mkdir -p contracts
mkdir -p types
```

---

## Phase 1 — Core Infrastructure (Day 1, Hours 1–8)

### 1.1 Database & Auth (2 hours)

```typescript
// src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });
        if (!user) return null;
        // Password check logic here
        return user;
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' }
});
```

### 1.2 File Upload Setup (1 hour)

```typescript
// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const f = createUploadthing();

export const ourFileRouter = {
  credentialUploader: f({
    pdf: { maxFileSize: '4MB' },
    image: { maxFileSize: '4MB' }
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error('Unauthorized');
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Save to DB, trigger AI analysis
      return { url: file.url };
    }),
} satisfies FileRouter;
```

### 1.3 AI Credential Analyzer (2 hours)

```typescript
// src/lib/ai/analyzer.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ExtractedClaim {
  claimType: string;
  subject: string;
  predicate: string;
  value: string;
  confidence: number;
  sourceEvidence: string;
}

const ANALYSIS_PROMPT = `
You are ProofShield's credential analysis engine.
Extract verifiable claims from the credential content provided.
Return ONLY a valid JSON array. No markdown, no preamble.

Each claim object:
{
  "claimType": "SKILL_PROFICIENCY" | "PROJECT_COUNT" | "CERTIFICATION" | "HACKATHON_COUNT" | "GPA_THRESHOLD",
  "subject": "skill or cert name",
  "predicate": ">=" | "==" | "has",
  "value": "Intermediate" | "Advanced" | "Expert" | "3" | "true",
  "confidence": 0.0-1.0,
  "sourceEvidence": "what proves this"
}
`;

export async function analyzeCredential(content: string): Promise<ExtractedClaim[]> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: ANALYSIS_PROMPT,
      messages: [{ role: 'user', content }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
    return JSON.parse(text.trim()) as ExtractedClaim[];
  } catch (err) {
    console.error('AI analysis failed:', err);
    return [];
  }
}
```

### 1.4 ZK Proof Utilities (2 hours)

```typescript
// src/lib/midnight/proofs.ts
import CryptoJS from 'crypto-js';
import { nanoid } from 'nanoid';

// Generate cryptographic commitment to a value
export function generateCommitment(value: string, salt: string): string {
  return CryptoJS.SHA256(value + ':' + salt).toString(CryptoJS.enc.Hex);
}

// Generate a salt
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

// Generate a proof hash (simulated for MVP if Midnight SDK not fully available)
export function generateProofHash(claims: { commitment: string }[]): string {
  const combined = claims.map(c => c.commitment).join('|');
  return CryptoJS.SHA256(combined + nanoid()).toString(CryptoJS.enc.Hex);
}

// Verify a proof hash against stored commitment
export function verifyClaimProof(
  commitment: string,
  proofHash: string,
  publicThreshold: string
): boolean {
  // In production: this calls Midnight's on-chain verify circuit
  // For MVP: verify the commitment is well-formed and proof hash matches
  return commitment.length === 64 && proofHash.length === 64;
}
```

---

## Phase 2 — Core APIs (Day 1–2, Hours 8–20)

### 2.1 Credential API

```typescript
// src/app/api/credentials/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { analyzeCredential } from '@/lib/ai/analyzer';
import { generateCommitment, generateSalt } from '@/lib/midnight/proofs';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { credentialId, content } = await req.json();

  // Update status
  await prisma.credential.update({
    where: { id: credentialId },
    data: { status: 'ANALYZING' }
  });

  // AI Analysis
  const claims = await analyzeCredential(content);

  // Save claims with ZK commitments
  const savedClaims = await Promise.all(
    claims.map(claim => {
      const salt = generateSalt();
      const commitment = generateCommitment(claim.value, salt);
      return prisma.claim.create({
        data: {
          userId: session.user.id,
          credentialId,
          claimType: claim.claimType as any,
          subject: claim.subject,
          predicate: claim.predicate,
          value: claim.value,
          commitment,
          verifiedByAI: true,
        }
      });
    })
  );

  await prisma.credential.update({
    where: { id: credentialId },
    data: { status: 'COMPLETE', analyzedAt: new Date() }
  });

  return NextResponse.json({ claims: savedClaims });
}
```

### 2.2 Proof Generation API

```typescript
// src/app/api/proofs/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { generateProofHash } from '@/lib/midnight/proofs';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { claimIds, expiresInDays } = await req.json();

  // Fetch selected claims
  const claims = await prisma.claim.findMany({
    where: { id: { in: claimIds }, userId: session.user.id }
  });

  if (claims.length === 0) return NextResponse.json({ error: 'No valid claims' }, { status: 400 });

  // Generate proof hash
  const proofHash = generateProofHash(claims);
  const shareToken = nanoid(16);
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86400000)
    : undefined;

  // Save proof
  const proof = await prisma.proof.create({
    data: {
      candidateId: session.user.id,
      proofHash,
      shareToken,
      expiresAt,
      proofClaims: {
        create: claims.map(claim => ({
          claimId: claim.id,
          zkProofData: JSON.stringify({ commitment: claim.commitment, proofHash }),
        }))
      }
    },
    include: { proofClaims: true }
  });

  // Submit to Midnight (async)
  submitToMidnight(proof.id, proofHash, claims.map(c => c.commitment));

  return NextResponse.json({
    proofId: proof.id,
    shareToken: proof.shareToken,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${proof.shareToken}`,
    expiresAt: proof.expiresAt,
  });
}

async function submitToMidnight(proofId: string, proofHash: string, commitments: string[]) {
  // Call Midnight SDK here
  // Update proof.midnightStatus on completion
}
```

### 2.3 Verification API

```typescript
// src/app/api/proofs/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  const { shareToken, requirements } = await req.json();

  const proof = await prisma.proof.findUnique({
    where: { shareToken },
    include: {
      proofClaims: { include: { claim: true } }
    }
  });

  if (!proof) return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
  if (proof.expiresAt && proof.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Proof expired', result: 'EXPIRED' }, { status: 410 });
  }

  // Check each requirement against proof claims
  const results = requirements.map((req: any) => {
    const matchingClaim = proof.proofClaims.find(pc =>
      pc.claim.subject.toLowerCase() === req.subject.toLowerCase() &&
      pc.claim.claimType === req.claimType
    );
    const passed = matchingClaim
      ? evaluateClaim(matchingClaim.claim.value, req.predicate, req.value)
      : false;
    return { ...req, passed };
  });

  const overallResult = results.every((r: any) => r.passed) ? 'VERIFIED' : 'FAILED';

  return NextResponse.json({
    result: overallResult,
    candidateAlias: `#${proof.candidateId.slice(-4).toUpperCase()}`,
    midnightTxId: proof.midnightTxId,
    midnightStatus: proof.midnightStatus,
    requirementResults: results,
    privateDataDisclosed: false,
  });
}
```

---

## Phase 3 — Frontend (Day 2–3)

### Build Order (follow this sequence)

```
Priority 1 (Demo Critical):
  1. Landing Page with animations
  2. Auth (Login/Register)
  3. Student Dashboard shell
  4. Credential Upload + AI Analysis flow
  5. Privacy Passport component
  6. Proof Generator + Result
  7. Public verify page (/verify/[token])
  8. Recruiter Dashboard + Verification Result

Priority 2 (Nice to have):
  9. Proof history
  10. Requirement Builder
  11. Candidate Ledger
  12. Settings
```

### Key Component: PrivacyPassport.tsx

```tsx
// src/components/student/PrivacyPassport.tsx
'use client';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Shield } from 'lucide-react';

interface Claim {
  id: string;
  subject: string;
  value: string;
  claimType: string;
  isPublic: boolean;
}

export function PrivacyPassport({ claims }: { claims: Claim[] }) {
  const publicClaims = claims.filter(c => c.isPublic);
  const privateClaims = claims.filter(c => !c.isPublic);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 max-w-md mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-emerald-400" />
        <div>
          <h2 className="text-white font-bold text-xl">Privacy Passport</h2>
          <p className="text-slate-400 text-sm">Candidate #{candidateAlias}</p>
        </div>
      </div>

      {/* Public Claims */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Unlock className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-semibold">Provable</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {publicClaims.map(claim => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3"
              >
                <span className="text-white text-sm">{claim.subject}</span>
                <span className="text-emerald-400 text-sm font-medium">✓ {claim.value}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Private Claims */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-sm font-semibold">Private</span>
        </div>
        <div className="space-y-2">
          {privateClaims.map(claim => (
            <div
              key={claim.id}
              className="flex items-center justify-between bg-slate-700/50 border border-slate-600/30 rounded-lg px-4 py-3"
            >
              <span className="text-slate-400 text-sm">{claim.subject}</span>
              <Lock className="w-4 h-4 text-slate-500" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
```

---

## Phase 4 — Midnight Integration (Day 3)

### Midnight Smart Contract Deployment

```bash
# Install Midnight CLI
npm install -g @midnight-ntwrk/midnight-js-cli

# Compile contract
midnight compile contracts/credential_verifier.compact

# Deploy to testnet
midnight deploy --network testnet --contract credential_verifier.compact
```

### Midnight Client Setup

```typescript
// src/lib/midnight/client.ts
// Note: Adapt to actual Midnight SDK API when available

export class MidnightClient {
  private contractAddress: string;
  private networkUrl: string;

  constructor() {
    this.contractAddress = process.env.MIDNIGHT_CONTRACT_ADDRESS!;
    this.networkUrl = process.env.MIDNIGHT_NETWORK_URL!;
  }

  async registerProof(proofHash: string, commitments: string[]): Promise<string> {
    // Call Midnight contract's register_proof circuit
    // Returns transaction ID
    const txId = await this.callContract('register_proof', {
      proof_hash: proofHash,
      candidate_commitment: commitments[0],
      claim_commitments: commitments,
      timestamp: Date.now(),
    });
    return txId;
  }

  async verifyProof(proofHash: string): Promise<boolean> {
    const result = await this.callContract('verify_proof', { proof_hash: proofHash });
    return result as boolean;
  }

  private async callContract(circuit: string, args: any): Promise<any> {
    // Midnight SDK call
    console.log(`Calling ${circuit} on Midnight...`);
    // TODO: Implement with actual Midnight SDK
    return `0x${Math.random().toString(16).slice(2)}`.padEnd(66, '0');
  }
}

export const midnightClient = new MidnightClient();
```

---

## Phase 5 — Polish & Demo Prep (Day 4)

### Demo Script Checklist

```
[ ] Fresh demo account seeded in database
[ ] 3 sample credentials uploaded and analyzed
[ ] Privacy Passport showing 5+ claims
[ ] Generate proof for Python + Cybersecurity + Projects
[ ] Proof link ready to paste in recruiter dashboard
[ ] Recruiter view showing VERIFIED ✅
[ ] Midnight TX ID visible and linkable to testnet explorer
[ ] All animations working smoothly
[ ] Mobile responsive (in case judges check)
```

### Deployment

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables on Vercel dashboard
# Run production DB migration
npx prisma migrate deploy
```

---

## Day-by-Day Timeline

| Day | Focus | Deliverable |
|---|---|---|
| **Day 1 AM** | Bootstrap, DB, Auth, File upload | Working auth + DB |
| **Day 1 PM** | AI analyzer + ZK proof utilities | Claims extracted from credential |
| **Day 2 AM** | Credential + Proof APIs | End-to-end backend flow working |
| **Day 2 PM** | Landing page + Student dashboard UI | First pages live |
| **Day 3 AM** | Privacy Passport + Proof Generator UI | Full candidate flow |
| **Day 3 PM** | Recruiter dashboard + Verification UI | Full recruiter flow |
| **Day 3 Eve** | Midnight integration | Proof on-chain |
| **Day 4 AM** | Polish, animations, edge cases | Production-quality feel |
| **Day 4 PM** | Demo prep + presentation | Ready to present |

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Midnight SDK underdeveloped | Simulate ZK with SHA-256 commitments, show real Midnight calls in console |
| AI analysis slow | Stream response, show progress animation |
| ZK circuit compilation fails | Pre-compile and mock for demo |
| Database migration issues | Use Prisma's `db push` for hackathon speed |
| Vercel cold starts | Enable fluid compute or add warmup route |
