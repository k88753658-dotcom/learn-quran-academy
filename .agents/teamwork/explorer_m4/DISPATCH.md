# Dispatch: explorer_m4

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m4\

## Mission
Investigate and produce a comprehensive technical refactoring blueprint for Milestone M4 (Student & Teacher Dashboard API Routes):
1. Student API routes:
   - `src/app/api/student-dashboard/route.ts`
   - `src/app/api/student-profile/route.ts`
   - `src/app/api/student-history/route.ts`
   - `src/app/api/student-schedule/route.ts`
   - `src/app/api/student-billing/route.ts`
2. Teacher API routes:
   - `src/app/api/teacher-dashboard/route.ts`
   - `src/app/api/teacher-schedule/route.ts`
   - `src/app/api/teacher-classes/route.ts`
   - `src/app/api/teacher-students/route.ts`
   - `src/app/api/teacher-attendance/route.ts`
   - `src/app/api/update-teacher-profile/route.ts`
   - `src/app/api/update-teacher-activity/route.ts`
   - `src/app/api/add-availability/route.ts`
3. Attendance, Payment Verification, and Auth routes:
   - `src/app/api/attendance/route.ts`
   - `src/app/api/verify-manual-payment/route.ts`
   - `src/app/api/login/route.ts`
   - `src/app/api/register/route.ts`
4. Hardening items from M3 reviews:
   - `/api/payment-ticket` status injection fix (force `"Reviewing"` on creation)
   - `/api/notifications` default to `{ isActive: true, type: "Global" }` when target student is absent

## References
- ORIGINAL_REQUEST: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- TEST_INFRA: `d:\VS CODE\learn-quran-academy\TEST_INFRA.md`
- TEST_READY: `d:\VS CODE\learn-quran-academy\TEST_READY.md`
- Prisma Schema: `d:\VS CODE\learn-quran-academy\prisma\schema.prisma`

## Instructions
1. Inspect each of the above routes to identify:
   - Current Supabase queries/calls and imports
   - Authentication mechanism (Clerk `auth()` vs legacy token/session)
   - Prisma models and fields to replace Supabase tables
   - Input/output contracts expected by the frontend pages (`/dashboard`, `/teacher/dashboard`, etc.)
2. Check existing test suites in `tests/tier1-features/` (f12 through f16) and identify pass/fail baseline.
3. Deliver a complete, unambiguous refactoring specification in `handoff.md` for the Worker.

## 2026-09-29T14:26:42Z
You are Explorer for Milestone M4 (Student & Teacher Dashboard API Routes).
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m4\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m4\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md
Read d:\VS CODE\learn-quran-academy\prisma\schema.prisma

Investigate all target routes for Milestone M4:
- Student: student-dashboard, student-profile, student-history, student-schedule, student-billing
- Teacher: teacher-dashboard, teacher-schedule, teacher-classes, teacher-students, teacher-attendance, update-teacher-profile, update-teacher-activity, add-availability
- Shared: attendance, verify-manual-payment, login, register
- Hardening: payment-ticket, notifications

Identify current Supabase usage, auth calls, Prisma models/fields, frontend response contracts, and check existing tests (f12-f16).
Deliver a complete refactoring blueprint in handoff.md in your working directory and notify the parent via send_message.
