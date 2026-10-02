# Dispatch: challenger_m4_1

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m4_1\

## Mission
Perform empirical adversarial testing and boundary validation of Milestone M4 (Student & Teacher Dashboard API routes, Shared/Auth routes, and M3 hardening).

## References
- ORIGINAL_REQUEST: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- Worker Handoff: `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md`
- TEST_INFRA & TEST_READY: `d:\VS CODE\learn-quran-academy\TEST_INFRA.md`, `d:\VS CODE\learn-quran-academy\TEST_READY.md`

## Instructions
1. Adversarially test all M4 routes:
   - Unauthenticated requests to protected endpoints (401 expected)
   - Cross-role authorization (student calling teacher/admin endpoints, 403 expected)
   - Clamping of progress bounds in `update-student` (values <0 or >100)
   - Status invariance in `verify-manual-payment` and `payment-ticket` (injection of `Approved` should be ignored and set to `Reviewing`)
   - Notifications scoping (untargeted queries must not return targeted announcements)
   - Attendance compound key uniqueness on same UTC date
2. Execute Tier 1 tests (f12-f16), Tier 2 boundary tests, and write/run empirical adversarial test suites.
3. Report pass/fail counts and deliver your verdict: APPROVE or REQUEST_CHANGES in `handoff.md`.

## 2026-09-29T15:04:51Z
You are Challenger 1 for Milestone M4.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m4_1\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_m4_1\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md

Empirically stress-test M4 routes: unauthenticated access (401), unauthorized roles (403), progress bounds clamping, payment ticket status invariance (injection prevention), notifications privacy scoping, and run Tier 1 tests (f12-f16).
Write your findings, test assertions, and verdict (APPROVE or REQUEST_CHANGES) in handoff.md in your working directory and notify the parent via send_message.

