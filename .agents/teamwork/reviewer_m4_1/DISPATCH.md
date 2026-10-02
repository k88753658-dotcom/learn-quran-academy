# Dispatch: reviewer_m4_1

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m4_1\

## Mission
Perform comprehensive code review and type/contract verification for Milestone M4:
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
1. Verify Prisma singleton usage, Clerk auth integration, and zero Supabase dependencies across all 23 route files.
2. Check frontend contract fidelity (e.g. `_id` and snake_case aliases in teacher dashboard, array billing in student dashboard).
3. Run `npx tsc --noEmit` and execute Tier 1 tests (f12-f16) and M3 regression tests (f08-f11).
4. Provide your verdict: APPROVE or REQUEST_CHANGES in `handoff.md`.

## 2026-09-29T15:04:51Z
You are Reviewer 1 for Milestone M4.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m4_1\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m4_1\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md

Review all 23 Milestone M4 routes (Student, Teacher, Shared/Auth, and M3 hardening).
Verify Prisma singleton usage, Clerk auth, zero Supabase dependencies, frontend contract compatibility, and run `npx tsc --noEmit` and Tier 1 tests (f12-f16).
Write your findings and verdict (APPROVE or REQUEST_CHANGES) in handoff.md in your working directory and notify the parent via send_message.
