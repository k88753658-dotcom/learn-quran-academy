# Exhaustive Codebase Survey: Clerk Usages & Better Auth Migration Plan

**Date**: 2026-09-30  
**Surveyor Identity**: `explorer_survey_ba_1`  
**Repository**: `d:\VS CODE\learn-quran-academy`  
**Target Goal**: Complete removal of Clerk (`@clerk/nextjs`), zero occurrences of `clerk` in `src/`, and migration to Better Auth.

---

## 1. Executive Summary

| Category | Count / Details | Status & Impact |
|---|---|---|
| **Files in `src/` containing "clerk"** | **51 files** | Every single occurrence must be eliminated to satisfy acceptance criteria. |
| **Total occurrences in `src/`** | **121 occurrences** | Includes imports, components, server utilities, SDK calls, variable names, and error logs. |
| **API Route Handlers affected** | **44 routes** (out of 56 total) | 38 session-checking routes + 6 user-provisioning/deletion routes. |
| **UI Components & Pages affected** | **7 files** | `layout.tsx`, `middleware.ts`, `Navbar.tsx`, `login/page.tsx`, 3 dashboard pages. |
| **Server Actions** | **0 files** | No Server Actions exist (`"use server"` count = 0); all mutations use Route Handlers. |
| **Package Dependencies** | `"@clerk/nextjs": "^7.9.7"` | To be uninstalled and replaced with `better-auth`. |
| **Prisma Schema (`schema.prisma`)** | 2 comment lines + `Profile.id` mapping | Needs new models: `User`, `Session`, `Account`, `Verification`. |
| **Environment Configuration** | `.env.local` | Needs addition of `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`. |

---

## 2. Exhaustive Inventory of Affected Files in `src/` (51 Files)

### 2.1. Root Layout & Middleware (2 Files)

| File Path | Clerk Occurrences | Line Numbers | Clerk Symbols & Logic |
|---|---|---|---|
| `src/app/layout.tsx` | 3 | 3, 27, 51 | `import { ClerkProvider } from "@clerk/nextjs"`; `<ClerkProvider appearance={{...}}>...</ClerkProvider>` wrapping `<html><body>`. |
| `src/middleware.ts` | 2 | 1, 45 | `import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"`; `export default clerkMiddleware(async (auth, request) => { const { userId, sessionClaims } = await auth(); ... })`. |

### 2.2. Navigation & Client Components (1 File)

| File Path | Clerk Occurrences | Line Numbers | Clerk Symbols & Logic |
|---|---|---|---|
| `src/components/Navbar.tsx` | 1 | 7 | `import { UserButton, useUser } from "@clerk/nextjs"`; calls `const { isSignedIn, user, isLoaded } = useUser()` (lines 12, 102, 183); renders `<UserButton appearance={{...}} />` on desktop (line 110) and `<UserButton />` in mobile drawer (line 193). |

### 2.3. Frontend Pages & Dashboards (4 Files)

| File Path | Clerk Occurrences | Line Numbers | Clerk Symbols & Logic |
|---|---|---|---|
| `src/app/login/page.tsx` | 2 | 4, 61 | `import { SignIn } from "@clerk/nextjs"`; comment `{/* ===== RIGHT PANEL: CLERK SIGN IN ===== */}`; renders `<SignIn path="/login" routing="path" signUpUrl="/register" fallbackRedirectUrl="/dashboard" ... />` (lines 81–104). |
| `src/app/dashboard/page.tsx` | 2 | 12, 16 | `import { useClerk } from "@clerk/nextjs"`; `const { signOut } = useClerk()`; executes `await signOut({ redirectUrl: "/login" })` in `handleSignOut` (line 79). |
| `src/app/teacher/dashboard/page.tsx` | 2 | 12, 16 | `import { useClerk } from "@clerk/nextjs"`; `const { signOut } = useClerk()`; executes `await signOut({ redirectUrl: '/login' })` in `handleSignOut` (line 96). |
| `src/app/admin/dashboard/page.tsx` | 2 | 6, 47 | `import { useClerk, useUser } from "@clerk/nextjs"`; `const { signOut } = useClerk()`; `const { user, isLoaded } = useUser()` (line 48); executes `await signOut({ redirectUrl: "/login" })` in `handleSignOut` (line 53). |

*(Note: `src/app/register/page.tsx` is already a custom Tailwind UI form that submits to `/api/register`; it does not import Clerk directly, but its target endpoint `/api/register` is heavily reliant on Clerk SDK).*

---

### 2.4. API Routes: User Provisioning & Deletion (6 Files)

These 6 endpoints use `clerkClient` from `@clerk/nextjs/server` to programmatically provision or delete users:

| File Path | Clerk Occurrences | Specific Lines | Key Operations & Clerk Usages |
|---|---|---|---|
| `src/app/api/register/route.ts` | 13 | 2, 41, 42, 44, 45, 53, 54, 55, 59, 65, 68, 80, 136 | `import { clerkClient } from "@clerk/nextjs/server"`; `const client = await clerkClient()`; `client.users.createUser({...})`; assigns `clerkUserId`; persists `id: clerkUserId` to `Profile` and `profileId: clerkUserId` to `Student`; returns `clerkUserId` in JSON response (line 136). |
| `src/app/api/add-student/route.ts` | 13 | 2, 78, 79, 80, 82, 90, 91, 92, 96, 108, 118, 138, 139 | `import { auth, clerkClient } from "@clerk/nextjs/server"`; checks `auth()`; calls `client.users.createUser({...})`; on Prisma transaction failure executes rollback: `await client.users.deleteUser(clerkUserId)`. |
| `src/app/api/add-teacher/route.ts` | 14 | 2, 72, 73, 74, 76, 84, 85, 86, 90, 100, 108, 109, 110, 117 | `import { auth, clerkClient } from "@clerk/nextjs/server"`; checks `auth()`; calls `client.users.createUser({...})`; on Prisma failure executes rollback: `await client.users.deleteUser(clerkUserId)`. |
| `src/app/api/approve-teacher-application/route.ts` | 13 | 2, 89, 90, 93, 101, 102, 103, 107, 116, 129, 150, 151, 173 | `import { auth, clerkClient } from "@clerk/nextjs/server"`; checks admin `auth()`; calls `client.users.createUser({...})` with generated temporary password; rollback: `await client.users.deleteUser(clerkUserId)`. |
| `src/app/api/delete-user/route.ts` | 8 | 2, 52, 71, 86, 88, 89, 90, 91 | `import { auth, clerkClient } from "@clerk/nextjs/server"`; checks admin `auth()`; deletes DB records; calls `await client.users.deleteUser(clerkIdToDelete).catch(() => null)`. |
| `src/app/api/delete-student/route.ts` | 5 | 2, 60, 67, 69, 70 | `import { auth, clerkClient } from "@clerk/nextjs/server"`; checks admin `auth()`; deletes student; calls `await client.users.deleteUser(profileIdToDelete).catch(() => null)`. |

---

### 2.5. API Routes: Standard Session Authentication (38 Files)

Each of these 38 files imports `auth` from `@clerk/nextjs/server` and verifies session identity via `const { userId } = await auth();`:

| # | File Path | Clerk Line | Session Check Line | HTTP Methods | Guarded Entity / Logic |
|---|---|---|---|---|---|
| 1 | `src/app/api/add-availability/route.ts` | 2 | 7 | POST | Teacher schedules / availability |
| 2 | `src/app/api/admin-billing/route.ts` | 2 | 8 | GET, POST, PUT | Admin billing management |
| 3 | `src/app/api/admin-classes/route.ts` | 2 | 8 | GET | Admin class list |
| 4 | `src/app/api/admin-stats/route.ts` | 2 | 8 | GET | Admin dashboard statistics |
| 5 | `src/app/api/admin-students/route.ts` | 2 | 8 | GET | Admin student roster |
| 6 | `src/app/api/admin-teachers/route.ts` | 2 | 8 | GET | Admin teacher roster |
| 7 | `src/app/api/approve-manual-payment/route.ts` | 2 | 8 | POST | Admin payment ticket approval |
| 8 | `src/app/api/assign-task/route.ts` | 2 | 8 | POST | Teacher task assignment |
| 9 | `src/app/api/assign-teacher/route.ts` | 2 | 8 | POST | Admin assigning teacher to student |
| 10 | `src/app/api/attendance/route.ts` | 2 | 15, 95 | GET, POST, PUT | Attendance record operations |
| 11 | `src/app/api/billing/route.ts` | 2 | 12, 73 | GET, POST | User billing queries and updates |
| 12 | `src/app/api/courses/route.ts` | 2 | 24, 73 | POST, PUT | Course creation and modification |
| 13 | `src/app/api/get-active-announcements/route.ts` | 2 | 8 | GET | Student announcement feed |
| 14 | `src/app/api/get-students/route.ts` | 2 | 8 | GET | Filtered student list |
| 15 | `src/app/api/get-teacher-applications/route.ts` | 2 | 8 | GET | Admin teacher applications list |
| 16 | `src/app/api/get-teachers/route.ts` | 2 | 8 | GET | Teacher directory |
| 17 | `src/app/api/live-session/route.ts` | 2 | 49 | POST | Starting/joining classroom video room |
| 18 | `src/app/api/login/route.ts` | 2 | 7 | POST | Legacy login session verification |
| 19 | `src/app/api/make-admin/route.ts` | 2 | 7, 44 | POST, GET | Bootstrapping admin role |
| 20 | `src/app/api/mark-attendance/route.ts` | 2 | 10 | POST | Teacher marking daily student attendance |
| 21 | `src/app/api/my-attendance/route.ts` | 2 | 7, 66 | GET, POST | Student viewing own attendance |
| 22 | `src/app/api/publish-announcement/route.ts` | 2 | 8 | POST | Admin/Teacher publishing announcement |
| 23 | `src/app/api/reject-manual-payment/route.ts` | 2 | 8 | POST | Admin rejecting payment ticket |
| 24 | `src/app/api/reject-teacher-application/route.ts` | 2 | 8 | POST | Admin rejecting teacher application |
| 25 | `src/app/api/student-billing/route.ts` | 2 | 11 | GET | Student invoice and payment status |
| 26 | `src/app/api/student-dashboard/route.ts` | 2, 7 | 8 | GET | Student portal overview data |
| 27 | `src/app/api/student-history/route.ts` | 2 | 11, 71 | GET, POST | Student academic history and milestones |
| 28 | `src/app/api/student-profile/route.ts` | 2, 12 | 14 | GET | Student profile fetching |
| 29 | `src/app/api/student-schedule/route.ts` | 2 | 7 | GET | Student class timetable |
| 30 | `src/app/api/teacher-attendance/route.ts` | 2 | 7 | GET | Teacher viewing class attendance records |
| 31 | `src/app/api/teacher-classes/route.ts` | 2 | 7 | GET | Teacher assigned classes |
| 32 | `src/app/api/teacher-dashboard/route.ts` | 2, 7 | 8 | GET | Teacher overview metrics & roster |
| 33 | `src/app/api/teacher-schedule/route.ts` | 2 | 7 | GET | Teacher weekly schedule |
| 34 | `src/app/api/teacher-students/route.ts` | 2 | 7 | GET | Teacher roster of assigned students |
| 35 | `src/app/api/update-progress/route.ts` | 2 | 7 | POST | Teacher updating student Quran progress |
| 36 | `src/app/api/update-student/route.ts` | 2 | 8 | PUT | Admin/Teacher editing student record |
| 37 | `src/app/api/update-teacher-activity/route.ts` | 2 | 7 | POST | Teacher activity heartbeat update |
| 38 | `src/app/api/update-teacher-profile/route.ts` | 2 | 7 | PUT | Teacher self profile update |

---

## 3. Inventory of Clerk Symbols & Exact Replacement Mapping

| Clerk Symbol | Package Source | Where Used in Codebase | What It Currently Does | Replacement in Better Auth |
|---|---|---|---|---|
| `<ClerkProvider>` | `@clerk/nextjs` | `src/app/layout.tsx` | Wraps application in Clerk React context. | **Remove completely**. Better Auth does not require an outer React context provider; client hooks use `createAuthClient`. |
| `clerkMiddleware()` | `@clerk/nextjs/server` | `src/middleware.ts` | Next.js Edge middleware wrapping route matching and token decoding. | Replace with standard Next.js `export async function middleware(request: NextRequest)` checking session cookie or using Better Auth session API. |
| `createRouteMatcher()` | `@clerk/nextjs/server` | `src/middleware.ts` | Utility to match incoming pathname against pattern arrays. | Replace with standard pathname helper (e.g. `const isPublic = publicPaths.some(p => path.startsWith(p))`). |
| `<SignIn>` | `@clerk/nextjs` | `src/app/login/page.tsx` | Pre-built Clerk sign-in form widget. | Replace with custom Tailwind CSS login form calling `authClient.signIn.email({ email, password })`. |
| `<UserButton>` | `@clerk/nextjs` | `src/components/Navbar.tsx` | Pre-built avatar dropdown with logout button. | Replace with custom avatar icon + dropdown menu with user email/name and custom "Sign Out" button calling `authClient.signOut()`. |
| `useUser()` | `@clerk/nextjs` | `src/components/Navbar.tsx`, `src/app/admin/dashboard/page.tsx` | Returns `{ isSignedIn, user, isLoaded }`. | Replace with Better Auth client hook: `const { data: session, isPending } = authClient.useSession()`. `user = session?.user`, `isSignedIn = !!session?.user`. |
| `useClerk()` / `signOut()` | `@clerk/nextjs` | `src/app/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, `src/app/admin/dashboard/page.tsx` | Provides `signOut({ redirectUrl })`. | Replace with Better Auth client: `await authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })`. |
| `auth()` | `@clerk/nextjs/server` | `src/middleware.ts` + 39 API routes | Extracts `{ userId, sessionClaims }` from incoming request. | Replace with server helper: `const session = await auth.api.getSession({ headers: await headers() })` (or from `req.headers`), extracting `session.user.id`. |
| `clerkClient()` | `@clerk/nextjs/server` | 6 API routes (`register`, `add-student`, `add-teacher`, `approve-teacher-application`, `delete-student`, `delete-user`) | Backend SDK to create users (`client.users.createUser`) or delete users (`client.users.deleteUser`). | Replace with Better Auth server API / direct Prisma operations: `auth.api.signUpEmail` or direct Prisma record insertion for User/Account with hashed password via `bcryptjs`, and standard Prisma cascading deletes for user deletion. |
| Variable names containing `clerk` | Local code | `clerkUserId`, `clerkIdToDelete`, `clerkErr`, `clerkUser` in 6 API routes | Local identifiers and catch block variables. | Rename to neutral identifiers: `authUserId`, `userIdToDelete`, `authError`, `createdUser`. |
| Response JSON keys | `src/app/api/register/route.ts` (line 136) | Returns `{ success: true, studentId, clerkUserId }` | Leaks `clerkUserId` key in JSON contract. | Rename returned property to `userId: newUserId` (client does not inspect this key, only checks `data.success`). |

---

## 4. External Dependencies, Config & Database Survey

### 4.1. Package Dependencies (`package.json`)
- Line 12 currently contains: `"@clerk/nextjs": "^7.9.7"`.
- Must be uninstalled: `npm uninstall @clerk/nextjs`.
- Must install `better-auth`: `npm install better-auth`.

### 4.2. Database Schema (`prisma/schema.prisma`)
Currently, `Profile` holds the primary user identity:
```prisma
/// User profile synchronized with Clerk authentication
model Profile {
  id                 String    @id // Clerk user ID (e.g. user_2b...)
  name               String
  email              String    @unique
  role               UserRole  @default(student)
  ...
}
```
Better Auth standard models required:
1. `User`: `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`, `role`
2. `Session`: `id`, `expiresAt`, `token`, `createdAt`, `updatedAt`, `ipAddress`, `userAgent`, `userId` -> `User`
3. `Account`: `id`, `accountId`, `providerId`, `userId` -> `User`, `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `scope`, `password`, `createdAt`, `updatedAt`
4. `Verification`: `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`

Notice:
- Any comments mentioning `Clerk` in `prisma/schema.prisma` (lines 58, 60) must be sanitized.
- The `Profile` model can either link to `User` via `userId` foreign key or `Profile.id` can directly reference `User.id` so that existing relations (`Student.profileId`, `TeacherStudents`, `Attendance.markedBy`) remain stable.

### 4.3. Environment Variables (`.env.local`)
- Currently in `.env.local`:
  - `DATABASE_URL` (Neon PostgreSQL)
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
  - `STRIPE_SECRET_KEY`, etc.
- No Clerk keys exist in `.env.local`.
- Required additions for Better Auth:
  ```env
  BETTER_AUTH_SECRET="a-secure-random-32-byte-hex-string"
  BETTER_AUTH_URL="http://localhost:3000"
  NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
  ```

### 4.4. Test Suite (`tests/`)
19 test files contain references to Clerk because they were written to verify the Clerk migration:
- `tests/tier1-features/f04-clerk-layout.test.mjs`
- `tests/tier1-features/f05-clerk-middleware.test.mjs`
- `tests/tier1-features/f06-navbar-auth-state.test.mjs`
- `tests/tier1-features/f07-login-register-pages.test.mjs`
- `tests/tier1-features/f16-auth-api-handlers.test.mjs`
- `tests/tier2-boundaries/clerk-client-contracts.test.mjs`
- `tests/clerk-id-fk-integrity.test.mjs`
- `tests/helpers/contract-helpers.mjs`, `mock-context.mjs`, etc.
*(Note: As per the acceptance criteria, the verification rule is `0 occurrences of the word clerk anywhere in the src/ directory` and `npm run build` completing with 0 errors).*

---

## 5. Migration Roadmap & Step-by-Step Implementation Guide

### Phase 1: Package & Database Setup
1. `npm install better-auth` and `npm uninstall @clerk/nextjs`.
2. Update `prisma/schema.prisma`:
   - Add `User`, `Session`, `Account`, `Verification` models.
   - Clean up Clerk comments.
   - Run `npx prisma generate` and `npx prisma db push`.
3. Configure `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in `.env.local`.
4. Create Better Auth configuration files:
   - `src/lib/auth.ts`: instantiate Better Auth with Prisma adapter (`prismaAdapter(prisma, { provider: "postgresql" })`) and email/password provider.
   - `src/lib/auth-client.ts`: instantiate Better Auth client using `createAuthClient()`.
   - `src/app/api/auth/[...all]/route.ts`: route handler using `toNextJsHandler(auth)`.

### Phase 2: Root Layout & Middleware
1. `src/app/layout.tsx`: Remove `<ClerkProvider>` wrapper.
2. `src/middleware.ts`: Replace `clerkMiddleware` with Better Auth session inspection via cookies (`better-auth.session_token`) or `auth.api.getSession`.

### Phase 3: UI Authentication Pages & Components
1. `src/app/login/page.tsx`: Replace `<SignIn>` with custom Tailwind CSS login component using `authClient.signIn.email()`.
2. `src/app/register/page.tsx`: Verify custom registration form interacts seamlessly with the new auth backend.
3. `src/components/Navbar.tsx`: Replace `<UserButton>` and `useUser()` with `authClient.useSession()` and custom dropdown with "Sign Out" button calling `authClient.signOut()`.
4. `src/app/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, `src/app/admin/dashboard/page.tsx`: Replace `useClerk().signOut` with `authClient.signOut`.

### Phase 4: API Routes Refactoring (44 routes)
1. In all 38 session-checking API routes:
   - Remove `import { auth } from "@clerk/nextjs/server"`.
   - Import Better Auth server instance from `@/lib/auth`.
   - Resolve session:
     ```ts
     const session = await auth.api.getSession({ headers: await headers() });
     const userId = session?.user?.id;
     ```
2. In the 6 user-provisioning and deletion routes (`register`, `add-student`, `add-teacher`, `approve-teacher-application`, `delete-student`, `delete-user`):
   - Remove `clerkClient` and `@clerk/nextjs/server`.
   - Use Better Auth user creation / deletion API or direct Prisma transactions.
   - Rename all variable names (`clerkUserId` -> `userId`, `clerkErr` -> `err`).

### Phase 5: Verification & Zero-Clerk Audit
1. Run case-insensitive grep across `src/` to confirm **exactly 0 occurrences of `clerk`**.
2. Run `npm run build` to confirm zero TypeScript and Next.js compilation errors.
