## 2026-09-29T07:34:43Z
You are Worker M1 (teamwork_preview_worker).
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m1\
The authoritative user request is located at:
d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read d:\VS CODE\learn-quran-academy\PROJECT.md and d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_2\report.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You have exclusive write ownership over:
- prisma/schema.prisma
- src/lib/prisma.ts
- test-db.mjs

Your Task:
1. Update `prisma/schema.prisma` with the complete PostgreSQL/Neon schema documented in Explorer 2's report (`.agents/teamwork/explorer_survey_2/report.md` Section 5). Ensure all 8 models (`Profile`, `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, `Course`, `TeacherApplication`) and enums (`BillingStatus`, `AttendanceStatus`, `UserRole`, etc.) are present with correct `@map` / `@@map` attributes, `markedBy` relation, and `Profile.id String @id` for Clerk user IDs.
2. Create `src/lib/prisma.ts` with the global PrismaClient singleton for Next.js Fast Refresh.
3. Create `test-db.mjs` verifying connection to Neon database: insert a dummy record (e.g. into Course or Profile), read it back, verify values, and delete the dummy record.
4. Run `npx prisma generate` to generate the Prisma client types.
5. Run `node test-db.mjs` to execute the database verification test against Neon.
6. Record command outputs, test results, and file diffs in your handoff report at `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m1\handoff.md`.
7. Update progress.md with timestamped logs. When finished, send a message to parent with your handoff path.
