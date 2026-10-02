# Dispatch: challenger_m4_2

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m4_2\

## Mission
Perform independent empirical verification, frontend contract validation, and lifecycle testing of Milestone M4 (Student & Teacher Dashboard API routes, Shared/Auth routes, and M3 hardening).

## References
- ORIGINAL_REQUEST: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- Worker Handoff: `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md`
- TEST_INFRA & TEST_READY: `d:\VS CODE\learn-quran-academy\TEST_INFRA.md`, `d:\VS CODE\learn-quran-academy\TEST_READY.md`

## Instructions
1. Verify frontend contract compatibility:
   - Check that `teacher-dashboard` returns `_id`, `student_name`, `live_classroom_link`, `last_assignment` matching `src/app/teacher/dashboard/page.tsx`.
   - Check that `student-dashboard` returns `billing` array matching `src/app/dashboard/page.tsx`.
2. Test lifecycle flows: student registration -> payment ticket -> teacher attendance -> dashboard views.
3. Execute empirical tests and Tier 1 tests (f12-f16).
4. Report pass/fail counts and deliver your verdict: APPROVE or REQUEST_CHANGES in `handoff.md`.

## 2026-09-29T15:04:51Z

You are Challenger 2 for Milestone M4.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m4_2\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m4_2\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md

Verify frontend contracts and lifecycle flows: student dashboard billing array compatibility, teacher dashboard `_id` and snake_case aliases, registration to payment flow, and run Tier 1 tests.
Write your findings, test counts, and verdict (APPROVE or REQUEST_CHANGES) in handoff.md in your working directory and notify the parent via send_message.

