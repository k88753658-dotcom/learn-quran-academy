# BRIEFING — 2026-09-30T05:16:50Z

## Mission
Survey the Prisma schema, database models, and Better Auth Prisma adapter requirements for learn-quran-academy to prepare a detailed schema migration plan for migrating from Clerk to Better Auth.

## 🔒 My Identity
- Archetype: explorer
- Roles: survey, analysis, synthesis
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2
- Original parent: 7d598a49-2559-46ca-b0d0-9bec91c43a4e
- Milestone: Milestone 1 - Survey & Schema Analysis

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify source code files. Do NOT write code.

## Current Parent
- Conversation ID: 7d598a49-2559-46ca-b0d0-9bec91c43a4e
- Updated: not yet

## Investigation State
- **Explored paths**: `prisma/schema.prisma`, `src/lib/prisma.ts`, `.env.local`, `package.json`, `PROJECT.md`, `src/middleware.ts`, `src/app/api/**`
- **Key findings**:
  - Existing schema has 8 models (`Profile`, `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, `Course`, `TeacherApplication`) and 6 enums.
  - 59+ queries across the codebase query `prisma.profile` with `where: { id: userId }`, expecting `Profile.id` to be the auth ID.
  - Better Auth requires `User`, `Session`, `Account`, `Verification`.
  - Optimal design is Shared Primary Key: `Profile.id` references `User.id` with `onDelete: Cascade`.
  - In Better Auth, credentials/passwords reside in `Account` under `providerId: "credential"`.
  - `src/lib/prisma.ts` singleton is 100% ready for `prismaAdapter(prisma, { provider: "postgresql" })`.
- **Unexplored areas**: None. Survey is complete.

## Key Decisions Made
- Keep `Profile` separate from `User` and link them via 1:1 Shared Primary Key (`Profile.id` = `User.id`).
- Add `role` to `User` via `user.additionalFields` for session tokens, while keeping `Profile.role` enum for domain operations.

## Artifact Index
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\report.md` — Detailed survey findings and schema migration plan
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\handoff.md` — 5-component handoff report
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\DISPATCH.md` — Inbound instructions log
- `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\progress.md` — Activity and progress tracking
