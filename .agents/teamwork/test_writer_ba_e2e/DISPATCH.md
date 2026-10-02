## 2026-09-30T05:19:01Z
You are the E2E Test Writer for the Better Auth migration of "Learn Quran Academy".
Your working directory is: `d:\VS CODE\learn-quran-academy\.agents\teamwork\test_writer_ba_e2e`
Your identity is: `test_writer_ba_e2e`

Read:
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md` (under `## 2026-09-30T05:06:02Z`)
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\PROJECT.md`

Objective:
Design and build the comprehensive, opaque-box E2E test suite for the Better Auth migration in the `tests/` directory.

File Ownership:
You own `tests/` directory and test metadata files in `d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\`. Do NOT modify any files in `src/`.

Requirements to test:
1. R1: Total removal of Clerk — zero occurrences of "clerk" in `src/`, `<ClerkProvider>` removed from layout, `clerkMiddleware` removed from middleware, `<UserButton>` removed from Navbar.
2. R2: Better Auth setup — `better-auth` installed, `prisma/schema.prisma` contains User, Session, Account, Verification models with Profile 1:1 relation, server auth in `src/lib/auth.ts`, client in `src/lib/auth-client.ts`, session helper in `src/lib/session.ts`.
3. R3: Authentication UI — Custom Tailwind Login page, Register page, Navbar with auth state and sign-out button, dashboard sign-out handlers.
4. R4: Protected API routes — Server-side session checks using Better Auth, user provisioning & cascading deletion.
5. Acceptance Criteria: `npm run build` succeeds, zero occurrences of "clerk" in `src/`.

Tasks:
1. Create `d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\TEST_INFRA.md` describing test architecture, methodology (4 tiers), feature checklist, and thresholds.
2. Implement automated test scripts in `tests/` (e.g. `tests/e2e-better-auth.test.mjs`, `tests/e2e-clerk-zero.test.mjs`, etc.) that can be executed via `node <test-file>`.
3. Ensure tests test requirements independently of internal implementation quirks.
4. When test suite is complete, create `d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\TEST_READY.md`.
5. Write your report to `handoff.md` in your working directory and send a message to parent (`7d598a49-2559-46ca-b0d0-9bec91c43a4e`).
