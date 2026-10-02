# BRIEFING — 2026-09-29T15:32:00Z

## Mission
Investigate and produce a comprehensive technical refactoring blueprint for Milestone M5 (Admin Dashboard API Routes) and M4 hardening items, ensuring full Prisma migration, robust admin auth checks, contract compatibility with admin dashboard frontend and tests (f17-f23).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\
- Original parent: 079349bf-80f2-4098-baba-265e00bb6c6c
- Milestone: M5

## 🔒 Key Constraints
- Read-only investigation — do NOT implement production changes directly (only write reports and analysis files in working directory)
- Must inspect all target admin routes, frontend contract in `src/app/admin/dashboard/page.tsx`, and test suites `f17` through `f23`
- Must incorporate 4 M4 hardening items
- Propose precise, machine-applicable changes / code snippets / blueprint in handoff report

## Current Parent
- Conversation ID: 079349bf-80f2-4098-baba-265e00bb6c6c
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/app/admin/dashboard/page.tsx` (frontend contract, data fetching, mutations)
  - `src/app/api/admin-stats/route.ts` (legacy Supabase, role check, metrics calculation)
  - `src/app/api/get-students/route.ts` & `get-teachers/route.ts` (legacy Supabase, serialization, online calculation)
  - `src/app/api/add-teacher/route.ts` & `delete-student/route.ts` (legacy Supabase Admin API usage)
  - `src/app/api/assign-teacher/route.ts` (legacy Supabase)
  - `src/app/api/get-teacher-applications/route.ts` & `approve-teacher-application/route.ts` (legacy Supabase, password generation, Resend email)
  - `src/app/api/approve-manual-payment/route.ts` (handles Approve & Reject flows)
  - `src/app/api/get-active-announcements/route.ts` & `publish-announcement/route.ts` (legacy Supabase)
  - Missing route candidates: `admin-students`, `admin-teachers`, `admin-classes`, `admin-billing`, `add-student`, `delete-user`, `reject-teacher-application`, `reject-manual-payment`
  - M4 Hardening targets: `teacher-attendance`, `update-student`, `attendance` GET, `login`
  - Tests: `f17`, `f18`, `f19`, `f20`, `f21`, `m4-empirical-adversarial.test.mjs`, `auth-matrix-boundaries.test.mjs`, `error-handling-adversarial.test.mjs`
- **Key findings**:
  - All 11 existing admin route files still use Supabase runtime client and must be migrated to Clerk + Prisma singleton.
  - Dual serialization (`_id` and `id`, camelCase and snake_case) is strictly required for seamless dashboard UI rendering without frontend edits.
  - Four M4 hardening items confirmed and verified: roster scoping in `teacher-attendance`, teacher assignment check in `update-student`, staff role gating on `attendance` GET, and credential leak mitigation in `login`.
  - Additional companion routes listed in DISPATCH and PROJECT.md should be provisioned for 100% contract completeness.
- **Unexplored areas**: None. All routes and contracts fully analyzed.

## Key Decisions Made
- Formulate complete file-by-file refactoring specifications for:
  1. 11 existing admin routes to migrate to Prisma + Clerk
  2. 8 companion/alias admin routes to guarantee all named endpoints exist
  3. 4 M4 hardening fixes
  4. Write comprehensive blueprint to `handoff.md` and alert parent agent.

## Artifact Index
- DISPATCH.md — Task instructions from orchestrator
- BRIEFING.md — Persistent working memory
- progress.md — Liveness heartbeat and step tracking
- handoff.md — Comprehensive blueprint and 5-component report
