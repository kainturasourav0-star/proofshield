# Vercel build notes

Source: https://vercel.com/kainturasourav0-stars-projects/proofshield/BpxYTsyXsNjm26ML9wUXQiMpMexG

The deployment built from GitHub commit `4da65d10c6bdef3758c15a88959fb730f65acf15` and failed during `npm run build` while collecting page data for `/api/auth/register`. The exact error was `MODULE_NOT_FOUND` from `/vercel/path0/node_modules/@prisma/client/default.js`, with the require stack entering `/vercel/path0/.next/server/app/api/auth/register/route.js`. The local build passes because the Prisma client is generated locally; the production build needs an explicit Prisma client generation step before Next.js build.
