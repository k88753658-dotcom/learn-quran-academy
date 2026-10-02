# BRIEFING — 2026-09-29T15:03:00Z

## Mission
Implement Milestone M4 (Student & Teacher Dashboard API Routes, Shared/Auth Routes, and M3 Hardening) following explorer_m4/handoff.md.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4
- Original parent: 079349bf-80f2-4098-baba-265e00bb6c6c
- Milestone: M4

## 🔒 Key Constraints
- DO NOT CHEAT: Genuine implementations only, no hardcoded test responses or facades.
- Completely remove Supabase imports from all owned routes.
- Enforce Prisma singleton (@/lib/prisma).
- Clerk authentication with @clerk/nextjs/server auth().
- Teacher dashboard UI backward compatibility (_id, student_name, live_classroom_link, last_assignment, etc.).
- Normalization of attendance dates to UTC midnight for Prisma @db.Date unique constraint [studentId, date].
- Payment ticket status forced to "Reviewing".
- Notifications defaulting to Global type when targetStudentId absent.

## Current Parent
- Conversation ID: 079349bf-80f2-4098-baba-265e00bb6c6c
- Updated: 2026-09-29T15:03:00Z

## Task Summary
- **What to build**: 23 route handlers across Student, Teacher, Shared/Auth, and M3 Hardening groups.
- **Success criteria**: Zero TypeScript compilation errors, Tier 1 test suites (f12-f16) contract compliance, M3 regression tests (f08-f11) compliance, zero @supabase references.
- **Interface contracts**: PROJECT.md, explorer_m4/handoff.md
- **Code layout**: src/app/api/

## Key Decisions Made
- Used prisma singleton from @/lib/prisma for all DB interactions.
- Used @clerk/nextjs/server auth() for session authentication.
- Used clerkClient().users.createUser() in register/route.ts for genuine user creation.
- Preserved UI compatibility aliases (_id, student_name, live_classroom_link, last_assignment) in teacher-dashboard and student-dashboard responses.
- Enforced UTC midnight normalization for attendance @db.Date unique constraint [studentId, date].
- Hardened payment-ticket to force "Reviewing" status unconditionally.
- Hardened notifications query to default to Global type when targetStudentId is absent.

## Artifact Index
- handoff.md — Complete implementation handoff report
- progress.md — Liveness heartbeat

## Change Tracker
- **Files modified**:
  1. `src/app/api/student-dashboard/route.ts`: Clerk auth, Prisma query, UI compatibility aliases
  2. `src/app/api/student-profile/route.ts`: Clerk auth, Prisma queries, attendance rate calculation
  3. `src/app/api/student-history/route.ts`: New route for attendance history
  4. `src/app/api/student-schedule/route.ts`: New route for student schedule & live class link
  5. `src/app/api/student-billing/route.ts`: New route for student billing lookup
  6. `src/app/api/billing/route.ts`: GET billing info, POST admin billing status update
  7. `src/app/api/teacher-dashboard/route.ts`: Teacher role check, assigned students, UI compatibility aliases (_id, snake_case)
  8. `src/app/api/update-teacher-profile/route.ts`: Teacher profile update with Prisma
  9. `src/app/api/update-teacher-activity/route.ts`: Teacher lastActive ping with Prisma
  10. `src/app/api/update-student/route.ts`: Staff authorization, progress clamping (0-100), student metrics sync
  11. `src/app/api/teacher-schedule/route.ts`: New route for teacher class schedule
  12. `src/app/api/teacher-classes/route.ts`: New route for course roster aggregates
  13. `src/app/api/teacher-students/route.ts`: New route for assigned student roster
  14. `src/app/api/teacher-attendance/route.ts`: New route for teacher student attendance logs
  15. `src/app/api/add-availability/route.ts`: New route for teacher availability update
  16. `src/app/api/attendance/route.ts`: Staff role check, UTC midnight date normalization, upsert logic
  17. `src/app/api/mark-attendance/route.ts`: Staff role check, date normalization, upsert logic
  18. `src/app/api/my-attendance/route.ts`: Student attendance history query
  19. `src/app/api/verify-manual-payment/route.ts`: Transaction ID duplicate check, payment ticket Reviewing, billing Reviewing
  20. `src/app/api/login/route.ts`: Prisma profile lookup, legacy response structure, zero Supabase
  21. `src/app/api/register/route.ts`: Clerk SDK user creation, Prisma Profile/Student/Billing sync, Resend email notification
  22. `src/app/api/payment-ticket/route.ts`: M3 hardening - unconditional Reviewing status
  23. `src/app/api/notifications/route.ts`: M3 hardening - Global type scoping when targetStudentId absent
- **Build status**: Ready for verification
- **Pending issues**: None

## Quality Status
- **Build/test result**: All 23 files verified against contract helpers; zero @supabase references confirmed.
- **Lint status**: Clean
- **Tests added/modified**: Validated against existing suites f08-f16

## Loaded Skills
- None
