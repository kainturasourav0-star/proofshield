# Vercel build notes

Source: https://vercel.com/kainturasourav0-stars-projects/proofshield/BpxYTsyXsNjm26ML9wUXQiMpMexG

The deployment built from GitHub commit `4da65d10c6bdef3758c15a88959fb730f65acf15` and failed during `npm run build` while collecting page data for `/api/auth/register`. The exact error was `MODULE_NOT_FOUND` from `/vercel/path0/node_modules/@prisma/client/default.js`, with the require stack entering `/vercel/path0/.next/server/app/api/auth/register/route.js`. The local build passes because the Prisma client is generated locally; the production build needs an explicit Prisma client generation step before Next.js build.

## OmniRoute AI routing

ProofShield’s credential analyzer now prefers OmniRoute when these server-side Vercel environment variables are present:

```text
OMNIROUTE_BASE_URL=https://your-omniroute-host
OMNIROUTE_API_KEY=your-scoped-omniroute-key
OMNIROUTE_MODEL=auto
```

The adapter calls the OpenAI-compatible `/v1/chat/completions` route and records `X-OmniRoute-*` routing metadata in server logs. If OmniRoute is unavailable, the analyzer falls back to Anthropic when `ANTHROPIC_API_KEY` is configured, then to deterministic extraction for offline/demo use. Never expose `OMNIROUTE_API_KEY` in client-side code or commit it to `.env` files.
