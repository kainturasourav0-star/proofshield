# ProofShield

ProofShield is a privacy-preserving credential verification workspace built with Next.js 14, Prisma, SQLite, Auth.js, and Motion. It turns source credentials into selective, human-readable claims and cryptographic proof receipts without exposing the original documents.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## AI Credential Analysis

Credential analysis is routed through [OmniRoute](https://github.com/diegosouzapw/OmniRoute) when the server has both `OMNIROUTE_BASE_URL` and `OMNIROUTE_API_KEY`. ProofShield sends an OpenAI-compatible chat-completion request to OmniRoute’s `auto` model by default, allowing the gateway to select and fail over across its configured providers. The original credential text is sent only from the server-side analysis route; gateway credentials are never exposed to the browser.

Configure the integration with server-side environment variables:

```bash
OMNIROUTE_BASE_URL=http://localhost:20128
OMNIROUTE_API_KEY=your-omniroute-key
OMNIROUTE_MODEL=auto
```

`OMNIROUTE_BASE_URL` may be an origin such as `http://localhost:20128` or a URL that already ends in `/v1`. ProofShield normalizes both forms to the `/v1/chat/completions` route. If OmniRoute is unavailable or returns an error, the analyzer falls back to Anthropic when `ANTHROPIC_API_KEY` is present and finally to deterministic extraction for local demos and offline development.

The credential-analysis endpoint is:

```text
POST /api/credentials/analyze
```

It accepts a content string, credential type, title, optional issuer, and optional source URL. The response contains extracted claims that are then committed into ProofShield’s privacy passport.

## Demo Accounts

Candidate demo: `demo@proofshield.io` / `demo1234`.

Recruiter demo: `recruiter@testcompany.io` / `recruiter1234`.

## Validation

Run the production checks before publishing:

```bash
npx tsc --noEmit
npm run build
```

## Deployment

ProofShield is configured for Vercel. Add `AUTH_SECRET`, `NEXTAUTH_URL`, and any optional AI gateway variables in the Vercel project’s server-side environment settings. Do not commit `.env` files, OmniRoute keys, Anthropic keys, or provider credentials.

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) and the [OmniRoute repository](https://github.com/diegosouzapw/OmniRoute) for additional platform and gateway details.
