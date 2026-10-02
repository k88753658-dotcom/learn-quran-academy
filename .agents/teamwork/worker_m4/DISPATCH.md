# Dispatch: worker_m4

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\

## Mission
Implement Milestone M4 (Student & Teacher Dashboard API Routes, Shared/Auth Routes, and M3 Hardening) following the exact blueprint in `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m4\handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## References
- Blueprint: `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m4\handoff.md`
- Authoritative Request: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- Master Plan: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- Test Infrastructure: `d:\VS CODE\learn-quran-academy\TEST_INFRA.md` & `d:\VS CODE\learn-quran-academy\TEST_READY.md`
- Prisma Schema: `d:\VS CODE\learn-quran-academy\prisma\schema.prisma`

## File Ownership
- `src/app/api/student-dashboard/route.ts`
- `src/app/api/student-profile/route.ts`
- `src/app/api/student-history/route.ts`
- `src/app/api/student-schedule/route.ts`
- `src/app/api/student-billing/route.ts`
- `src/app/api/billing/route.ts`
- `src/app/api/teacher-dashboard/route.ts`
- `src/app/api/update-teacher-profile/route.ts`
- `src/app/api/update-teacher-activity/route.ts`
- `src/app/api/update-student/route.ts`
- `src/app/api/teacher-schedule/route.ts`
- `src/app/api/teacher-classes/route.ts`
- `src/app/api/teacher-students/route.ts`
- `src/app/api/teacher-attendance/route.ts`
- `src/app/api/add-availability/route.ts`
- `src/app/api/attendance/route.ts`
- `src/app/api/mark-attendance/route.ts`
- `src/app/api/my-attendance/route.ts`
- `src/app/api/verify-manual-payment/route.ts`
- `src/app/api/login/route.ts`
- `src/app/api/register/route.ts`
- `src/app/api/payment-ticket/route.ts` (M3 hardening)
- `src/app/api/notifications/route.ts` (M3 hardening)

## Verification Requirements
1. Run `npx tsc --noEmit` and ensure 0 TypeScript compilation errors in all modified files.
2. Run Tier 1 feature tests:
   - `node tests/tier1-features/f12-student-dashboard-api.test.mjs`
   - `node tests/tier1-features/f13-teacher-dashboard-api.test.mjs`
   - `node tests/tier1-features/f14-attendance-management-api.test.mjs`
   - `node tests/tier1-features/f15-manual-payment-verification-api.test.mjs`
   - `node tests/tier1-features/f16-auth-api-handlers.test.mjs`
3. Run M3 regression tests: `f08`, `f09`, `f10`, `f11`.
4. Ensure zero `@supabase` imports across all owned route files.
5. Report all command outputs and deliver completion handoff in `handoff.md`.
