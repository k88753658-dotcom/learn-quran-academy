# Better Auth Migration — E2E Test Suite Infrastructure & Specification

**Document Version:** 1.0.0  
**Target Architecture:** Next.js 16 (App Router) + PostgreSQL (Neon DB via Prisma ORM) + Better Auth (`better-auth`)  
**Author:** E2E Test Writer (`test_writer_ba_e2e`)  
**Specification Sources:** `ORIGINAL_REQUEST.md`, `PROJECT.md`, Explorer Reports 1–3  

---

## 1. Test Architecture & Overview

The Learn Quran Academy test suite is designed as an **opaque-box, contract-driven verification system** verifying the complete migration from Clerk to Better Auth. The tests enforce structural, behavioral, security, and interface contracts independently of internal implementation quirks.

### Core Interface Contracts Under Test
1. **Clerk Eradication Contract (R1, Acceptance Criteria)**:
   - Exactly zero occurrences of the word `clerk` (case-insensitive) across all files in `src/`.
   - Complete removal of `<ClerkProvider>` from `src/app/layout.tsx`.
   - Complete removal of `clerkMiddleware` from `src/middleware.ts`.
   - Complete removal of `<UserButton>`, `useUser`, and `useClerk` from `src/components/Navbar.tsx` and all dashboards.
   - Elimination of `@clerk/nextjs` from `package.json`.

2. **Better Auth Identity & Database Schema Contract (R2)**:
   - `prisma/schema.prisma` declares the four canonical Better Auth models: `User`, `Session`, `Account`, and `Verification`.
   - `Profile` model maintains a 1:1 Shared Primary Key relationship with `User`:
     ```prisma
     model Profile {
       id   String @id
       user User   @relation(fields: [id], references: [id], onDelete: Cascade)
       ...
     }
     ```
   - Guarantee: `Profile.id === User.id`, preserving all 59+ domain queries (`where: { id: userId }`) without breaking existing foreign key relations (`Student.profileId`, `Attendance.markedById`).

3. **Server & Client Auth Infrastructure Contract (R2, R4)**:
   - Server instance (`src/lib/auth.ts`): Configured with `betterAuth()`, `prismaAdapter(prisma, { provider: "postgresql" })`, and `emailAndPassword: { enabled: true }`.
   - Client instance (`src/lib/auth-client.ts`): Instantiated with `createAuthClient()`, exporting client hooks (`signIn`, `signUp`, `signOut`, `useSession`).
   - Centralized Session helper (`src/lib/session.ts`): Exports `getServerSession()` calling `auth.api.getSession({ headers: await headers() })`.
   - Catch-all route handler (`src/app/api/auth/[...all]/route.ts`): Routes authentication requests using `toNextJsHandler(auth.handler)`.
   - Edge route protection middleware (`src/middleware.ts`): Validates session cookies (`better-auth.session_token` / `__Secure-better-auth.session_token`) and whitelists public routes including `/api/auth(.*)`.

4. **Authentication UI Contract (R3)**:
   - Login page (`src/app/login/page.tsx`): Custom Tailwind CSS form interacting with `authClient.signIn.email`, handling errors, and redirecting authenticated users.
   - Register page (`src/app/register/page.tsx`): Custom Tailwind CSS form registering students and connecting to Better Auth credentials.
   - Navbar (`src/components/Navbar.tsx`): Custom user avatar/profile pill showing auth status and sign-out trigger using `authClient.signOut`.
   - Dashboards (`src/app/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, `src/app/admin/dashboard/page.tsx`): Unified sign-out handler calling Better Auth `signOut()`.

5. **Protected API Routes & User Management Contract (R4)**:
   - 38 session-checking API routes verify identity via `getServerSession()` and reject unauthenticated requests with `401 Unauthorized`.
   - 6 user provisioning and deletion routes (`register`, `add-teacher`, `add-student`, `approve-teacher-application`, `delete-user`, `delete-student`) manage accounts using Better Auth APIs and Prisma cascading deletes.

---

## 2. Methodology: The 4-Tier Test Architecture

```
+-------------------------------------------------------------------------+
|                  TIER 4: Real-World Workflows & Journeys                |
|  Multi-role RBAC access matrix, full student/teacher/admin lifecycle,   |
|  production build verification, and zero-clerk forensic audit.          |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                TIER 3: Cross-Feature Interactions                       |
|  Interdependent authentication flows: registration -> login -> session  |
|  retrieval -> profile lookup -> cascading user deletion.                |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                TIER 2: Boundaries & Adversarial Resilience              |
|  Negative verification: unauthenticated access, token tampering,        |
|  malformed cookies, edge middleware bypass attempts, schema cascades.   |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                TIER 1: Isolated Feature & Unit Contracts                |
|  Static & structural contracts for all 17 features: zero-clerk audit,   |
|  schema models, auth libraries, API session checks, UI forms.           |
+-------------------------------------------------------------------------+
```

### Tier 1 — Isolated Feature & Unit Contracts
Validates each feature independently against its interface specification:
- **F01**: Zero-Clerk audit across `src/` (0 occurrences, no `@clerk/nextjs` in `package.json`).
- **F02**: Better Auth models in `prisma/schema.prisma` (`User`, `Session`, `Account`, `Verification`).
- **F03**: `Profile` ↔ `User` 1:1 Shared Primary Key and cascade rule (`Profile.id === User.id`).
- **F04**: Better Auth server instance in `src/lib/auth.ts`.
- **F05**: Better Auth client instance in `src/lib/auth-client.ts`.
- **F06**: Centralized session helper in `src/lib/session.ts`.
- **F07**: Catch-all auth route handler in `src/app/api/auth/[...all]/route.ts`.
- **F08**: Edge route protection middleware in `src/middleware.ts`.
- **F09**: Root layout clean of `<ClerkProvider>` in `src/app/layout.tsx`.
- **F10**: Custom Tailwind login form in `src/app/login/page.tsx`.
- **F11**: Custom Tailwind register form in `src/app/register/page.tsx`.
- **F12**: Navbar session state and sign-out in `src/components/Navbar.tsx`.
- **F13**: Dashboard sign-out handlers across student, teacher, and admin dashboards.
- **F14**: Session verification across all 38 protected API routes.
- **F15**: User provisioning in registration and administrative creation routes.
- **F16**: User deletion and cascade handling in user deletion endpoints.
- **F17**: Production build and TypeScript type-safety compilation.

### Tier 2 — Boundaries & Adversarial Resilience
Evaluates edge cases, malformed payloads, and security boundaries:
- **T2.1: Token & Cookie Boundaries**: Missing cookies, invalid signatures, malformed cookie values, expired session tokens.
- **T2.2: Unauthenticated Route Rejection**: Direct API invocation without valid session tokens yields strict `401 Unauthorized` JSON responses.
- **T2.3: Edge Middleware Gatekeeping Matrix**: Public paths (`/`, `/about`, `/login`, `/register`, `/api/auth/*`) pass freely; private paths (`/dashboard`, `/teacher/dashboard`, `/admin/*`) intercept and redirect to `/login`.
- **T2.4: Schema Constraint & Cascade Integrity**: Verifies cascade rules ensuring deletion of a `User` cascades to delete associated `Session`, `Account`, and `Profile` records without orphaned domain data.
- **T2.5: Adversarial Inputs**: Special characters, SQL injection strings, unicode Arabic script in inputs, and empty credentials.

### Tier 3 — Cross-Feature Interactions
Tests multi-step operational chains across multiple subsystems:
- **T3.1: Student Registration & Authentication Lifecycle**: Registration payload -> User and Profile creation -> Credential verification -> Session issuance -> Authenticated API access -> Sign-out.
- **T3.2: Teacher Recruitment & Approval Flow**: Application submission -> Admin approval -> Account provisioning -> First login -> Dashboard access.
- **T3.3: User Deletion & Cascade Cleanliness**: Verification that deleting a student or teacher cleans up authentication records and profile links without orphaned references.
- **T3.4: Session Invalidation & Re-login**: Session revocation correctly propagates across server session helpers and edge middleware.

### Tier 4 — Real-World Workflows & Journeys
Validates end-to-end user journeys and system-wide invariants:
- **T4.1: Role-Based Access Control (RBAC) Matrix**: Verification of Student, Teacher, Admin, and Guest privileges across pages and API routes.
- **T4.2: Zero-Clerk Forensic Integrity Audit**: Exhaustive scan across the entire `src/` directory ensuring zero lingering references, variable names, or comments.
- **T4.3: Production Build Acceptance**: Successful `npm run build` execution with zero compile errors and clean static page generation.

---

## 3. Test Suite Implementation Structure

All test scripts reside in the `tests/` directory and run via standard `node <file>` without external dependencies:

```
tests/
├── helpers/
│   ├── test-harness.mjs                # Zero-dependency async test harness
│   ├── contract-helpers.mjs            # AST & schema parsing utilities
│   ├── better-auth-helpers.mjs         # Better Auth contract inspection helpers
│   └── mock-context.mjs                # Request/response mock generators
├── e2e-clerk-zero.test.mjs             # Standalone test for R1 & Clerk elimination
├── better-auth-schema.test.mjs         # Standalone test for R2 database schema
├── better-auth-core.test.mjs           # Standalone test for R2 core auth libs & middleware
├── better-auth-ui.test.mjs             # Standalone test for R3 UI components & navbar
├── better-auth-api-routes.test.mjs     # Standalone test for R4 protected API routes
├── better-auth-adversarial.test.mjs    # Standalone test for Tier 2 boundary conditions
├── better-auth-workflows.test.mjs      # Standalone test for Tier 3 & Tier 4 workflows
├── e2e-better-auth.test.mjs            # Master E2E runner for all 4 tiers
└── run-better-auth-tests.mjs           # Unified CLI runner with tier filtering
```

---

## 4. Feature Checklist & Coverage Mapping

| Req | Feature Code | Target File(s) | Test Suite File | Tier | Verification Rule |
|---|---|---|---|---|---|
| R1 | F01 | `src/**/*`, `package.json` | `tests/e2e-clerk-zero.test.mjs` | T1 | Exact 0 occurrences of "clerk" |
| R2 | F02 | `prisma/schema.prisma` | `tests/better-auth-schema.test.mjs` | T1 | User, Session, Account, Verification models exist |
| R2 | F03 | `prisma/schema.prisma` | `tests/better-auth-schema.test.mjs` | T1 | `Profile.id` maps 1:1 to `User.id` with `onDelete: Cascade` |
| R2 | F04 | `src/lib/auth.ts` | `tests/better-auth-core.test.mjs` | T1 | `betterAuth` initialized with prismaAdapter & email/pass |
| R2 | F05 | `src/lib/auth-client.ts` | `tests/better-auth-core.test.mjs` | T1 | `createAuthClient` initialized and exported |
| R2 | F06 | `src/lib/session.ts` | `tests/better-auth-core.test.mjs` | T1 | `getServerSession` exported with `auth.api.getSession` |
| R2 | F07 | `src/app/api/auth/[...all]/route.ts` | `tests/better-auth-core.test.mjs` | T1 | `toNextJsHandler(auth.handler)` exported for GET/POST |
| R1, R4 | F08 | `src/middleware.ts` | `tests/better-auth-core.test.mjs` | T1 | Checks session token cookie; public whitelist |
| R1 | F09 | `src/app/layout.tsx` | `tests/better-auth-ui.test.mjs` | T1 | No `<ClerkProvider>` wrapping |
| R3 | F10 | `src/app/login/page.tsx` | `tests/better-auth-ui.test.mjs` | T1 | Custom form with Tailwind & `authClient.signIn` |
| R3 | F11 | `src/app/register/page.tsx` | `tests/better-auth-ui.test.mjs` | T1 | Custom form with Tailwind & registration flow |
| R1, R3 | F12 | `src/components/Navbar.tsx` | `tests/better-auth-ui.test.mjs` | T1 | `useSession` hook, profile avatar pill, `signOut` |
| R1, R3 | F13 | `src/app/**/dashboard/page.tsx` | `tests/better-auth-ui.test.mjs` | T1 | Sign-out handlers use Better Auth `signOut` |
| R4 | F14 | `src/app/api/**/route.ts` (38) | `tests/better-auth-api-routes.test.mjs` | T1 | All 38 routes use `getServerSession()` |
| R4 | F15 | `src/app/api/{register,add-*}` | `tests/better-auth-api-routes.test.mjs` | T1 | User provisioning via Better Auth / Prisma |
| R4 | F16 | `src/app/api/delete-*` | `tests/better-auth-api-routes.test.mjs` | T1 | User deletion via Prisma cascade |
| Acc | F17 | `package.json`, build pipeline | `tests/better-auth-workflows.test.mjs` | T4 | `npm run build` succeeds |
| Sec | T2.1–5 | Auth tokens & middleware | `tests/better-auth-adversarial.test.mjs` | T2 | Negative tests & boundary handling |
| E2E | T3.1–4 | End-to-end interactions | `tests/better-auth-workflows.test.mjs` | T3 | Full state machine & lifecycle checks |
| E2E | T4.1–3 | RBAC & System Journeys | `tests/better-auth-workflows.test.mjs` | T4 | Complete user persona validation |

---

## 5. Quality Thresholds & Pass Criteria

1. **Zero-Clerk Threshold**: Exactly 0 occurrences of the regex `\bclerk\b` (case-insensitive) in any file under `src/`. Zero `@clerk` packages in `package.json`.
2. **Build Success**: `npm run build` exits with code `0`, generating all static and dynamic routes with zero TypeScript diagnostics.
3. **Identity Preservation**: 100% of domain queries querying `prisma.profile.findUnique({ where: { id: userId } })` must resolve against `session.user.id`.
4. **All Tiers Green**: All Tier 1, Tier 2, Tier 3, and Tier 4 test suites pass cleanly.
