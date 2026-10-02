# Dispatch: challenger_m3_1

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m3_1\

## Mission
Perform empirical adversarial testing and boundary validation of Milestone M3 (Core & Public API Routes):
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
1. Stress test the 6 routes with malformed JSON, empty bodies, boundary inputs, type mismatches, and edge conditions.
2. Run Tier 1 tests (f08-f11) and Tier 2 boundary tests. Write or execute stress tests against the route handlers.
3. Report pass/fail counts, identify any potential crashes (500s on bad inputs), and provide verdict: APPROVE or REQUEST_CHANGES in `handoff.md`.

## 2026-09-29T14:17:40Z
You are Challenger 1 for Milestone M3.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m3_1\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m3_1\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md

Target routes to stress-test:
1. src/app/api/courses/route.ts
2. src/app/api/public-teachers/route.ts
3. src/app/api/teacher-application/route.ts
4. src/app/api/notifications/route.ts
5. src/app/api/payment-ticket/route.ts
6. src/app/api/student-self-attendance/route.ts

Empirically test edge cases, malformed JSON, boundary inputs, type mismatches, and run tests.
Write your findings, test counts, and verdict (APPROVE or REQUEST_CHANGES) in handoff.md in your working directory and notify the parent via send_message.

