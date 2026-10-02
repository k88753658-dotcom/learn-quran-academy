## 2026-09-30T05:08:16Z

Read `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically `## 2026-09-30T05:06:02Z`).
Your working directory is `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2`.
Your identity is `explorer_survey_ba_2`.
Your role is to survey the Prisma schema, database models, and Better Auth Prisma adapter requirements for `d:\VS CODE\learn-quran-academy`.

Tasks:
1. Inspect `prisma/schema.prisma` and identify all current models, fields, enums, and relations (specifically `Profile` or existing user-related models, and any relations to courses, enrollments, bookings, reviews, etc.).
2. Detail the exact schema requirements for Better Auth with Prisma adapter:
   - Required models: `User`, `Session`, `Account`, `Verification`.
   - Field names, data types, primary keys, foreign keys, unique constraints, and relation fields required by Better Auth.
   - How existing models (like `Profile`) should relate to `User` (e.g. `userId` referencing `User.id` or merging fields).
   - What needs to be preserved so existing application queries don't break.
3. Check `src/lib/prisma.ts` or database client setup, environment variables (`DATABASE_URL`, etc.).
4. Determine the exact steps required to install `better-auth`, update `schema.prisma`, and run Prisma client generation.
5. Write your detailed findings and schema migration plan to `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\report.md` and complete your `handoff.md`.
6. Send a message to parent (`7d598a49-2559-46ca-b0d0-9bec91c43a4e`) when complete.

Constraints: Read-only exploration. Do NOT modify source code files. Do NOT write code.
