# BRIEFING — 2026-09-29T13:25:00+05:00

## Mission
Migrate and refactor 6 API route handlers to completely remove Supabase and use Prisma ORM and Clerk authentication.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m3\
- Original parent: 5151de75-150e-4241-94b2-4b7d5106459c
- Milestone: M3 (Core & Public API Routes)

## 🔒 Key Constraints
- Exclusive write ownership over:
  - src/app/api/courses/route.ts
  - src/app/api/public-teachers/route.ts
  - src/app/api/teacher-application/route.ts
  - src/app/api/notifications/route.ts
  - src/app/api/payment-ticket/route.ts
  - src/app/api/student-self-attendance/route.ts
- Completely remove `@/utils/supabase/*` and `@supabase/*` from owned files.
- Use `import { prisma } from '@/lib/prisma';` for database operations.
- Do NOT hardcode test results or create dummy/facade implementations.
- Preserve existing JSON response contracts expected by frontend and tests.

## Current Parent
- Conversation ID: 5151de75-150e-4241-94b2-4b7d5106459c
- Updated: not yet

## Task Summary
- **What to build**:
  - `src/app/api/courses/route.ts`: GET all courses, POST create course (with admin check and input validation), DELETE course (with admin check).
  - `src/app/api/public-teachers/route.ts`: GET verified teacher profiles with required fields.
  - `src/app/api/teacher-application/route.ts`: POST prospective teacher applications with validation (email, whatsapp, qualification) and duplicate checking.
  - `src/app/api/notifications/route.ts`: GET notifications for user (or target student/global), PATCH mark notification as read.
  - `src/app/api/payment-ticket/route.ts`: POST submit manual payment proof ticket.
  - `src/app/api/student-self-attendance/route.ts`: POST record student self attendance as 'Present', preventing duplicate check-in on the same date.
- **Success criteria**:
  - All 6 routes use Prisma exclusively (no Supabase references).
  - `npx tsc --noEmit` passes with 0 errors.
  - `node tests/run-all.mjs --feature=8`, `9`, `10`, `11` all pass.
  - All Tier 2 boundary and adversarial tests involving owned routes pass.
- **Interface contracts**: PROJECT.md § Interface Contracts
- **Code layout**: PROJECT.md § Code Layout

## Key Decisions Made
- Course model in Prisma schema has fields: `id, title, description, createdAt, updatedAt`. Course create will accept and persist `title` and `description`.
- Teacher application status is enum `ApplicationStatus` (`pending`, `approved`, `rejected`).
- Attendance model has `markedById` foreign key to `Profile(id)` or nullable. Do not set to string "student" because it violates foreign key relation; keep null or valid profile id.
- Self-attendance checks today's date using date range or midnight Date to guard duplicate check-in on the same date.

## Artifact Index
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m3\DISPATCH.md` — Worker assignment and instructions
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m3\BRIEFING.md` — Situational awareness and identity
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m3\progress.md` — Timestamped progress log
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m3\handoff.md` — Final handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Initial `npx tsc --noEmit` passed
- **Pending issues**: Implement 6 routes

## Quality Status
- **Build/test result**: Features 8, 9, 10, 11 tests initially passing against existing or partial files; need Prisma refactor
- **Lint status**: 0 violations
- **Tests added/modified**: None (tests are read-only)

## Loaded Skills
None
