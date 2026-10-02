# BRIEFING — 2026-09-29T07:31:00Z

## Mission
Conduct a comprehensive authentication and client-side data fetching survey of Learn Quran Academy codebase, analyzing all auth flows, Supabase client data fetching, role checking, and detailing full migration to Clerk and Prisma/Neon.

## 🔒 My Identity
- Archetype: teamwork_preview_explorer
- Roles: Explorer, Synthesizer
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\
- Original parent: 5151de75-150e-4241-94b2-4b7d5106459c
- Milestone: Explorer Survey 3 (Auth & Client Data Fetching)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do not modify source code in src/
- Only write metadata, reports, and handoffs in working directory
- Produce comprehensive auth & client data fetching migration plan

## Current Parent
- Conversation ID: 5151de75-150e-4241-94b2-4b7d5106459c
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/app/` (all 21 pages/layouts including login, register, dashboards, student-portal, payment-terminal)
  - `src/components/` (all 15 components including Navbar, TeachersSection, PrayerTimes, ReportGenerator)
  - `src/app/api/` (all 38 API route directories analyzed for auth and data queries)
  - `src/proxy.ts` and `src/utils/supabase/*`
  - `prisma/schema.prisma` and `supabase_schema.sql`
  - `package.json` and node_modules Clerk v7 exports
- **Key findings**:
  - Zero direct Supabase client calls in React client components or pages (all data fetching is mediated via `fetch('/api/...')`).
  - Auth relies on `/api/login`, `localStorage`, cookie manipulation, and unstandardized `src/proxy.ts`.
  - Clerk v7.9.7 is already installed in `package.json`.
  - `Profile.id` maps directly to Clerk `userId`.
  - Discovered missing `TeacherApplication` model and extra `Profile` fields in `prisma/schema.prisma`.
- **Unexplored areas**: None (survey complete).

## Key Decisions Made
- Recommending Clerk `<SignIn />` on `/login`, custom rich form on `/register` submitting to `/api/register` with `clerkClient().users.createUser()`.
- Standardizing Next.js middleware at `src/middleware.ts` with `clerkMiddleware` and public/role-based route matchers.
- Updating Navbar with Clerk `<SignedIn>`, `<SignedOut>`, `<UserButton />`.
- Updating sidebar logout handlers in all 3 dashboards to use `useClerk().signOut()`.

## Artifact Index
- d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\report.md — Comprehensive Auth and Data Fetching Migration Report
- d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\handoff.md — 5-Component Handoff Summary
