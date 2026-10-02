## 2026-09-30T04:29:53Z

You are Reviewer M5-1 (teamwork_preview_reviewer) for Milestone M5 of Learn Quran Academy.
Your working directory is:
d:\VS CODE\learn-quran-academy\.agents\teamwork\reviewer_m5_1\

Your parent is Generation 3 Project Orchestrator (conversation ID: f00879c7-968e-40b9-8787-a644c0104d23).
You MUST communicate all updates and final results using send_message to your parent.

Context:
1. ORIGINAL_REQUEST: d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
2. PROJECT.md: d:\VS CODE\learn-quran-academy\PROJECT.md
3. Worker M5 handoff: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m5\handoff.md
4. Explorer M5 blueprint: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\handoff.md

Your Task:
Conduct an objective and rigorous code review of the 11 refactored admin routes and 8 companion admin routes:
- Group 1:
  `src/app/api/admin-stats/route.ts`
  `src/app/api/get-students/route.ts`
  `src/app/api/get-teachers/route.ts`
  `src/app/api/add-teacher/route.ts`
  `src/app/api/assign-teacher/route.ts`
  `src/app/api/delete-student/route.ts`
  `src/app/api/get-teacher-applications/route.ts`
  `src/app/api/approve-teacher-application/route.ts`
  `src/app/api/approve-manual-payment/route.ts`
  `src/app/api/get-active-announcements/route.ts`
  `src/app/api/publish-announcement/route.ts`
- Group 2:
  `src/app/api/admin-students/route.ts`
  `src/app/api/admin-teachers/route.ts`
  `src/app/api/admin-classes/route.ts`
  `src/app/api/admin-billing/route.ts`
  `src/app/api/add-student/route.ts`
  `src/app/api/delete-user/route.ts`
  `src/app/api/reject-teacher-application/route.ts`
  `src/app/api/reject-manual-payment/route.ts`

Review Criteria:
1. Complete removal of `@supabase` and `@/utils/supabase` in all routes.
2. Clerk authentication (`auth()`, role verification) on all admin routes (401 if unauthenticated, 403 if not admin).
3. Exclusive use of `prisma` from `@/lib/prisma`.
4. Robust error handling and transaction rollback (e.g. Clerk rollback if DB creation fails).
5. Run the feature test suites (`node tests/tier1-features/f17-admin-stats-dashboard-api.test.mjs`, `f18`, `f19`, `f20`).
6. Run `npx tsc --noEmit` to verify type safety.

Write a structured handoff report in your working directory (`handoff.md`) with your verdict (APPROVE or REQUEST_CHANGES), and send a completion message with your verdict.
