# App Flow — ProofShield
## Complete User Journey & Screen Flow

---

## 1. High-Level Flow Map

```
                        ┌─────────────────┐
                        │   Landing Page   │
                        │  "Proof, not    │
                        │   exposure."    │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
             ┌──────▼──────┐         ┌────────▼────────┐
             │   I'm a     │         │   I'm a         │
             │  Candidate  │         │   Recruiter     │
             └──────┬──────┘         └────────┬────────┘
                    │                         │
             ┌──────▼──────┐         ┌────────▼────────┐
             │   Register  │         │    Register     │
             │  + Connect  │         │   + Connect     │
             │   Wallet    │         │    Wallet       │
             └──────┬──────┘         └────────┬────────┘
                    │                         │
             ┌──────▼──────┐         ┌────────▼────────┐
             │  STUDENT    │         │  RECRUITER      │
             │  DASHBOARD  │         │  DASHBOARD      │
             └──────┬──────┘         └────────┬────────┘
                    │                         │
          ┌─────────┼─────────┐      ┌────────┼────────┐
          │         │         │      │        │        │
   ┌──────▼──┐ ┌────▼────┐ ┌──▼───┐ ┌▼─────┐ ┌▼─────┐ ┌▼────┐
   │Upload   │ │Privacy  │ │Proof │ │Verify│ │Build │ │View │
   │Creds    │ │Passport │ │Gen.  │ │Proof │ │Req.  │ │Hist.│
   └──────┬──┘ └────┬────┘ └──┬───┘ └─┬────┘ └──────┘ └─────┘
          │         │         │        │
          ▼         ▼         ▼        ▼
       AI           Visual    ZK       On-chain
       Analysis     Claims    Proof    Verification
          │                   │        │
          └───────────────────┘        │
                    │                  │
                    ▼                  ▼
               Midnight Network ←──────┘
               (Proof on-chain)
```

---

## 2. Candidate Flow — Detailed

### Flow 2A: Onboarding & Setup

```
[Screen 1] Landing Page
    │  Click "Get Started as Candidate"
    ▼
[Screen 2] Register / Login
    │  Email + Password  OR  Google OAuth
    ▼
[Screen 3] Role Selection
    │  "I am a: [Candidate] [Recruiter]"
    ▼
[Screen 4] Wallet Connection
    │  Connect Midnight Wallet
    │  (MetaMask-style popup)
    │  ✓ Wallet connected
    ▼
[Screen 5] Student Dashboard (Empty State)
    │  "Upload your first credential to get started"
    │  [+ Upload Credential]
```

---

### Flow 2B: Credential Upload & AI Analysis

```
[Screen 5] Student Dashboard
    │  Click "+ Upload Credential"
    ▼
[Screen 6] Credential Upload Modal
    │  ┌─────────────────────────────────┐
    │  │  Upload Credential              │
    │  │                                 │
    │  │  Type: [Certificate ▼]         │
    │  │                                 │
    │  │  ┌─────────────────────────┐   │
    │  │  │   Drag & Drop PDF/PNG   │   │
    │  │  │   or Click to Upload    │   │
    │  │  └─────────────────────────┘   │
    │  │                                 │
    │  │  OR  Enter GitHub URL          │
    │  │  OR  Type description          │
    │  │                                 │
    │  │  [Upload & Analyze]            │
    │  └─────────────────────────────────┘
    │
    ▼
[Screen 7] AI Analysis In Progress
    │  ┌─────────────────────────────────┐
    │  │  🤖 Analyzing your credential…  │
    │  │                                 │
    │  │  ████████████░░░░  68%          │
    │  │                                 │
    │  │  Extracting skill claims...     │
    │  └─────────────────────────────────┘
    │
    ▼
[Screen 8] Claims Review
    │  ┌─────────────────────────────────┐
    │  │  AI found 5 claims              │
    │  │                                 │
    │  │  ✓ Python ≥ Intermediate        │
    │  │  ✓ Cybersecurity ≥ Advanced     │
    │  │  ✓ Has "CompTIA Security+" cert │
    │  │  ✓ Projects ≥ 3                 │
    │  │  ✓ Hackathons ≥ 2               │
    │  │                                 │
    │  │  [Approve Claims] [Edit]        │
    │  └─────────────────────────────────┘
    │
    ▼
[Screen 9] Dashboard (Updated)
    │  Credential card added
    │  Claims visible in Privacy Passport
```

---

### Flow 2C: Privacy Passport View

```
[Screen 9] Dashboard
    │  Click "Privacy Passport"
    ▼
[Screen 10] Privacy Passport
    ┌────────────────────────────────────────┐
    │          PRIVACY PASSPORT              │
    │  Candidate #A81F                       │
    │                                        │
    │  🔓 Public (Provable)                  │
    │  ┌──────────────────────────────────┐  │
    │  │ 🐍 Python        ✓ Intermediate  │  │
    │  │ 🔐 Cybersecurity ✓ Advanced      │  │
    │  │ 📜 CompTIA Sec+  ✓ Certified     │  │
    │  │ 🏗️  Projects      ✓ 3+           │  │
    │  │ 🏆 Hackathons    ✓ 2+            │  │
    │  └──────────────────────────────────┘  │
    │                                        │
    │  🔒 Private (Hidden)                   │
    │  ┌──────────────────────────────────┐  │
    │  │ 👤 Full Name        🔒           │  │
    │  │ 📧 Email            🔒           │  │
    │  │ 📱 Phone            🔒           │  │
    │  │ 🎓 CGPA             🔒           │  │
    │  │ 📍 Address          🔒           │  │
    │  └──────────────────────────────────┘  │
    │                                        │
    │  [Toggle Visibility] [Generate Proof]  │
    └────────────────────────────────────────┘
```

---

### Flow 2D: Proof Generation

```
[Screen 10] Privacy Passport
    │  Click "Generate Proof"
    ▼
[Screen 11] Proof Builder
    │  ┌─────────────────────────────────────┐
    │  │  Build Your Proof                   │
    │  │                                     │
    │  │  Select claims to prove:            │
    │  │                                     │
    │  │  [✓] Python ≥ Intermediate          │
    │  │  [✓] Cybersecurity ≥ Advanced       │
    │  │  [ ] CompTIA Security+ (excluded)   │
    │  │  [✓] Projects ≥ 3                   │
    │  │                                     │
    │  │  Proof will show to recruiter:      │
    │  │  ✓ Python: meets requirement        │
    │  │  ✓ Cybersecurity: meets requirement │
    │  │  ✓ Projects: meets requirement      │
    │  │  🔒 Everything else: hidden         │
    │  │                                     │
    │  │  Expiry: [7 days ▼]                │
    │  │                                     │
    │  │  [Generate ZK Proof]               │
    │  └─────────────────────────────────────┘
    │
    ▼
[Screen 12] Proof Generation (Animated)
    │  🔐 Generating Zero-Knowledge Proof…
    │  Step 1: Creating commitments… ✓
    │  Step 2: Generating ZK proof… ✓
    │  Step 3: Submitting to Midnight… ⟳
    │  Step 4: Awaiting confirmation… ⟳
    │
    ▼
[Screen 13] Proof Ready
    │  ┌─────────────────────────────────────┐
    │  │  ✅ Proof Generated Successfully!   │
    │  │                                     │
    │  │  Proof ID: #PSH-2024-A81F-8K2P      │
    │  │  Midnight TX: 0x8f2a...             │
    │  │  Expires: Dec 25, 2024              │
    │  │                                     │
    │  │  Share Link:                        │
    │  │  proofshield.io/verify/[token]      │
    │  │                                     │
    │  │  [Copy Link] [Share via Email]      │
    │  └─────────────────────────────────────┘
```

---

## 3. Recruiter Flow — Detailed

### Flow 3A: Verify a Candidate Proof

```
[Screen 1] Landing Page
    │  Click "Verify a Candidate"
    ▼
[Screen 2/3] Register + Wallet Connect (same as candidate)
    │
    ▼
[Screen 14] Recruiter Dashboard
    │  Click "Verify Proof"
    ▼
[Screen 15] Verification Entry
    │  ┌─────────────────────────────────────┐
    │  │  Verify Candidate                   │
    │  │                                     │
    │  │  Paste proof link or ID:            │
    │  │  [proofshield.io/verify/___]        │
    │  │                                     │
    │  │  Your requirements:                 │
    │  │  [Load saved] OR [Build new]        │
    │  │                                     │
    │  │  [Verify Now]                       │
    │  └─────────────────────────────────────┘
    │
    ▼
[Screen 16] Verification Result
    ┌────────────────────────────────────────┐
    │  VERIFICATION RESULT                   │
    │  ════════════════════                  │
    │  Candidate: #A81F (Anonymous)          │
    │  Verified on: Midnight Network         │
    │  TX: 0x8f2a...cd89  ✓ Confirmed       │
    │                                        │
    │  REQUIREMENTS CHECK                    │
    │  ─────────────────                     │
    │  Python ≥ Intermediate      ✓ PASS     │
    │  Cybersecurity ≥ Advanced   ✓ PASS     │
    │  Projects ≥ 3               ✓ PASS     │
    │                                        │
    │  OVERALL: ✅ QUALIFIED                 │
    │                                        │
    │  Private data:  🔒 NOT DISCLOSED       │
    │                                        │
    │  [Save to Ledger] [Invite Candidate]   │
    └────────────────────────────────────────┘
```

---

### Flow 3B: Requirement Builder

```
[Screen 14] Recruiter Dashboard
    │  Click "Build Requirements"
    ▼
[Screen 17] Requirement Builder
    │  ┌─────────────────────────────────────┐
    │  │  Requirement Set Builder            │
    │  │  Role: [Junior Security Engineer]   │
    │  │                                     │
    │  │  + Add Requirement                  │
    │  │  ┌───────────────────────────────┐  │
    │  │  │ Skill: [Python      ▼]        │  │
    │  │  │ Level: [≥ Intermediate ▼]     │  │
    │  │  └───────────────────────────────┘  │
    │  │  ┌───────────────────────────────┐  │
    │  │  │ Skill: [Cybersecurity ▼]      │  │
    │  │  │ Level: [≥ Advanced    ▼]      │  │
    │  │  └───────────────────────────────┘  │
    │  │  ┌───────────────────────────────┐  │
    │  │  │ Projects:  [≥ 2 ▼]           │  │
    │  │  └───────────────────────────────┘  │
    │  │                                     │
    │  │  [Save Requirement Set]             │
    │  └─────────────────────────────────────┘
```

---

## 4. Screen Inventory

| # | Screen Name | User | Description |
|---|---|---|---|
| 1 | Landing Page | All | Hero, features, how it works |
| 2 | Register | All | Email/OAuth signup |
| 3 | Role Selection | All | Candidate vs Recruiter |
| 4 | Wallet Connect | All | Midnight wallet integration |
| 5 | Student Dashboard | Candidate | Home with credentials list |
| 6 | Upload Modal | Candidate | File/URL/text upload |
| 7 | Analysis Loading | Candidate | AI progress animation |
| 8 | Claims Review | Candidate | Review AI-extracted claims |
| 9 | Credential Detail | Candidate | Single credential view |
| 10 | Privacy Passport | Candidate | Visual privacy dashboard |
| 11 | Proof Builder | Candidate | Select claims to prove |
| 12 | Proof Generating | Candidate | ZK proof progress animation |
| 13 | Proof Ready | Candidate | Share proof link |
| 14 | Recruiter Dashboard | Recruiter | Home with verifications |
| 15 | Verify Entry | Recruiter | Paste proof link |
| 16 | Verification Result | Recruiter | QUALIFIED / NOT QUALIFIED |
| 17 | Requirement Builder | Recruiter | Build skill requirement sets |
| 18 | Candidate Ledger | Recruiter | History of verifications |
| 19 | Proof History | Candidate | All generated proofs |
| 20 | Settings | All | Profile, wallet, security |

---

## 5. State Machine — Proof Lifecycle

```
[DRAFT]
   │ User selects claims
   ▼
[GENERATING]
   │ ZK proof computed client-side
   ▼
[PENDING_CHAIN]
   │ Submitted to Midnight
   ▼
[CONFIRMED]          [FAILED]
   │                    │
   │                    └─► Retry or Error page
   ▼
[ACTIVE / SHAREABLE]
   │ Proof link live
   ▼
[VERIFIED BY RECRUITER]
   │
   ▼
[EXPIRED] (if expiry set)
```

---

## 6. Navigation Structure

```
App Root
├── / (Landing)
├── /auth
│   ├── /login
│   └── /register
├── /onboarding
│   ├── /role
│   └── /wallet
├── /student (protected)
│   ├── /dashboard
│   ├── /credentials
│   │   ├── /upload
│   │   └── /[id]
│   ├── /passport
│   ├── /proofs
│   │   ├── /generate
│   │   ├── /[shareToken]
│   │   └── /history
│   └── /settings
├── /recruiter (protected)
│   ├── /dashboard
│   ├── /verify
│   │   └── /[proofId]
│   ├── /requirements
│   └── /ledger
└── /verify/[shareToken] (public — proof verification page)
```
