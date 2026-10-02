# Dispatch Log

## 2026-09-29T07:19:11Z

Migrate the "Learn Quran Academy" Next.js application from Supabase to Neon DB (using Prisma) and Clerk (for authentication), refactoring all API routes and data fetching to use the new stack.

Requirements:
- R1. Complete Database and Auth Refactor: Completely replace Supabase with Neon DB (using Prisma) and Clerk (for authentication). Rewrite all API routes in src/app/api/ and update data fetching and authentication logic throughout src/app/ and src/components/.
- R2. Fresh Start (No Data Migration): Focus entirely on codebase refactoring. Do not write scripts to migrate existing data. App starts with fresh database.

Acceptance Criteria:
- Running `npm run build` completes successfully with zero TypeScript or build errors.
- A test script (`test-db.mjs`) is created and can be run to successfully insert and read a dummy record from the Neon database, verifying the connection and Prisma setup.

Please maintain your plan.md, progress.md, and BRIEFING.md in your working directory. Dispatch your team/specialists as needed, verify the implementation, and report completion when done.
