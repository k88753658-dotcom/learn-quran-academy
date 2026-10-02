## 2026-09-30T05:19:01Z

You are the Worker for Milestone 1 of the Better Auth migration: "Package Dependencies & Prisma Database Schema".
Your working directory is: `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m1`
Your identity is: `worker_ba_m1`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read:
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md` (under `## 2026-09-30T05:06:02Z`)
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\PROJECT.md`
- Survey report: `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\report.md`

File Ownership:
You exclusively own:
- `package.json`
- `.env.local`
- `prisma/schema.prisma`
Do NOT modify any files in `src/` (that is reserved for subsequent milestones).

Tasks:
1. Uninstall `@clerk/nextjs`: run `npm uninstall @clerk/nextjs`.
2. Install `better-auth`: run `npm install better-auth`. (Check if `@better-auth/prisma-adapter` is needed or if built into `better-auth/adapters/prisma` or required as a separate package; consult explorer report).
3. Update `.env.local`:
   Ensure `BETTER_AUTH_SECRET="learn_quran_academy_better_auth_secret_key_2026_super_secure_32_chars"` and `BETTER_AUTH_URL="http://localhost:3000"` are added.
4. Update `prisma/schema.prisma`:
   - Add models `User`, `Session`, `Account`, `Verification` as specified in `explorer_survey_ba_2/report.md`.
   - In `model Profile`, link to `User` via 1:1 Shared Primary Key:
     `user User @relation(fields: [id], references: [id], onDelete: Cascade)`
   - In `model User`, include relation back to `profile Profile?`.
   - Remove any comments referencing Clerk (e.g. lines mentioning Clerk user ID).
5. Run `npx prisma validate` to confirm schema validity.
6. Run `npx prisma db push` to apply the updated schema to Neon PostgreSQL DB.
7. Run `npx prisma generate` to generate the updated Prisma client.
8. Run `node test-db.mjs` to verify database connectivity, insertion, and read operations on Neon DB.
9. Verify all commands pass cleanly.
10. Write your detailed handoff report to `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m1\handoff.md` including exact commands run, outputs, and verification results.
11. Send a completion message to parent (`7d598a49-2559-46ca-b0d0-9bec91c43a4e`).
