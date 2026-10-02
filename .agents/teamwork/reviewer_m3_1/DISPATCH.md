# Dispatch: reviewer_m3_1

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m3_1\

## Mission
Perform code review and type/build verification of Milestone M3 (Core & Public API Routes):
1. `src/app/api/courses/route.ts`
2. `src/app/api/public-teachers/route.ts`
3. `src/app/api/teacher-application/route.ts`
4. `src/app/api/notifications/route.ts`
5. `src/app/api/payment-ticket/route.ts`
6. `src/app/api/student-self-attendance/route.ts`

## References
- ORIGINAL_REQUEST: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- TEST_INFRA: `d:\VS CODE\learn-quran-academy\TEST_INFRA.md`
- TEST_READY: `d:\VS CODE\learn-quran-academy\TEST_READY.md`

## Instructions
1. Verify that all 6 routes use Prisma (`prisma` from `@/lib/prisma`), have no legacy Supabase imports, handle error states gracefully, and conform to the data contracts.
2. Run type checking `npx tsc --noEmit` and execute any relevant tests in `tests/tier1-features/` (f08, f09, f10, f11) and `tests/tier2-boundaries/`.
3. Provide your verdict: APPROVE or REQUEST_CHANGES in `handoff.md`.

## 2026-09-29T14:17:40Z
Target routes to review:
1. src/app/api/courses/route.ts
2. src/app/api/public-teachers/route.ts
3. src/app/api/teacher-application/route.ts
4. src/app/api/notifications/route.ts
5. src/app/api/payment-ticket/route.ts
6. src/app/api/student-self-attendance/route.ts

Verify Prisma integration, absence of legacy Supabase imports, and run `npx tsc --noEmit` and relevant tests.
Write your findings and verdict (APPROVE or REQUEST_CHANGES) in handoff.md in your working directory and notify the parent via send_message.

