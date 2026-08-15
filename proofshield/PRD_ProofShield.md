# Product Requirements Document (PRD)
## ProofShield — "Prove you're qualified. Reveal nothing."

**Version:** 1.0  
**Hackathon:** Midnight Hackathon (Brainwave)  
**Blockchain:** Midnight Network  
**Core Technology:** Zero-Knowledge Proofs (ZKP) + AI Analysis  

---

## 1. Executive Summary

ProofShield is a privacy-preserving credential verification platform built on the Midnight blockchain. It enables students and professionals to prove their qualifications to recruiters and institutions without revealing sensitive personal data. Using Zero-Knowledge Proofs (ZKPs) and AI-driven credential analysis, users generate cryptographic "proofs" that answer specific questions — like "Does this candidate have intermediate Python skills?" — without disclosing their entire profile.

**Tagline:** Proof, not exposure.

---

## 2. Problem Statement

### The Current Pain
When a student applies for a job or internship, they typically share:
- Full name, email, phone number
- Resume with complete academic history
- CGPA, marks, transcripts
- GitHub profile, projects
- Certifications (often with serial numbers)
- Personal addresses

This is **data overexposure**. The recruiter only needs to know: *"Is this person qualified for my role?"* — but the candidate must hand over their entire digital identity to get that answer.

### Why This Matters
- Data breaches at hiring platforms expose millions of candidates
- Candidates have no control over what data is stored/sold
- Fraudulent credential claims go unverified
- Verification is slow, manual, and trust-based

---

## 3. Target Users

| User Type | Description | Primary Need |
|---|---|---|
| **Students / Candidates** | Undergrads, graduates, professionals applying for roles | Prove skills selectively without full data exposure |
| **Recruiters / Employers** | HR teams, hiring managers | Verify specific credential claims instantly and reliably |
| **Educational Institutions** | Universities, bootcamps, certification bodies | Issue verifiable credentials on-chain |
| **Developers / Auditors** | Technical verifiers, security auditors | Audit compliance proofs without seeing sensitive config |

---

## 4. Goals & Success Metrics

### Primary Goals
- Allow candidates to upload credentials and generate ZK-proofs for selective disclosure
- Allow recruiters to define required qualifications and verify proofs
- Integrate Midnight blockchain for on-chain proof verification
- Use AI to analyze credentials and generate standardized, verifiable claims

### Success Metrics (Hackathon MVP)
- End-to-end proof generation + verification in < 30 seconds
- 5+ claim types demonstrable in demo
- Working Midnight integration with transaction proof recorded on-chain
- Clean recruiter dashboard showing verified/not-verified status
- Demo story completable in 2 minutes

---

## 5. Core Features

### 5.1 Student Dashboard
- **Credential Upload**: Upload certificates, transcripts, GitHub links, project descriptions
- **AI Analysis Engine**: AI reads credentials and extracts verifiable claims
- **Privacy Passport**: Visual display of all claims — public (checked) and private (locked)
- **Proof Generator**: Select a claim → generate ZK proof → get shareable proof link
- **Verification History**: Track all proofs generated and when/with whom they were shared

### 5.2 Recruiter Dashboard
- **Requirement Builder**: Define required qualifications (e.g., Python ≥ Intermediate, 1+ security project)
- **Verification Page**: Enter candidate's proof link → get instant verified/not-verified result
- **Candidate Ledger**: View anonymized verification history (Candidate #A81F format)
- **Bulk Verification**: Verify multiple candidates against same requirement set

### 5.3 ZK Proof Engine
- Generate proofs for: skill level thresholds, project count, certification existence, hackathon participation
- Proof links are shareable and time-bound (optional expiry)
- Proof metadata stored on Midnight blockchain
- Verifier never sees underlying credential data

### 5.4 AI Credential Analyzer
- Accepts: PDFs, images (certificates), text input, GitHub URL
- Outputs: Structured claim set (skill name, proficiency level, count, validity)
- Claim types:
  - Skill Proficiency: `{skill} >= {level}`
  - Project Count: `projects.count >= N`
  - Certification: `has_cert("{name}")`
  - Participation: `hackathons >= N`
  - GPA Threshold: `cgpa >= X`

### 5.5 Privacy Passport
- Visual card showing all verifiable claims
- Toggle: Public (share) vs Private (lock)
- Exportable as shareable link (proof only, no raw data)
- Candidate-controlled at all times

---

## 6. Non-Goals (MVP Scope Exclusions)
- Full decentralized identity (DID) standard implementation
- Mobile app (web-only for hackathon)
- Institution-side credential issuance portal
- Fiat payment integration
- Multi-language support

---

## 7. User Stories

### Candidate
> As a student, I want to upload my certificates so that AI can extract verifiable claims from them.

> As a candidate, I want to generate a ZK proof that I have Python skills at an intermediate level, so I can share that with recruiters without exposing my full transcript.

> As a user, I want a Privacy Passport that shows exactly what I'm proving and what remains hidden.

### Recruiter
> As a recruiter, I want to specify required skill thresholds and get a simple VERIFIED / NOT VERIFIED result for a candidate.

> As a hiring manager, I want to verify credentials on the Midnight blockchain so I know the proof hasn't been tampered with.

---

## 8. Constraints & Assumptions

| Constraint | Detail |
|---|---|
| Hackathon timeline | 2–4 day build, MVP scope only |
| Midnight SDK | Use available Midnight testnet / dev environment |
| AI | Use Claude API or OpenAI for credential analysis |
| ZKP simulation | If full ZKP circuit not buildable in time, simulate with verifiable hash commitments |
| Data storage | No real PII stored; only hashed credential commitments |

---

## 9. Judging Criteria Alignment

| Criterion | Weight | ProofShield Approach |
|---|---|---|
| Innovation & Creativity | 25% | AI + ZKP + Midnight = novel combination |
| Technical Implementation | 25% | Midnight on-chain proof, ZK verification |
| Impact & Problem Solving | 20% | Real student/recruitment privacy problem |
| UX/Design | 15% | Clean dashboard, Privacy Passport visual |
| Scalability | 10% | Extensible to any credential domain |
| Presentation | 5% | "Proof, not exposure" story arc |

---

## 10. Release Phases

| Phase | Scope |
|---|---|
| **MVP (Hackathon)** | Credential upload → AI analysis → ZK proof → Midnight → Recruiter verification |
| **V1 (Post-hackathon)** | Institution issuer portal, DID integration, mobile app |
| **V2** | API for third-party verification, enterprise dashboard, compliance proofs |
