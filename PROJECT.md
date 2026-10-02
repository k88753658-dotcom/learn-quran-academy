# Project: Learn Quran Academy — Supabase to Neon DB & Clerk Migration

## Architecture
- **Web Framework**: Next.js 16 (App Router) with React 19 & TypeScript.
- **Database & ORM**: PostgreSQL hosted on Neon DB, accessed via Prisma ORM (`@prisma/client`).
- **Connection Model**: Pooled connection (`DATABASE_URL` via PgBouncer) for runtime Next.js server actions / API route queries, direct connection (`DIRECT_URL`) for Prisma migrations and schema push. Singleton instance located at `src/lib/prisma.ts`.
- **Authentication**: Clerk (`@clerk/nextjs`).
  - Identity layer: Clerk user IDs (`user_...`) stored directly in `Profile.id`.
  - Edge Middleware: `src/middleware.ts` using `clerkMiddleware()` with route protection matchers for `/admin`, `/teacher`, `/dashboard`.
  - Client state: `<ClerkProvider>` at `src/app/layout.tsx`, `<SignedIn>`, `<SignedOut>`, `<UserButton>`, and `useClerk().signOut()`.
  - Server auth: `auth()` and `currentUser()` from `@clerk/nextjs/server`.
- **API Layer**: 38 Next.js Route Handlers (`src/app/api/**/route.ts`). All data queries use Prisma; all authenticated operations resolve session via Clerk.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Complete Prisma Schema | 8 models (Profile, Student, Billing, Attendance, Notification, PaymentTicket, Course, TeacherApplication) and Enums | M1 | Survey |
| 2 | Prisma Singleton Client | `src/lib/prisma.ts` with global caching for Next.js Fast Refresh | M1 | Survey |
| 3 | Neon DB Verification Script | `test-db.mjs` verifying connection, insertion, read-back, and deletion on Neon | M1 | Acceptance Criteria |
| 4 | Clerk Provider Root Layout | Wrap `src/app/layout.tsx` in `<ClerkProvider>` | M2 | Survey |
| 5 | Clerk Route Protection Middleware | Replace `proxy.ts` with `src/middleware.ts` using `clerkMiddleware()` | M2 | Survey |
| 6 | Navbar & Client Auth State | Migrate `Navbar.tsx` and dashboard signout buttons to Clerk hooks/components | M2 | Survey |
| 7 | Login & Register Pages | Integrate Clerk authentication into `/login` and `/register` flows | M2 | Survey |
| 8 | Public Courses API | Migrate `/api/courses` (GET, POST) to Prisma | M3 | Survey |
| 9 | Public Teachers & Teach API | Migrate `/api/public-teachers` and `/api/teacher-application` to Prisma | M3 | Survey |
| 10 | Notifications & Tickets API | Migrate `/api/notifications` and `/api/payment-ticket` to Prisma | M3 | Survey |
| 11 | Student Self-Attendance API | Migrate `/api/student-self-attendance` to Prisma | M3 | Survey |
| 12 | Student Dashboard API Routes | Migrate `/api/student-dashboard`, `/api/student-profile`, `/api/student-history`, `/api/student-schedule`, `/api/student-billing` to Prisma & Clerk | M4 | Survey |
| 13 | Teacher Dashboard API Routes | Migrate `/api/teacher-dashboard`, `/api/teacher-schedule`, `/api/teacher-classes`, `/api/teacher-students`, `/api/teacher-attendance`, `/api/update-teacher-profile`, `/api/update-teacher-activity`, `/api/add-availability` to Prisma & Clerk | M4 | Survey |
| 14 | Attendance Management API | Migrate `/api/attendance` (GET, POST, PUT) to Prisma & Clerk | M4 | Survey |
| 15 | Manual Payment Verification API | Migrate `/api/verify-manual-payment` to Prisma | M4 | Survey |
| 16 | Auth API Handlers | Refactor `/api/login` and `/api/register` to use Clerk SDK & Prisma | M4 | Survey |
| 17 | Admin Stats & Dashboards API | Migrate `/api/admin-stats`, `/api/admin-students`, `/api/admin-teachers`, `/api/admin-classes`, `/api/admin-billing` to Prisma & Clerk | M5 | Survey |
| 18 | Admin User Management API | Migrate `/api/add-teacher`, `/api/add-student`, `/api/assign-teacher`, `/api/delete-user`, `/api/get-teachers`, `/api/get-students` to Prisma & Clerk | M5 | Survey |
| 19 | Admin Teacher Applications API | Migrate `/api/get-teacher-applications`, `/api/approve-teacher-application`, `/api/reject-teacher-application` to Prisma & Clerk | M5 | Survey |
| 20 | Admin Manual Payment Approval API | Migrate `/api/approve-manual-payment`, `/api/reject-manual-payment` to Prisma & Clerk | M5 | Survey |
| 21 | Clean Legacy Supabase & Unused Deps | Prune Supabase utilities (`src/utils/supabase/*`), legacy root scripts, and remove Supabase / Mongo dependencies | M6 | Survey |
| 22 | Build Compilation & Type Safety | Verify zero TypeScript errors and successful production build with `npm run build` | M6 | Acceptance Criteria |
| 23 | E2E DB Verification Execution | Run `test-db.mjs` against Neon database and verify passing status | M6 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database Schema & Neon Prisma Client | `prisma/schema.prisma`, `src/lib/prisma.ts`, `test-db.mjs`, `npx prisma generate` | none | DONE |
| M2 | Clerk Auth Infrastructure & Middleware | `src/app/layout.tsx`, `src/middleware.ts`, `src/components/Navbar.tsx`, `/login`, `/register`, remove `src/proxy.ts` | M1 | DONE |
| M3 | Core & Public API Routes | `/api/courses`, `/api/public-teachers`, `/api/teacher-application`, `/api/notifications`, `/api/payment-ticket`, `/api/student-self-attendance` | M1 | DONE |
| M4 | Student & Teacher Dashboard API Routes | 13 Student/Teacher API routes, `/api/attendance`, `/api/verify-manual-payment`, `/api/login`, `/api/register` | M1, M2 | DONE |
| M5 | Admin Dashboard API Routes | 14 Admin API routes (stats, user management, applications, billing approval) | M1, M2 | DONE |
| M6 | Final Integration, Clean Up & Build Gate | Prune unused Supabase code, run `test-db.mjs`, run `npm run build`, audit verification | M1, M2, M3, M4, M5 | DONE |

## Interface Contracts
### Clerk ↔ Prisma Identity Contract
- `Profile.id` directly stores the Clerk user ID (e.g. `"user_2b..."`).
- In API routes:
  ```ts
  import { auth } from '@clerk/nextjs/server';
  import { prisma } from '@/lib/prisma';

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  ```
- User roles are stored in `Profile.role` (`'student' | 'teacher' | 'admin'`).

### Prisma Singleton Contract
- File: `src/lib/prisma.ts`
- Export: `export const prisma = globalForPrisma.prisma ?? new PrismaClient();`
- Import: `import { prisma } from '@/lib/prisma';`

### API Route Response Contract
- Success response: `NextResponse.json({ ...data })`
- Error response: `NextResponse.json({ error: string }, { status: number })`
- Existing frontend expectations (e.g. `{ teachers: [...] }`, `{ stats: [...] }`) MUST be preserved exactly so UI components function seamlessly without edits.

## Code Layout
- `prisma/schema.prisma` — Prisma data model
- `src/lib/prisma.ts` — Prisma client singleton
- `src/middleware.ts` — Clerk edge middleware & route matcher
- `src/app/layout.tsx` — ClerkProvider root wrapper
- `src/app/api/` — Next.js Route Handlers
- `src/app/` — Next.js Pages & Dashboards
- `src/components/` — Shared UI Components
- `test-db.mjs` — Standalone Neon database connection and verification script
