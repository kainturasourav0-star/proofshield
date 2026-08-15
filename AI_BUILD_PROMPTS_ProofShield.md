# AI Build Prompts — ProofShield
## How to Build the App Using AI Assistants (Claude, Cursor, v0, etc.)

Use these prompts in order. Each one builds on the last.
**Recommended tools:** Cursor IDE + Claude Sonnet (for code) · v0.dev (for UI) · Claude.ai (for planning)

---

## SETUP PROMPTS

### Prompt 0 — Project Bootstrap
> Use in: **Cursor / terminal**

```
Create a new Next.js 14 project called "proofshield" with TypeScript, Tailwind CSS, ESLint, 
App Router, src directory, and @/* import alias. Then install these packages:
- motion (Motion Dev, formerly Framer Motion)
- @anthropic-ai/sdk
- @prisma/client prisma
- next-auth @auth/prisma-adapter
- @tanstack/react-query
- uploadthing @uploadthing/react
- react-hook-form @hookform/resolvers zod
- nanoid date-fns crypto-js
- lucide-react
- shadcn/ui (run: npx shadcn@latest init with default settings, dark mode, slate base color)

After installing, create this folder structure under src/:
- app/(auth)/login, app/(auth)/register
- app/(student)/dashboard, app/(student)/credentials, app/(student)/passport, app/(student)/proofs
- app/(recruiter)/dashboard, app/(recruiter)/verify, app/(recruiter)/requirements
- app/api/credentials, app/api/proofs, app/api/midnight, app/api/claims
- components/student, components/recruiter, components/shared
- lib/midnight, lib/ai, lib/db, lib/utils
- contracts/
- types/

Then show me the complete directory tree.
```

---

### Prompt 1 — Database Schema
> Use in: **Cursor**

```
Create the Prisma schema for ProofShield, a privacy-preserving credential verification platform.

The schema needs these models:
1. User (id, email, name, role: CANDIDATE|RECRUITER|ADMIN, walletAddress, createdAt)
2. Credential (id, userId, type: CERTIFICATE|TRANSCRIPT|GITHUB_PROFILE|PROJECT|RESUME|MANUAL_ENTRY, 
   title, issuer, rawDataHash, storageUrl, analyzedAt, status: PENDING|ANALYZING|COMPLETE|FAILED)
3. Claim (id, userId, credentialId, claimType: SKILL_PROFICIENCY|PROJECT_COUNT|CERTIFICATION|
   HACKATHON_COUNT|GPA_THRESHOLD, subject, predicate, value, commitment, isPublic, verifiedByAI)
4. PrivacyPassport (id, userId unique, publicClaimIds String[])
5. Proof (id, candidateId, proofHash unique, midnightTxId, midnightStatus: PENDING|SUBMITTED|
   CONFIRMED|FAILED, shareToken unique default cuid(), expiresAt, createdAt)
6. ProofClaim (id, proofId, claimId, zkProofData)
7. Verification (id, recruiterId, proofId, result: VERIFIED|FAILED|PARTIAL|EXPIRED, 
   requirementSet Json, verifiedAt)
8. RequirementSet (id, recruiterId, name, description, requirements Json)

Use PostgreSQL. Add all necessary relations, indexes, and enums.
After writing schema, show the migration command to run.
```

---

### Prompt 2 — Auth System
> Use in: **Cursor**

```
Set up NextAuth.js v5 for ProofShield with:
1. Credentials provider (email + password with bcrypt)
2. Prisma adapter connected to our User model
3. JWT session strategy
4. Custom pages at /auth/login and /auth/register
5. Middleware to protect /student/* and /recruiter/* routes
6. Session types extended with user.id and user.role

Create:
- src/app/api/auth/[...nextauth]/route.ts
- src/middleware.ts
- src/types/next-auth.d.ts (type extensions)
- src/lib/db/prisma.ts (singleton client)

The middleware should redirect /student/* routes to /auth/login if not authenticated,
and redirect /recruiter/* routes similarly.
```

---

## BACKEND PROMPTS

### Prompt 3 — AI Credential Analyzer
> Use in: **Cursor**

```
Create the AI credential analysis system for ProofShield at src/lib/ai/analyzer.ts.

Use the Anthropic Claude SDK (@anthropic-ai/sdk) with model "claude-sonnet-4-6".

The analyzer takes credential content (text extracted from a PDF or typed by user) 
and returns an array of structured claims.

Each claim should have:
- claimType: "SKILL_PROFICIENCY" | "PROJECT_COUNT" | "CERTIFICATION" | "HACKATHON_COUNT" | "GPA_THRESHOLD"
- subject: the skill or certification name (e.g., "Python", "CompTIA Security+")
- predicate: ">=" | "==" | "has"
- value: "Beginner" | "Intermediate" | "Advanced" | "Expert" for skills, or integer strings for counts
- confidence: 0.0-1.0
- sourceEvidence: brief text explaining what proves this claim

Write a system prompt that:
1. Instructs the AI to only extract claims directly evidenced in the document
2. Never invent or hallucinate claims
3. Returns ONLY valid JSON (no markdown, no preamble)
4. Uses skill levels: Beginner / Intermediate / Advanced / Expert

Also create:
- src/app/api/credentials/analyze/route.ts: POST endpoint that accepts { credentialId, content },
  calls the analyzer, generates SHA-256 commitments for each claim with random salts,
  saves claims to database, updates credential status to COMPLETE

Test it with: curl -X POST /api/credentials/analyze -d '{"credentialId":"test","content":"Python developer with 3 years experience. CompTIA Security+ certified. Built 5 web apps."}'
```

---

### Prompt 4 — ZK Proof Engine
> Use in: **Cursor**

```
Create the ZK proof utilities for ProofShield at src/lib/midnight/proofs.ts.

Since we're in a hackathon and Midnight SDK may be partially available, 
create a hybrid implementation:

1. generateSalt(): returns a random 32-char hex string using crypto
2. generateCommitment(value: string, salt: string): SHA-256 hash of value+":"+salt
3. generateProofHash(commitments: string[]): SHA-256 of all commitments joined + timestamp
4. verifyClaimProof(commitment: string, proofHash: string): basic structural verification
5. MidnightClient class with:
   - registerProof(proofHash, commitments): attempts real Midnight SDK call, 
     falls back to simulated tx hash if SDK unavailable
   - verifyProof(proofHash): checks if proof exists

Then create src/app/api/proofs/generate/route.ts POST endpoint:
- Accepts { claimIds: string[], expiresInDays?: number }
- Validates claims belong to authenticated user
- Generates proof hash from claim commitments
- Creates Proof + ProofClaims records in database
- Calls submitToMidnight() async (don't await)
- Returns { proofId, shareToken, shareUrl, expiresAt }

And src/app/api/proofs/verify/route.ts POST endpoint:
- Accepts { shareToken, requirements: Array<{claimType, subject, predicate, value}> }
- Looks up proof by shareToken (include proofClaims → claim)
- Checks proof not expired
- Evaluates each requirement against actual claim values
- Returns { result: "VERIFIED"|"FAILED", candidateAlias: "#XXXX", requirementResults, privateDataDisclosed: false }
```

---

### Prompt 5 — File Upload
> Use in: **Cursor**

```
Set up Uploadthing for credential file uploads in ProofShield.

Create:
1. src/app/api/uploadthing/core.ts — FileRouter with a credentialUploader route:
   - Accepts: pdf (max 4MB) and image (max 4MB)
   - Middleware: checks NextAuth session
   - onUploadComplete: saves file metadata to Credential table, 
     triggers async AI text extraction + analysis

2. src/app/api/uploadthing/route.ts — the handler

3. src/lib/utils/extractText.ts — function to extract text from uploaded files:
   - For PDF: use pdf-parse library
   - For images: call Claude Vision API to describe/transcribe the content
   - For text: return as-is

4. src/components/student/CredentialUploader.tsx — client component using 
   @uploadthing/react's useUploadThing hook with:
   - Drag and drop zone (styled with dashed border, dark bg)
   - File type selector dropdown (Certificate, Transcript, GitHub URL, Manual Entry)
   - GitHub URL input (alternative to file upload)
   - Progress bar during upload
   - Success state with claim preview
   Use Motion Dev for smooth state transitions between idle/uploading/success/error states.
```

---

## FRONTEND PROMPTS

### Prompt 6 — Landing Page
> Use in: **v0.dev** or **Cursor**

```
Create a stunning dark-mode landing page for ProofShield, a privacy-preserving credential 
verification platform built on Midnight Network (ZK blockchain).

Design requirements:
- Background: near-black (#0a0f1e) with subtle grid pattern and radial emerald glow
- Primary accent: emerald (#10b981) for verified/trust elements
- Secondary accent: violet (#8b5cf6) for ZK/blockchain elements
- Font: Inter for UI, monospace for proof hashes

Sections to build (in order):

1. HERO: 
   Full viewport height. Center-aligned.
   - Animated badge: "Built on Midnight Network · Powered by ZK Proofs"
   - Headline (large, 80px): "Prove you're qualified. Reveal nothing."
     ("nothing." should be emerald colored)
   - Subtext: 1-2 lines about privacy-preserving verification
   - Two CTA buttons: "Start Proving" (emerald filled) + "Verify a Candidate" (ghost)
   - Floating animated proof card in background showing redacted credentials

2. SOCIAL PROOF STATS:
   Row of 3 animated counters: "10,000+ Proofs Generated" · "500+ Companies Trust" · "0 Data Exposed"

3. HOW IT WORKS:
   5-step vertical flow with connecting animated lines:
   Upload Credentials → AI Extracts Claims → Generate ZK Proof → Midnight Records → Recruiter Verifies

4. PRIVACY PASSPORT PREVIEW:
   Side-by-side: Left shows "Traditional Resume" (red, lots of PII), 
   Right shows "ProofShield Passport" (green, only verified claims visible)

5. FEATURES GRID:
   3x2 grid of feature cards with icons:
   - Zero Data Exposure (🔐), AI-Powered Analysis (🤖), Midnight Blockchain (⛓️),
   - Selective Disclosure (🎯), Instant Verification (⚡), Privacy Passport (🛡️)

6. CTA SECTION:
   Dark card with glow: "Ready to prove your worth without exposing your data?"
   Two buttons. Emerald glow background.

7. FOOTER: Minimal. Logo + tagline + nav links.

Use Motion Dev (motion/react) for all animations:
- Hero words animate in one by one with stagger
- Stats count up on scroll into view
- How-it-works steps slide in from alternating sides
- Feature cards scale up on hover
- Buttons glow on hover with box-shadow animation
```

---

### Prompt 7 — Student Dashboard
> Use in: **Cursor**

```
Build the Student Dashboard for ProofShield at src/app/(student)/dashboard/page.tsx.

Layout: Dark sidebar (240px) + main content area.

Sidebar navigation items with Lucide icons:
- Dashboard (Home icon) - active
- My Credentials (FileText)
- Privacy Passport (Shield)
- Generate Proof (Zap)
- Proof History (Clock)
- Settings (Settings)

Main content:
1. Top bar: "Welcome back, [name]" + wallet address (truncated) + Connect Wallet button if not connected

2. Stats row (4 cards):
   - Credentials Uploaded: [N]
   - Claims Extracted: [N]  
   - Proofs Generated: [N]
   - Verifications: [N]
   Each card has icon, number, and subtle background glow

3. Credentials section:
   "Your Credentials" heading + "Upload New" button
   Grid of CredentialCard components (empty state if none)
   
4. Recent Proofs section:
   Table with columns: Proof ID, Created, Claims, Status (Midnight chip), Expires, Share

All data fetched from /api/credentials and /api/proofs/history using TanStack Query.

Use Motion Dev: cards fade up with stagger on mount. Numbers count up. 
Empty states have a gentle pulse animation.

Create alongside:
- src/components/student/CredentialCard.tsx: card showing credential title, type badge, 
  status badge (PENDING/ANALYZING/COMPLETE), claim count, "View Claims" button
- src/components/shared/StatsCard.tsx: reusable stat card with icon, value, label
```

---

### Prompt 8 — Privacy Passport
> Use in: **Cursor**

```
Build the Privacy Passport page at src/app/(student)/passport/page.tsx.

This is the most visually important page in ProofShield — it shows the candidate's 
verifiable claims with a toggle between public (provable) and private (hidden).

Component: PrivacyPassport card design:
- Dark card (bg-slate-900), max-w-md, centered
- Header: Shield icon + "Privacy Passport" title + "Candidate #XXXX" 
- Two sections separated by a divider:
  
  TOP: "🔓 Provable" section
  Shows all claims where isPublic=true
  Each claim: subject name + "✓ [value]" + green unlock icon
  
  BOTTOM: "🔒 Private" section  
  Shows hidden fields: Full Name, Email, Phone, CGPA, Address, GPA
  Each row: field name + lock icon, everything grayed out

Animation requirements (Motion Dev):
- When user clicks a claim to toggle public/private, it slides from one section to the other
  with a satisfying spring animation. Use layout animation (motion.div with layout prop).
- Lock icon rotates and morphs to unlock icon on toggle (AnimatePresence mode="wait")
- The whole card has a subtle glow that pulses when a claim is toggled

Controls:
- Toggle button per claim row to move it between public/private
- "Generate Proof from Public Claims" button at bottom
- "Reset to Defaults" link

Fetch claims from /api/claims. 
PATCH /api/claims/[id]/visibility when toggled.
Optimistic UI updates.

Below the passport card, show a "Generate Proof" call-to-action section with preview 
of what the recruiter would see.
```

---

### Prompt 9 — Proof Generator
> Use in: **Cursor**

```
Build the Proof Generation flow for ProofShield.

Page: src/app/(student)/proofs/generate/page.tsx

Step 1 — Claim Selection (initial state):
- Heading: "Build Your Proof"
- Subtext: "Select which claims to include. Only what you choose will be provable."
- List of all user's public claims as checkboxes:
  [✓] Python ≥ Intermediate
  [✓] Cybersecurity ≥ Advanced  
  [ ] CGPA ≥ 8.5 (can exclude)
  [✓] Projects ≥ 3
- Expiry selector: "7 days / 30 days / 90 days / No expiry"
- Preview panel on right: "Recruiter will see:"
  (updates live as checkboxes change)
- "Generate ZK Proof" button (emerald, full-width on mobile)

Step 2 — Generating (loading state, replaces the form):
Create component: src/components/student/ProofGenerating.tsx
4-step animated progress:
  Step 1: "Creating cryptographic commitments" (spinner → checkmark)
  Step 2: "Computing Zero-Knowledge proof" (spinner → checkmark)  
  Step 3: "Submitting to Midnight Network" (spinner → checkmark)
  Step 4: "Awaiting blockchain confirmation" (spinner → checkmark)

Animated shield logo at top that rotates gently.
Each step completes with a spring-scale green checkmark.
Progress takes ~10 seconds total (simulate timing).

Step 3 — Success:
- Big green checkmark animation
- "✅ Proof Generated Successfully!"
- Proof ID: #PSH-2024-XXXX (monospace font)
- Midnight TX: 0x8f2a... (clickable, links to testnet explorer)
- Expiry date shown
- Shareable link with copy button
- "Share via Email" button
- "Back to Dashboard" link

POST to /api/proofs/generate on form submit.
Show step 2 while request is in flight.
```

---

### Prompt 10 — Recruiter Dashboard & Verification
> Use in: **Cursor**

```
Build the Recruiter Dashboard and verification flow.

1. Recruiter Dashboard: src/app/(recruiter)/dashboard/page.tsx
   Same sidebar layout as student but with recruiter navigation:
   - Dashboard, Verify Candidate, My Requirements, Verification Ledger, Settings

   Stats cards: Total Verifications, Verified Count, Failed Count, Saved Requirement Sets

   Recent Verifications table:
   Candidate ID | Date | Requirements | Result badge | View Details

2. Verify Page: src/app/(recruiter)/verify/page.tsx
   
   Input step:
   - Large text input: "Paste candidate proof link or ID"
   - Below: "Your requirement set" — dropdown of saved sets OR "Build a new requirement"
   - Inline requirement builder:
     Add Requirement button → modal with:
     Skill dropdown + Level dropdown + Add button
     Shows added requirements as chips
   - "Verify Now" big button
   
   Result step (animate in):
   Create: src/components/recruiter/VerificationResult.tsx
   
   The result card:
   - Top band: VERIFIED (emerald) or NOT QUALIFIED (red) with icon
   - Candidate alias: "#A81F" (never real name)
   - Midnight TX badge (blue, clickable)
   - Requirements table: Python ≥ Intermediate ✓PASS, etc.
   - Bottom band: "🔒 Private credentials not disclosed · Verified on Midnight Network"
   
   Animations:
   - Card fades+scales in with spring
   - Each requirement result slides in with stagger delay
   - PASS/FAIL indicators pop with scale spring
   - Box shadow glow in green (verified) or red (failed)
   
   POST to /api/proofs/verify on submit.
   Save verification to /api/verifications on result.
```

---

### Prompt 11 — Public Verify Page
> Use in: **Cursor**

```
Create the public proof verification page at src/app/verify/[shareToken]/page.tsx.

This page is accessible WITHOUT authentication — anyone with the link can verify the proof.
It's the page candidates share with recruiters.

The page shows:
- ProofShield logo + "Proof Verification" heading
- Proof ID and share token prominently
- Blockchain status badge (Midnight Network · CONFIRMED)
- The list of PROVEN claims (public, no values revealed — just "✓ Meets requirement")
- What IS NOT shown: any private data, actual values, personal information
- Expiry status
- "Verify Against Your Requirements" CTA button (for recruiters to log in and add requirements)

If proof is expired: show a clear "This proof has expired" state with the expiry date.
If proof not found: show a friendly 404 state.

This page should be embeddable and shareable — make it look clean, trustworthy, and professional.
It's the "receipt" that proves a candidate's qualifications.

Server component — fetch proof data server-side at GET /api/proofs/[shareToken].
Add Open Graph meta tags so link previews look good in Slack/email.
```

---

### Prompt 12 — Midnight Integration
> Use in: **Cursor**

```
Implement the Midnight Network integration for ProofShield.

Create src/lib/midnight/client.ts with a MidnightClient class.

Since Midnight SDK may have limited availability during hackathon, implement a two-layer approach:

Layer 1 — Real Midnight SDK (attempt this first):
Use @midnight-ntwrk packages if available.
The client should:
- Connect to Midnight testnet
- Call the credential_verifier contract's register_proof circuit
- Return the transaction ID
- Poll for confirmation

Layer 2 — Simulated fallback (if SDK not available):
- Generate a realistic-looking tx hash: 0x + 64 random hex chars
- Save it with status SUBMITTED
- After 3 seconds, update to CONFIRMED
- Log to console: "[MIDNIGHT SIMULATED] Proof registered: 0x..."

Create src/app/api/midnight/submit/route.ts:
POST endpoint that accepts { proofId, proofHash, commitments }
Calls MidnightClient.registerProof()
Updates Proof.midnightTxId and Proof.midnightStatus in database
Returns { txId, status }

Create src/app/api/midnight/status/[txId]/route.ts:
GET endpoint that checks transaction status
If real Midnight: polls the network
If simulated: returns CONFIRMED after delay

Create src/components/shared/BlockchainStatus.tsx:
Animated status badge showing PENDING (amber pulse) / SUBMITTED (blue pulse) / CONFIRMED (green solid)
Uses useQuery to poll /api/midnight/status/[txId] every 3 seconds until CONFIRMED
```

---

### Prompt 13 — Final Polish
> Use in: **Cursor**

```
Final polish pass for ProofShield hackathon demo:

1. Add a loading skeleton to all data-fetching pages using shadcn Skeleton component.
   Apply to: dashboard stats, credentials list, proof history table.

2. Add toast notifications (shadcn Sonner) for:
   - "Credential uploaded successfully"
   - "AI analysis complete — N claims extracted"  
   - "Proof generated and submitted to Midnight"
   - "Proof copied to clipboard"
   - Error states

3. Add proper empty states to:
   - Student dashboard (no credentials): Shield icon + "Upload your first credential"
   - Proof history (no proofs): Zap icon + "Generate your first proof"
   - Recruiter ledger (no verifications): Check icon + "Verify your first candidate"

4. Make the layout fully responsive:
   - Sidebar collapses to bottom tab bar on mobile
   - Proof card stacks vertically on mobile
   - Verification result readable on mobile

5. Add the animated "Proof, not exposure." tagline to the footer of every authenticated page.

6. Seed the database with demo data:
   Create src/scripts/seed.ts with a demo candidate user who has:
   - 3 credentials (one cert, one transcript, one GitHub)
   - 6 extracted claims across skill proficiency and certifications
   - 2 generated proofs (one active, one expired)
   Run with: npx ts-node src/scripts/seed.ts

7. Set up the hackathon demo account:
   Email: demo@proofshield.io / Password: demo1234
   Pre-populated with the seed data above.
```

---

## DEPLOYMENT PROMPT

### Prompt 14 — Deploy
> Use in: **terminal**

```
Help me deploy ProofShield to production on Vercel.

Steps needed:
1. Push code to GitHub: git init, git add ., git commit -m "ProofShield MVP", git push
2. Import to Vercel: vercel --prod
3. Set up production PostgreSQL (Neon free tier)
4. Run migrations on production DB: npx prisma migrate deploy
5. Configure all environment variables on Vercel dashboard
6. Set up custom domain if available
7. Test the full flow: upload credential → AI analysis → generate proof → verify as recruiter

Also set up a demo deployment checklist:
- [ ] Demo user seeded (demo@proofshield.io)
- [ ] 3 credentials pre-uploaded
- [ ] 5 claims extracted
- [ ] 1 shareable proof link ready
- [ ] Recruiter account ready (recruiter@testcompany.io)
- [ ] Midnight testnet wallet connected
- [ ] All animations working
- [ ] Mobile responsive confirmed
- [ ] Proof link opens correctly without auth
```

---

## QUICK REFERENCE

| What to build | Use this tool | Prompt # |
|---|---|---|
| Project setup | Terminal + Cursor | 0 |
| Database | Cursor | 1 |
| Auth | Cursor | 2 |
| AI analyzer | Cursor | 3 |
| ZK proof system | Cursor | 4 |
| File upload | Cursor | 5 |
| Landing page | v0.dev or Cursor | 6 |
| Student dashboard | Cursor | 7 |
| Privacy passport | Cursor | 8 |
| Proof generator | Cursor | 9 |
| Recruiter + verify | Cursor | 10 |
| Public verify page | Cursor | 11 |
| Midnight integration | Cursor | 12 |
| Polish + seed | Cursor | 13 |
| Deploy | Terminal | 14 |

**Total estimated build time:** 16–20 hours with AI assistance
