# Dispatch: challenger_m3_2

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m3_2\

## Mission
Perform independent empirical verification and contract testing of Milestone M3 (Core & Public API Routes):
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
1. Verify behavioral equivalence between legacy route specifications and Prisma implementations.
2. Check return shape (e.g. `{ courses: [...] }`, `{ teachers: [...] }`, `{ success: true }`, error status codes).
3. Execute empirical test scripts.
4. Report pass/fail counts and provide verdict: APPROVE or REQUEST_CHANGES in `handoff.md`.

## 2026-09-29T14:17:40Z
You are Challenger 2 for Milestone M3.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m3_2\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m3_2\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md

Target routes to verify:
1. src/app/api/courses/route.ts
2. src/app/api/public-teachers/route.ts
3. src/app/api/teacher-application/route.ts
4. src/app/api/notifications/route.ts
5. src/app/api/payment-ticket/route.ts
6. src/app/api/student-self-attendance/route.ts

Verify behavioral equivalence and response shapes. Run empirical tests and verify exit codes.
Write your findings, test counts, and verdict (APPROVE or REQUEST_CHANGES) in handoff.md in your working directory and notify the parent via send_message.

