# Original User Request

## 2026-09-29T07:18:29Z

Migrate the "Learn Quran Academy" Next.js application from Supabase to Neon DB (using Prisma) and Clerk (for authentication), refactoring all API routes and data fetching to use the new stack.

Working directory: d:\VS CODE\learn-quran-academy
Integrity mode: development

## Requirements

### R1. Complete Database and Auth Refactor
Refactor the entire Next.js application to completely replace Supabase with Neon DB (using Prisma) and Clerk (for authentication). This involves rewriting all API routes in `src/app/api/` and updating data fetching and authentication logic throughout the `src/app/` and `src/components/` directories.

### R2. Fresh Start (No Data Migration)
Focus entirely on the codebase refactoring. Do not write scripts to migrate existing data from Supabase; the app will start with a fresh database.

## Acceptance Criteria

### Programmatic Verification
- [ ] Running `npm run build` completes successfully with zero TypeScript or build errors.
- [ ] A test script (`test-db.mjs`) is created and can be run to successfully insert and read a dummy record from the Neon database, verifying the connection and Prisma setup.

## 2026-09-29T14:13:19Z

Please resume your work on Milestone 3 where you left off before the system restart. Update me on your status.

## 2026-09-30T04:16:00Z

Please resume your work on Milestone 5 where you left off before the system restart. Update me on your status.

## 2026-09-30T05:06:02Z

Migrate the "Learn Quran Academy" Next.js application's authentication system from Clerk to the open-source "Better Auth" library. The application already uses Prisma and Neon DB; you must update the Prisma schema to accommodate Better Auth and refactor all frontend/backend code to use it.

Working directory: d:\VS CODE\learn-quran-academy
Integrity mode: development

## Requirements

### R1. Remove Clerk
Completely uninstall `@clerk/nextjs` and remove all Clerk components (`<ClerkProvider>`, `<SignInButton>`, `<UserButton>`, etc.) from the application, including the root layout, middleware, and Navbar.

### R2. Setup Better Auth & Prisma
Install `better-auth`. Update `prisma/schema.prisma` to include the standard Better Auth required models (`User`, `Session`, `Account`, `Verification`). Ensure the existing `Profile` or user relations map correctly to the new Auth models. Generate the new Prisma client.

### R3. Rebuild Authentication UI
Since Clerk's pre-built UI is being removed, implement custom Login and Register pages (using Tailwind CSS) that interface with Better Auth's client-side hooks (`signIn`, `signUp`). Update the Navbar to show the user's state and a sign-out button.

### R4. Refactor API Routes
Update all protected API routes in `src/app/api/` and Server Actions to verify sessions using Better Auth's server-side session checks instead of Clerk's `auth()`.

## Acceptance Criteria

### Programmatic Verification
- [ ] Running `npm run build` completes successfully with zero TypeScript or build errors.
- [ ] A global text search confirms there are exactly `0` occurrences of the word `clerk` anywhere in the `src/` directory.

## 2026-09-30T13:11:06Z

Please resume your work on the Better Auth migration. You were in the middle of Milestone 1 — you had already uninstalled @clerk/nextjs, installed better-auth v1.7.6, and updated prisma/schema.prisma with Better Auth models (User, Session, Account, Verification). You were finalizing Prisma client generation and pushing to Neon DB. Please pick up from there and continue through the remaining milestones. Update me on your status.

## 2026-09-30T15:59:59Z

Please resume your work on the Better Auth migration where you left off. Update me on your status.
