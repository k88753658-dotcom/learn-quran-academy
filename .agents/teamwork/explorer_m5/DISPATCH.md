# Dispatch: explorer_m5

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\

## Mission
Investigate and produce a comprehensive technical refactoring blueprint for Milestone M5 (Admin Dashboard API Routes) and preparation for Milestone M6 (Cleanup & Build):
1. Admin Stats & Dashboards API:
   - `src/app/api/admin-stats/route.ts`
   - `src/app/api/admin-students/route.ts`
   - `src/app/api/admin-teachers/route.ts`
   - `src/app/api/admin-classes/route.ts`
   - `src/app/api/admin-billing/route.ts`
2. Admin User Management API:
   - `src/app/api/add-teacher/route.ts`
   - `src/app/api/add-student/route.ts`
   - `src/app/api/assign-teacher/route.ts`
   - `src/app/api/delete-user/route.ts`
   - `src/app/api/delete-student/route.ts`
   - `src/app/api/get-teachers/route.ts`
   - `src/app/api/get-students/route.ts`
3. Admin Teacher Applications API:
   - `src/app/api/get-teacher-applications/route.ts`
   - `src/app/api/approve-teacher-application/route.ts`
   - `src/app/api/reject-teacher-application/route.ts`
4. Admin Manual Payment Approval API:
   - `src/app/api/approve-manual-payment/route.ts`
   - `src/app/api/reject-manual-payment/route.ts`
5. Legacy Announcements API:
   - `src/app/api/get-active-announcements/route.ts`
6. Also incorporate the 4 M4 hardening recommendations:
   - `teacher-attendance`: ensure `filterStudentId` is in teacher's roster
   - `update-student`: ensure teacher can only mutate their own students
   - `attendance` GET: add staff role check
   - `login`: clean up legacy profile leak

## References
- ORIGINAL_REQUEST: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- TEST_INFRA & TEST_READY: `d:\VS CODE\learn-quran-academy\TEST_INFRA.md`, `d:\VS CODE\learn-quran-academy\TEST_READY.md`
- Prisma Schema: `d:\VS CODE\learn-quran-academy\prisma\schema.prisma`

## Instructions
1. Inspect each route to determine:
   - Supabase calls to replace with Prisma (`prisma` from `@/lib/prisma`)
   - Admin authentication check (`auth()`, verify `profile.role === "admin"`)
   - Schema mapping, foreign keys, and response shapes expected by `src/app/admin/dashboard/page.tsx`
2. Check test suites: `tests/tier1-features/f17`, `f18`, `f19`, `f20`, `f21`, `f22`, `f23`.
3. Provide full file-by-file blueprint in `handoff.md`.


## 2026-09-29T15:19:27Z
You are Explorer for Milestone M5 (Admin Dashboard API Routes).
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\DISPATCH.md
Read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
Read d:\VS CODE\learn-quran-academy\PROJECT.md
Read d:\VS CODE\learn-quran-academy\TEST_INFRA.md and TEST_READY.md
Read d:\VS CODE\learn-quran-academy\prisma\schema.prisma

Investigate all admin routes:
- Admin Stats & Dashboards: admin-stats, admin-students, admin-teachers, admin-classes, admin-billing
- Admin User Management: add-teacher, add-student, assign-teacher, delete-user, delete-student, get-teachers, get-students
- Admin Teacher Applications: get-teacher-applications, approve-teacher-application, reject-teacher-application
- Admin Manual Payment Approval: approve-manual-payment, reject-manual-payment
- Legacy Announcements: get-active-announcements
- Hardening items from M4

Inspect frontend contracts in `src/app/admin/dashboard/page.tsx` and test suites `f17`, `f18`, `f19`, `f20`.
Deliver a complete, file-by-file refactoring blueprint in handoff.md in your working directory and notify the parent via send_message.
