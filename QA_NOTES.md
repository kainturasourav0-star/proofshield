# ProofShield QA Notes

- `npm run build` completes successfully after dependency permission repair and UI/API changes.
- Landing page renders at `/` with responsive header, hero CTAs, animated proof preview, anchor navigation, capability cards, and footer links.
- The proof preview claim controls are interactive: clicking the locked third claim changes it to `GPA ≥ 3.50` and marks it Shared, confirming the selective-disclosure demo state works.
- Build emits a non-blocking `pdf-parse` critical-dependency warning from the existing extraction utility.

The route `/verify/invalid-demo-token` renders a clear “Receipt not found” state with no fabricated claims or transaction metadata, confirming the public verification hardening works.

## Notion-guided redesign QA

- The first dev preview hit a stale Next.js hot-reload chunk error after rebuilding.
- Removing `.next` and restarting the dev server fixed the preview; the landing page now renders normally with the updated premium layout.
- The landing page shows the intended human-crafted hierarchy: restrained ink surfaces, one emerald signal, asymmetric hero composition, quiet proof metadata, and interactive disclosure controls rather than a generic dashboard grid.

## Art-direction pass QA

The redesigned landing page renders with the new editorial composition: oversized serif typography, restrained lime accent, dark ink surfaces, an asymmetric hero, a tactile proof object, a warm passport section, and staggered method sections. The proof object remains interactive; unlocking the third claim resolves it to `GPA ≥ 3.50` and changes the status to Shared. The page is free of runtime render errors in the browser preview.

Scroll QA confirms the method rail and passport section follow the intended narrative. At the current narrow desktop viewport, the method content stacks below the editorial heading as designed, and the warm passport panel enters with a restrained reveal rather than a large parallax effect.

The authentication route initially showed the same stale Next.js dev chunk issue after a rebuild; clearing `.next` and restarting the dev server resolved it. The registration page then rendered correctly with the refreshed palette, tactile role switch, updated controls, and new route entrance transition.
