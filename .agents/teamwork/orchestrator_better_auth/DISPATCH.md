# Dispatch Instructions

## 2026-09-30T05:07:03Z

You are the Project Orchestrator for the Better Auth migration of "Learn Quran Academy".
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth
Your identity is: teamwork_preview_orchestrator

Authoritative project requirements are recorded in:
d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md (under the 2026-09-30T05:06:02Z section).

Task Summary:
Migrate the "Learn Quran Academy" Next.js application's authentication system from Clerk to the open-source "Better Auth" library. The application already uses Prisma and Neon DB; you must update the Prisma schema to accommodate Better Auth and refactor all frontend/backend code to use it.

Key Requirements:
1. R1. Remove Clerk: Completely uninstall @clerk/nextjs and remove all Clerk components (<ClerkProvider>, <SignInButton>, <UserButton>, etc.) from the application, including root layout, middleware, and Navbar.
2. R2. Setup Better Auth & Prisma: Install better-auth. Update prisma/schema.prisma to include standard Better Auth required models (User, Session, Account, Verification). Ensure existing Profile or user relations map correctly to new Auth models. Generate new Prisma client.
3. R3. Rebuild Authentication UI: Implement custom Login and Register pages (using Tailwind CSS) that interface with Better Auth's client-side hooks (signIn, signUp). Update Navbar to show user's state and sign-out button.
4. R4. Refactor API Routes: Update all protected API routes in src/app/api/ and Server Actions to verify sessions using Better Auth's server-side session checks instead of Clerk's auth().

Acceptance Criteria:
- Running `npm run build` completes successfully with zero TypeScript or build errors.
- A global text search confirms exactly 0 occurrences of the word "clerk" anywhere in the src/ directory.

Decompose the work into milestones, spawn specialists (explorers, workers, reviewers/challengers), maintain your progress.md and BRIEFING.md, and report back when finished.
