# BRIEFING — 2026-09-29T08:18:45Z

## Mission
Empirically verify Clerk client components and hooks across layout, navbar, login, and 3 dashboard pages under @clerk/nextjs v7.9.7 API contracts, test for hydration/TS errors, execute feature tests, and produce adversarial verdict.

## 🔒 My Identity
- Archetype: teamwork_preview_challenger
- Roles: critic, specialist
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m2_2\
- Original parent: 5151de75-150e-4241-94b2-4b7d5106459c
- Milestone: M2-2 (Clerk client components and hooks verification)
- Instance: 1 of 1

## 🔒 Key Constraints
- Review-only — do NOT modify implementation code
- Empirically verify claims — run tests and verification scripts myself; do not rely on claims or worker logs
- Strictly check @clerk/nextjs v7.9.7 contracts against v4/v5 deprecated patterns
- Explicit verdict required: APPROVE or REQUEST_CHANGES

## Current Parent
- Conversation ID: 5151de75-150e-4241-94b2-4b7d5106459c
- Updated: 2026-09-29T08:18:45Z

## Review Scope
- **Files to review**:
  - `src/app/layout.tsx`
  - `src/components/Navbar.tsx`
  - `src/app/login/page.tsx`
  - `src/app/dashboard/page.tsx` (student dashboard)
  - `src/app/teacher/dashboard/page.tsx`
  - `src/app/admin/dashboard/page.tsx`
- **Interface contracts**: `PROJECT.md`, `TEST_INFRA.md`, `@clerk/nextjs` v7.9.7 specification
- **Review criteria**: API conformance, runtime hydration, SSR/client boundaries, type correctness, adversarial edge cases

## Key Decisions Made
- Executed `npx tsc --noEmit`: 0 errors.
- Executed `node tests/run-all.mjs --tier=1`: 87/88 passed (1 failed in F16 which belongs to M4).
- Executed `node tests/run-all.mjs --feature=4,5,6,7`: All 16 assertions passed.
- Executed `npx next build`: CRITICAL FAILURE (exit code 1).
  - Prerendering crashed on `/contact`: `Error: Clerk: <SignedOut> is not available in @clerk/nextjs Core 3.`
  - Empirically verified in `@clerk/nextjs@7.9.7` that `<SignedIn>` and `<SignedOut>` are removed and unconditionally throw runtime errors. They must be replaced with `<Show when="signed-in">` and `<Show when="signed-out">`.
- Auth edge case found: `src/app/admin/dashboard/page.tsx` checks only legacy `localStorage.getItem("user_role") !== "admin"`, locking out Clerk-authenticated admins.
- Verdict: REQUEST_CHANGES.

## Attack Surface
- **Hypotheses tested**:
  1. Does `npx tsc --noEmit` catch Clerk v7 component deprecations? Result: FALSE. Type definitions return `never`, passing typecheck while throwing at runtime.
  2. Does `next build` succeed with `<SignedIn>` / `<SignedOut>`? Result: FALSE. Throws unhandled runtime exception during static generation.
  3. Are dashboard signouts correctly wired? Result: TRUE. All 3 dashboards call `useClerk().signOut({ redirectUrl: '/login' })`.
  4. Is admin dashboard authenticated via Clerk? Result: FALSE. Checks `localStorage.getItem("user_role")` without Clerk `useUser` or metadata fallback.
- **Vulnerabilities found**:
  - CRITICAL: Runtime crash in `Navbar.tsx` due to removed `<SignedIn>` and `<SignedOut>` components in `@clerk/nextjs` v7.9.7.
  - MEDIUM: Admin dashboard locks out Clerk-authenticated admins due to legacy `localStorage` check.
- **Untested angles**:
  - Live OAuth authentication flow with real Clerk backend credentials (keys are placeholder in development).

## Loaded Skills
- None

## Artifact Index
- `DISPATCH.md` — Inbound instruction
- `BRIEFING.md` — Situational awareness
- `progress.md` — Liveness & step updates
- `handoff.md` — Final 5-component adversarial review report
- `tests/tier2-boundaries/clerk-client-contracts.test.mjs` — Reproducible empirical test harness for Clerk v7 contracts
