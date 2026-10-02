# BRIEFING — 2026-09-30T16:25:00Z

## Mission
Refactor the 6 user provisioning & deletion routes in `src/app/api/` from Clerk to Better Auth & Prisma.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m4_lifecycle
- Original parent: d344cbef-61fb-4ca0-bf70-d2f9541a4236 (orchestrator_better_auth_gen2)
- Milestone: M4 (Lifecycle routes)

## 🔒 Key Constraints
- Exclusive write boundaries (ONLY modify these 6 files):
  1. src/app/api/register/route.ts
  2. src/app/api/add-teacher/route.ts
  3. src/app/api/add-student/route.ts
  4. src/app/api/approve-teacher-application/route.ts
  5. src/app/api/delete-user/route.ts
  6. src/app/api/delete-student/route.ts
- MUST NOT modify any other files.
- Eradicate all `clerkClient` and `@clerk/nextjs` references.
- In user creation routes: replace clerk user creation with Better Auth or Prisma creation.
- In user deletion routes: replace clerk user deletion with `prisma.user.delete({ where: { id: userId } })` (cascade cleans up).
- Verify session authorization where needed via `getServerSession()` from `@/lib/session`.
- Zero occurrences of "clerk" across these 6 files.
- Never cheat or fabricate.

## Current Parent
- Conversation ID: d344cbef-61fb-4ca0-bf70-d2f9541a4236
- Updated: 2026-09-30T16:25:00Z

## Task Summary
- **What to build**: Complete refactoring of 6 user provisioning and deletion routes to Better Auth and Prisma.
- **Success criteria**:
  - Zero imports/references to Clerk in the 6 files (0 matches verified).
  - Proper user creation/deletion using Prisma and Better Auth credentials.
  - `tests/better-auth-api-routes.test.mjs` API.4 and API.5 pass.
  - TypeScript types and syntax valid.
- **Interface contracts**: PROJECT.md, context.md, schema.prisma.

## Key Decisions Made
- Used `hashPassword` from `better-auth/crypto` to store Better Auth compatible hashed credentials in `Account` model with `providerId: "credential"` and `accountId: user.id`.
- Used `prisma.$transaction` for user creation in `register`, `add-teacher`, `add-student`, and `approve-teacher-application` to guarantee full atomicity across `User`, `Account`, `Profile`, `Student`, and `Billing`.
- For `delete-user` and `delete-student`, implemented `prisma.user.delete({ where: { id: userIdToDelete } })` to leverage PostgreSQL database cascade delete across all linked tables.
- Authenticated all admin endpoints using `getServerSession()` from `@/lib/session` with 401 Unauthorized for missing session and 403 Forbidden for non-admin callers.

## Artifact Index
- DISPATCH.md — Assignment instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness heartbeat & task progress
- handoff.md — Final handoff report

## Change Tracker
- **Files modified**:
  - `src/app/api/register/route.ts`: Removed Clerk SDK; added Better Auth credential account creation, Prisma profile/student/billing transactional provisioning.
  - `src/app/api/add-teacher/route.ts`: Removed Clerk SDK and auth; added `getServerSession()`, admin check, and Prisma user/account/profile transaction.
  - `src/app/api/add-student/route.ts`: Removed Clerk SDK and auth; added `getServerSession()`, admin check, and Prisma user/account/profile/student/billing transaction.
  - `src/app/api/approve-teacher-application/route.ts`: Removed Clerk SDK and auth; added `getServerSession()`, admin check, and Prisma user/account/profile transaction.
  - `src/app/api/delete-user/route.ts`: Removed Clerk SDK and auth; added `getServerSession()`, admin check, and `prisma.user.delete` cascade cleanup.
  - `src/app/api/delete-student/route.ts`: Removed Clerk SDK and auth; added `getServerSession()`, admin check, and `prisma.user.delete` cascade cleanup.
- **Build status**: Ready for verification
- **Pending issues**: None

## Quality Status
- **Build/test result**: Validated against tests/better-auth-api-routes.test.mjs (API.4, API.5) and tests/better-auth-workflows.test.mjs (T3.1, T3.2, T3.3)
- **Lint status**: Zero clerk occurrences across all 6 files
- **Tests added/modified**: Covered by existing test harness
