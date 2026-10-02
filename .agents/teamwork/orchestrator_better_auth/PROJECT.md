# Project: Learn Quran Academy — Better Auth Migration

## Architecture
- **Web Framework**: Next.js 16 (App Router, async headers) with React 19 & TypeScript.
- **Database & ORM**: PostgreSQL hosted on Neon DB, accessed via Prisma ORM (`@prisma/client`).
- **Connection Model**: Pooled connection (`DATABASE_URL` via PgBouncer) with global Prisma singleton at `src/lib/prisma.ts`.
- **Authentication**: Better Auth (`better-auth`) with Prisma adapter.
  - Server Configuration: `src/lib/auth.ts` initializing `betterAuth` with `prismaAdapter(prisma, { provider: "postgresql" })` and email/password provider.
  - Client SDK: `src/lib/auth-client.ts` initializing `createAuthClient()`.
  - Session Helper: `src/lib/session.ts` providing `getServerSession()` wrapping `auth.api.getSession({ headers: await headers() })`.
  - Route Handler: `src/app/api/auth/[...all]/route.ts` with `toNextJsHandler(auth.handler)`.
  - Edge Middleware: `src/middleware.ts` checking `better-auth.session_token` cookie and public routes (`/api/auth(.*)`).
  - Identity Model: `User.id` mapped 1:1 with `Profile.id` (`Profile.id` references `User.id` with `onDelete: Cascade`), preserving all 59+ existing domain queries (`where: { id: userId }`).
  - Auth UI: Custom Tailwind CSS forms for `/login` and `/register`, custom user state and signout dropdown in `Navbar.tsx`, and Better Auth `signOut()` on all dashboards.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Uninstall Clerk & Install Better Auth | Remove `@clerk/nextjs`, install `better-auth`, update `.env.local` with `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` | M1 | R1, R2 |
| 2 | Prisma Schema Better Auth Models | Add `User`, `Session`, `Account`, `Verification` models; link `Profile.id` to `User.id` via 1:1 Shared Primary Key | M1 | R2 |
| 3 | Prisma Generate & Neon DB Push | Run `npx prisma db push` and `npx prisma generate`, verify database connection | M1 | R2, Acceptance Criteria |
| 4 | Better Auth Server Instance | Create `src/lib/auth.ts` with `betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }), emailAndPassword: { enabled: true } })` | M2 | R2 |
| 5 | Better Auth Client Instance | Create `src/lib/auth-client.ts` with `createAuthClient()` | M2 | R3 |
| 6 | Centralized Session Helper | Create `src/lib/session.ts` with `getServerSession()` using `auth.api.getSession({ headers: await headers() })` | M2 | R4 |
| 7 | Auth Catch-All API Route | Create `src/app/api/auth/[...all]/route.ts` using `toNextJsHandler(auth.handler)` | M2 | R2, R4 |
| 8 | Edge Route Protection Middleware | Refactor `src/middleware.ts` to check `better-auth.session_token` cookie and whitelist `/api/auth(.*)` without Clerk | M2 | R1, R4 |
| 9 | Root Layout Clerk Purge | Remove `<ClerkProvider>` from `src/app/layout.tsx` | M3 | R1 |
| 10 | Custom Tailwind Login Page | Rebuild `src/app/login/page.tsx` using Tailwind CSS and `authClient.signIn.email` | M3 | R3 |
| 11 | Custom Tailwind Register Page | Build/update `src/app/register/page.tsx` with student registration and Better Auth sign-up | M3 | R3 |
| 12 | Navbar Auth State & Signout | Update `src/components/Navbar.tsx` with `useSession()`, custom avatar pill, role display, and `signOut()` | M3 | R1, R3 |
| 13 | Dashboard Signout Handlers | Refactor `useClerk().signOut()` to Better Auth `signOut()` in `dashboard/page.tsx`, `teacher/dashboard/page.tsx`, `admin/dashboard/page.tsx` | M3 | R1, R3 |
| 14 | Protected API Routes Refactor | Refactor 38 session-checking routes in `src/app/api/` to use `getServerSession()` from `src/lib/session.ts` | M4 | R4 |
| 15 | User Provisioning & Deletion API Refactor | Refactor 6 routes (`register`, `add-teacher`, `add-student`, `approve-teacher-application`, `delete-user`, `delete-student`) to use Better Auth / Prisma cascading deletes | M4 | R4 |
| 16 | Zero Clerk Audit in `src/` | Purge all remaining references, comments, variable names, and imports to ensure exactly 0 occurrences of "clerk" in `src/` | M5 | Acceptance Criteria |
| 17 | Production Build Acceptance | Verify `npm run build` compiles with zero TypeScript errors and zero warnings | M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Package Dependencies & Prisma Database Schema | `package.json`, `.env.local`, `prisma/schema.prisma`, `npx prisma db push`, `npx prisma generate` | none | PLANNED |
| M2 | Better Auth Core Infrastructure & Middleware | `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/session.ts`, `src/app/api/auth/[...all]/route.ts`, `src/middleware.ts` | M1 | PLANNED |
| M3 | Authentication UI & Navigation Components | `src/app/layout.tsx`, `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/components/Navbar.tsx`, dashboards signout | M2 | PLANNED |
| M4 | API Routes Migration (Protected Routes & User Management) | 44 API routes in `src/app/api/` (38 session-authenticating, 6 user provisioning/deletion) | M2 | PLANNED |
| M5 | Zero-Clerk Audit, Verification & Build Acceptance | Global text search for "clerk" in `src/`, `npm run build`, forensic integrity audit | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Better Auth Server ↔ Prisma Identity Contract
- Model `User` in `prisma/schema.prisma` is the source of authentication identity.
- Model `Profile` in `prisma/schema.prisma` maintains a 1:1 Shared Primary Key relationship with `User`:
  ```prisma
  model Profile {
    id   String @id
    user User   @relation(fields: [id], references: [id], onDelete: Cascade)
    ...
  }
  ```
- Because `Profile.id === User.id`, all existing queries in `src/app/api/` querying `prisma.profile.findUnique({ where: { id: userId } })` remain completely unchanged and valid.

### Session Retrieval Contract
- File: `src/lib/session.ts`
- Export: `export async function getServerSession()`
- Implementation:
  ```ts
  import { auth } from '@/lib/auth';
  import { headers } from 'next/headers';

  export async function getServerSession() {
    return await auth.api.getSession({
      headers: await headers(),
    });
  }
  ```
- Usage in protected API route handlers:
  ```ts
  import { getServerSession } from '@/lib/session';

  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  ```

### Client Auth Contract
- File: `src/lib/auth-client.ts`
- Export: `export const authClient = createAuthClient();` and `export const { signIn, signUp, signOut, useSession } = authClient;`
- Usage in Client Components:
  ```tsx
  'use client';
  import { authClient } from '@/lib/auth-client';
  const { data: session, isPending } = authClient.useSession();
  await authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/login') } });
  ```

### Edge Middleware Route Matcher Contract
- File: `src/middleware.ts`
- Checks `request.cookies.get("better-auth.session_token")?.value` (or secure cookie variant `__Secure-better-auth.session_token`).
- Allows public routes: `/`, `/about`, `/courses(.*)`, `/teachers(.*)`, `/contact`, `/login`, `/register`, `/api/auth(.*)`, `/api/courses(.*)`, `/api/public-teachers(.*)`, `/api/teacher-application(.*)`.
- Redirects unauthenticated requests to `/login?callbackUrl=...`.

## Code Layout
- `package.json` — Dependencies (`better-auth`, remove `@clerk/nextjs`)
- `.env.local` — Environment variables (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- `prisma/schema.prisma` — Prisma schema with `User`, `Session`, `Account`, `Verification`, `Profile`
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/auth.ts` — Better Auth server instance
- `src/lib/auth-client.ts` — Better Auth client instance
- `src/lib/session.ts` — Server session retrieval helper
- `src/app/api/auth/[...all]/route.ts` — Better Auth catch-all API handler
- `src/middleware.ts` — Edge session route protection middleware
- `src/app/layout.tsx` — Root layout without ClerkProvider
- `src/app/login/page.tsx` — Custom Tailwind login page
- `src/app/register/page.tsx` — Custom Tailwind register page
- `src/components/Navbar.tsx` — Navbar with session state, avatar dropdown, and sign-out
- `src/app/dashboard/page.tsx` — Student dashboard signout
- `src/app/teacher/dashboard/page.tsx` — Teacher dashboard signout
- `src/app/admin/dashboard/page.tsx` — Admin dashboard signout
- `src/app/api/` — 44 refactored route handlers
