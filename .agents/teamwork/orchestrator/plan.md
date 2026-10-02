# Migration Plan: Learn Quran Academy (Supabase -> Neon DB + Clerk)

## Objectives
1. Migrate from Supabase to Neon DB (PostgreSQL) using Prisma ORM.
2. Replace Supabase Auth with Clerk Authentication throughout the Next.js app.
3. Refactor all API routes in `src/app/api/` to use Prisma and Clerk.
4. Refactor data fetching and auth components in `src/app/` and `src/components/`.
5. Maintain zero build errors with `npm run build`.
6. Provide a working `test-db.mjs` script verifying connection and Prisma operations on Neon.

## Phases
- **Phase 0: Survey**
  - Explorer 1: Codebase structure, package.json dependencies, environment variables, Supabase usage inventory (where Supabase client, queries, and auth are used).
  - Explorer 2: Database schema reverse engineering (extract existing tables, columns, relations, types from Supabase types/schema or code) to design the Prisma schema for Neon.
  - Explorer 3: Clerk integration analysis (Next.js middleware, auth hooks/components, user session handling, protected routes vs public routes).
- **Phase 1: Architecture & Decomposition (PROJECT.md)**
  - Synthesize Explorer reports into `PROJECT.md` with Feature Inventory and Interface Contracts.
- **Phase 2: Database & Prisma Setup**
  - Install dependencies: `@prisma/client`, `prisma`, `@clerk/nextjs`, etc. Remove `@supabase/*`.
  - Create `prisma/schema.prisma` targeting PostgreSQL (Neon).
  - Create `src/lib/prisma.ts` singleton client.
  - Create and verify `test-db.mjs`.
- **Phase 3: Clerk Auth Integration**
  - Configure Clerk middleware (`middleware.ts`).
  - Configure ClerkProvider in root layout (`src/app/layout.tsx`).
  - Refactor login/signup/profile components and header auth controls.
- **Phase 4: API Routes & Data Fetching Refactor**
  - Refactor all routes in `src/app/api/` to use Prisma for database operations and Clerk for authentication.
  - Refactor client and server components in `src/app/` and `src/components/` that call Supabase.
- **Phase 5: Verification & Gate**
  - Reviewer + Challenger + Forensic Auditor verification.
  - Run `npm run build` with zero errors.
  - Run `node test-db.mjs` with success.
