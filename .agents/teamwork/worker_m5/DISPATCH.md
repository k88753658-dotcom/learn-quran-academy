## 2026-09-30T04:18:29Z
You are Worker M5 (teamwork_preview_worker) for the Learn Quran Academy project.
Your working directory is:
d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m5\

Your parent is Generation 3 Project Orchestrator (conversation ID: f00879c7-968e-40b9-8787-a644c0104d23).
You MUST communicate all updates and final results using send_message to your parent.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Context & Specifications to Read:
1. ORIGINAL_REQUEST: d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
2. PROJECT.md: d:\VS CODE\learn-quran-academy\PROJECT.md
3. Blueprint from Explorer M5: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\handoff.md

Your Objective: Implement Milestone M5: Admin Dashboard API Routes & M4 Hardening.
You have exclusive write ownership over the following 23 files:
Group 1 (11 existing routes - refactor completely to Clerk + Prisma, zero Supabase):
1. src/app/api/admin-stats/route.ts
2. src/app/api/get-students/route.ts
3. src/app/api/get-teachers/route.ts
4. src/app/api/add-teacher/route.ts
5. src/app/api/assign-teacher/route.ts
6. src/app/api/delete-student/route.ts
7. src/app/api/get-teacher-applications/route.ts
8. src/app/api/approve-teacher-application/route.ts
9. src/app/api/approve-manual-payment/route.ts
10. src/app/api/get-active-announcements/route.ts
11. src/app/api/publish-announcement/route.ts

Group 2 (8 companion admin routes - create with Clerk + Prisma):
12. src/app/api/admin-students/route.ts
13. src/app/api/admin-teachers/route.ts
14. src/app/api/admin-classes/route.ts
15. src/app/api/admin-billing/route.ts
16. src/app/api/add-student/route.ts
17. src/app/api/delete-user/route.ts
18. src/app/api/reject-teacher-application/route.ts
19. src/app/api/reject-manual-payment/route.ts

Group 3 (4 M4 hardening items):
20. src/app/api/teacher-attendance/route.ts (validate filterStudentId against teacher's assigned roster)
21. src/app/api/update-student/route.ts (verify teacher can only mutate their own assigned student unless admin)
22. src/app/api/attendance/route.ts (add staff role check admin/teacher to GET handler)
23. src/app/api/login/route.ts (secure legacy endpoint with Clerk auth session validation)

Key Requirements:
- Strictly follow the detailed specifications and code patterns provided in Explorer M5 handoff (d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\handoff.md).
- Ensure all admin routes check Clerk session: `const { userId } = await auth(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });` and verify `profile.role === 'admin'` (return 403 if not admin).
- Ensure dual property support (`id` & `_id`, `studentName` & `student_name`, `billing` object, etc.) for frontend compatibility.
- Ensure safe division by zero handling in `admin-stats`.
- In `approve-manual-payment`, support both "Approve" (sets enrolled=true, billing Paid, ticket Approved) and "Reject" (sets enrolled unchanged/ticket Rejected, billing Pending).
- In `approve-teacher-application`, support both "approve" and "reject" actions.

Verification:
- Verify zero occurrences of `@supabase` in all modified/created files.
- Run tests:
  - `node tests/tier1-features/f17-admin-stats-dashboard-api.test.mjs`
  - `node tests/tier1-features/f18-admin-user-management-api.test.mjs`
  - `node tests/tier1-features/f19-admin-teacher-applications-api.test.mjs`
  - `node tests/tier1-features/f20-admin-manual-payment-approval-api.test.mjs`
  - `node tests/tier2-boundaries/auth-matrix-boundaries.test.mjs`
  - `node tests/tier2-boundaries/error-handling-adversarial.test.mjs`
  - `node tests/tier3-interactions/teacher-recruitment-assignment-flow.test.mjs`
  - `node tests/tier3-interactions/billing-ticket-reconciliation-flow.test.mjs`
  - `node tests/m4-empirical-adversarial.test.mjs`
- Run `npx tsc --noEmit` to ensure zero TypeScript errors.
- Document all changes and verification outputs in `handoff.md` in your working directory (`d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m5\handoff.md`).
- Call send_message to parent upon completion.
