# BRIEFING — 2026-09-29T14:27:00Z

## Mission
Investigate all target routes for Milestone M4 (Student & Teacher Dashboard API Routes, Shared/Auth routes, M3 Hardening) and produce a comprehensive refactoring blueprint in handoff.md.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis, blueprint generation
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m4\
- Original parent: 079349bf-80f2-4098-baba-265e00bb6c6c
- Milestone: M4

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Files for content delivery, Messages for coordination
- Reference exact file paths, line numbers, and verify with tests

## Current Parent
- Conversation ID: 079349bf-80f2-4098-baba-265e00bb6c6c
- Updated: 2026-09-29T14:46:00Z

## Investigation State
- **Explored paths**:
  - `src/app/api/student-dashboard/route.ts`, `student-profile/route.ts`, `billing/route.ts`
  - `src/app/api/teacher-dashboard/route.ts`, `update-teacher-profile/route.ts`, `update-teacher-activity/route.ts`, `update-student/route.ts`
  - `src/app/api/attendance/route.ts`, `mark-attendance/route.ts`, `my-attendance/route.ts`
  - `src/app/api/verify-manual-payment/route.ts`, `login/route.ts`, `register/route.ts`
  - `src/app/api/payment-ticket/route.ts`, `notifications/route.ts`
  - Frontend consumers: `src/app/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, `src/app/(public)/student-portal/page.tsx`, `src/app/register/page.tsx`
  - Test suites: `tests/tier1-features/f12` through `f16`, `f21`, `tests/tier2-boundaries/`, `tests/tier3-interactions/`
- **Key findings**:
  1. Student dashboard expects `billing` as an array or object (`billing?.length > 0 ? billing[0] : null`), so returning `billing: student.billing ? [student.billing] : []` preserves 100% compatibility.
  2. Teacher dashboard frontend actively relies on `student._id` (lines 232, 255, 322 of `src/app/teacher/dashboard/page.tsx`) when invoking `handleUpdateStudent` and `handleMarkAttendance`. Thus, returning `_id: s.id` alongside `id: s.id` is strictly necessary to prevent UI runtime breakage.
  3. `PROJECT.md` and DISPATCH.md list supplementary routes: `student-history`, `student-schedule`, `student-billing`, `teacher-schedule`, `teacher-classes`, `teacher-students`, `teacher-attendance`, `add-availability`. Implementing dedicated route handlers for these alongside existing endpoints guarantees complete specification conformance.
  4. M3 Hardening: `payment-ticket` status injection vulnerability must force `status: "Reviewing"`; `notifications` privacy leak must fallback to `{ isActive: true, type: "Global" }`.
  5. Auth: `/api/register` must create user via `await clerkClient().users.createUser(...)` and persist `Profile`, `Student`, `Billing` in Prisma; `/api/login` must verify credentials and return role-specific payload with zero Supabase dependencies.
- **Unexplored areas**: None for M4 scope.

## Key Decisions Made
- All M4 routes will migrate completely from Supabase to Prisma ORM + Clerk `auth()`.
- Both camelCase and legacy snake_case/`_id` fields will be included in student/teacher responses for zero frontend friction.
- Blueprint will provide exact code snippets, models, field mappings, and test verification criteria.

## Artifact Index
- DISPATCH.md — Dispatch instructions from parent
- BRIEFING.md — Situational awareness and working memory
- progress.md — Liveness heartbeat and progress tracking
- handoff.md — Refactoring blueprint for Worker M4
