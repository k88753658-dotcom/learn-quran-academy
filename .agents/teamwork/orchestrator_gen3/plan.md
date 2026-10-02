# Milestone M5 & M6 Execution Plan — Generation 3 Orchestrator

## Overview
Generation 3 Orchestrator will execute and gate the two final milestones of the Learn Quran Academy Supabase-to-Neon/Clerk migration:
1. **Milestone M5**: Admin Dashboard API Routes & M4 Hardening
2. **Milestone M6**: Final Integration, Clean Up & Build Gate

---

## Phase 1: Milestone M5 (Admin Dashboard API Routes & M4 Hardening)

### Step 1.1: Worker Dispatch (`worker_m5`)
- Target files:
  - 11 existing admin routes refactored to Prisma + Clerk:
    - `src/app/api/admin-stats/route.ts`
    - `src/app/api/get-students/route.ts`
    - `src/app/api/get-teachers/route.ts`
    - `src/app/api/add-teacher/route.ts`
    - `src/app/api/assign-teacher/route.ts`
    - `src/app/api/delete-student/route.ts`
    - `src/app/api/get-teacher-applications/route.ts`
    - `src/app/api/approve-teacher-application/route.ts`
    - `src/app/api/approve-manual-payment/route.ts`
    - `src/app/api/get-active-announcements/route.ts`
    - `src/app/api/publish-announcement/route.ts`
  - 8 companion admin routes created:
    - `src/app/api/admin-students/route.ts`
    - `src/app/api/admin-teachers/route.ts`
    - `src/app/api/admin-classes/route.ts`
    - `src/app/api/admin-billing/route.ts`
    - `src/app/api/add-student/route.ts`
    - `src/app/api/delete-user/route.ts`
    - `src/app/api/reject-teacher-application/route.ts`
    - `src/app/api/reject-manual-payment/route.ts`
  - 4 M4 hardening remediations:
    - `src/app/api/teacher-attendance/route.ts`
    - `src/app/api/update-student/route.ts`
    - `src/app/api/attendance/route.ts`
    - `src/app/api/login/route.ts`
- Verification required:
  - Worker must verify zero `@supabase` imports across all M5 routes.
  - Worker must execute feature test suites (`f17`, `f18`, `f19`, `f20`).
  - Worker must run `npx tsc --noEmit` to verify type safety.

### Step 1.2: Verification Team Dispatch
- Spawn 2 Reviewers (`teamwork_preview_reviewer`):
  - Reviewer 1: Code correctness, auth logic, Prisma singleton usage, type safety, error handling.
  - Reviewer 2: Interface contracts, frontend compatibility with `admin/dashboard/page.tsx`, and M4 hardening verification.
- Spawn 2 Challengers (`teamwork_preview_challenger`):
  - Challenger 1: Empirical API test execution (F17-F20, auth matrices, role boundaries).
  - Challenger 2: Adversarial edge cases (division by zero in stats, negative amounts, invalid IDs, injection, privilege escalation).
- Spawn Forensic Auditor (`teamwork_preview_auditor`):
  - Check zero mock data, zero hardcoded responses, authentic Clerk + Prisma logic, no residual `@supabase` calls.

### Step 1.3: Gate Evaluation for M5
- Collect all handoffs and update `GATE_STATUS.md`.
- Ensure all 4 gate conditions pass:
  1. Build / tests pass.
  2. Both Reviewers APPROVE.
  3. Both Challengers confirm empirical correctness.
  4. Forensic Auditor reports CLEAN.

---

## Phase 2: Milestone M6 (Final Integration, Clean Up & Build Gate)

### Step 2.1: Pruning & Neon Live Verification
- Dispatch Worker M6 to:
  - Prune legacy Supabase code: `src/utils/supabase/*`, `src/lib/supabase/*`, unused legacy scripts (`check-admin.mjs`, `fix-admin.mjs`, etc.).
  - Run `node test-db.mjs` against Neon DB live to verify database connection, insertion, read-back, and deletion.
  - Run `npm run build` and ensure Next.js production build succeeds with 0 errors.

### Step 2.2: Milestone M6 Gate Verification
- Reviewers and Forensic Auditor verify build integrity and complete migration.
- Synthesize all findings and report full completion to parent agent.
