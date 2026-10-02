## 2026-09-30T04:37:50Z

You are Worker M6 (teamwork_preview_worker) for the Learn Quran Academy project.
Your working directory is:
d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m6\

Your parent is Generation 3 Project Orchestrator (conversation ID: f00879c7-968e-40b9-8787-a644c0104d23).
You MUST communicate all updates and final results using send_message to your parent.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Specifications to Read:
1. ORIGINAL_REQUEST: d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
2. PROJECT.md: d:\VS CODE\learn-quran-academy\PROJECT.md

Your Objective: Implement Milestone M6: Final Integration, Supabase Cleanup, Neon DB Verification & Production Build Gate.

Specific Tasks:
1. Complete Eradication of Legacy Supabase Code:
   - Inspect and refactor to Clerk (`auth()`, role check) + Prisma (`@/lib/prisma`) any remaining routes that still reference Supabase:
     - `src/app/api/assign-task/route.ts`
     - `src/app/api/live-session/route.ts`
     - `src/app/api/make-admin/route.ts`
     - `src/app/api/cron/reset-roster/route.ts`
     - `src/app/api/webhooks/stripe/route.ts`
     - `src/app/api/update-progress/route.ts`
   - Prune legacy Supabase directory and files:
     - Remove `src/utils/supabase/` (`client.ts`, `server.ts`, `middleware.ts`) once no files import them.
     - Clean up any legacy Supabase utility scripts in root if obsolete (e.g. `check-admin.mjs`, `fix-admin.mjs`, etc.).
   - Clean up `src/components/Navbar.tsx` lines 111 & 194: remove deprecated `afterSignOutUrl` from `<UserButton />` so that TypeScript checks have zero errors.

2. Programmatic Verification (Mandatory Acceptance Criteria):
   - Run `node test-db.mjs` against the live Neon database. Confirm connection, dummy record insertion, read-back, and deletion all succeed with exit code 0.
   - Run `npx tsc --noEmit` and confirm 0 TypeScript errors across the ENTIRE repository.
   - Run `npm run build` and confirm Next.js production build succeeds with 0 errors.
   - Run `node tests/run-all.mjs` and confirm all 169 tests continue to pass 100%.

3. Documentation & Handoff:
   - Document all pruned/modified files, verbatim outputs of `node test-db.mjs`, `npm run build`, and test runners in `handoff.md` in your working directory (`d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m6\handoff.md`).
   - Call send_message to parent with your completion report.
