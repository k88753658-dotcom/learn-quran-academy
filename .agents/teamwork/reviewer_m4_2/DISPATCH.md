# Dispatch: reviewer_m4_2

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m4_2\

## Mission
Perform independent code review, schema alignment, and contract testing for Milestone M4:
- Student API routes: `student-dashboard`, `student-profile`, `student-history`, `student-schedule`, `student-billing`, `billing`
- Teacher API routes: `teacher-dashboard`, `update-teacher-profile`, `update-teacher-activity`, `update-student`, `teacher-schedule`, `teacher-classes`, `teacher-students`, `teacher-attendance`, `add-availability`
- Shared / Auth routes: `attendance`, `mark-attendance`, `my-attendance`, `verify-manual-payment`, `login`, `register`
- M3 Hardening: `payment-ticket`, `notifications`

## References
- ORIGINAL_REQUEST: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- Worker Handoff: `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md`
- TEST_INFRA & TEST_READY: `d:\VS CODE\learn-quran-academy\TEST_INFRA.md`, `d:\VS CODE\learn-quran-academy\TEST_READY.md`

## Instructions
1. Independently inspect the 23 routes for Prisma schema model alignment, relational foreign keys, RBAC enforcement, and error handling.
2. Verify UTC date normalization in attendance routes and status invariance in payment ticket routes.
3. Run `npx tsc --noEmit` and Tier 1 tests (f12-f16).
4. Provide your verdict: APPROVE or REQUEST_CHANGES in `handoff.md`.

## 2026-09-29T15:09:38Z
You are Reviewer 2 (Replacement) for Milestone M4.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m4_2\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m4_2\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md

Independently inspect all 23 Milestone M4 routes for schema alignment, RBAC enforcement, UTC date normalization, payment ticket status invariance, and run `npx tsc --noEmit` and Tier 1 tests (f12-f16).
Write your findings and verdict (APPROVE or REQUEST_CHANGES) in handoff.md in your working directory and notify the parent via send_message.

