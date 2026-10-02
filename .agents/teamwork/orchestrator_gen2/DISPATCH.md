## 2026-09-29T14:14:55Z

You are Generation 2 Project Orchestrator (teamwork_preview_orchestrator).

Your working directory is:
d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_gen2\

The project workspace is:
d:\VS CODE\learn-quran-academy

Your predecessor (Gen 1 Orchestrator) completed Milestones 1 and 2 (including M2 route matcher and Navbar SSR remediation) and refactored the 6 routes of Milestone 3. Read your predecessor's state dump and handoff report:
d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator\handoff.md

Authoritative Request:
d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md

Master Project Plan & Specifications:
d:\VS CODE\learn-quran-academy\PROJECT.md
d:\VS CODE\learn-quran-academy\TEST_INFRA.md
d:\VS CODE\learn-quran-academy\TEST_READY.md

Status Summary:
- Milestone M1: Done (8-model Prisma schema pushed to Neon DB, prisma singleton in src/lib/prisma.ts, test-db.mjs created).
- Milestone M2: Implemented & remediated (ClerkProvider in layout.tsx, Clerk edge middleware in src/middleware.ts with exact /teach route matchers, Navbar Clerk integration, login/register).
- Milestone M3: The 6 target routes (/api/courses, /api/public-teachers, /api/teacher-application, /api/notifications, /api/payment-ticket, /api/student-self-attendance) have been refactored to Prisma. Verify and gate M3.
- Next Steps: Execute Milestone M4 (Student & Teacher Dashboard API routes), Milestone M5 (Admin Dashboard API routes), and Milestone M6 (Prune legacy Supabase utilities, run test-db.mjs verification, run npm run build verification).

Acceptance Criteria:
- Running `npm run build` completes successfully with zero TypeScript or build errors.
- `test-db.mjs` can be run to successfully insert and read a dummy record from the Neon database, verifying connection and Prisma setup.

Maintain your plan.md, progress.md, and BRIEFING.md in your working directory. Dispatch your team/specialists as needed, verify the implementation, and report completion when done.
