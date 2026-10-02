# Generation 2 Orchestration Plan

## Objectives
1. Verify and gate Milestone M3 (The 6 core/public routes: `/api/courses`, `/api/public-teachers`, `/api/teacher-application`, `/api/notifications`, `/api/payment-ticket`, `/api/student-self-attendance`).
2. Implement, verify, and gate Milestone M4 (Student & Teacher Dashboard API routes: 13 routes + attendance + manual payment + auth handlers).
3. Implement, verify, and gate Milestone M5 (Admin Dashboard API routes: 14 routes for stats, users, applications, billing).
4. Implement, verify, and gate Milestone M6 (Prune legacy Supabase code, run `test-db.mjs`, run `npm run build` with zero errors).

## Step-by-Step Execution Plan

### Phase 1: Milestone M3 Gate Verification
- Step 1.1: Verify implementation of the 6 M3 routes (`/api/courses`, `/api/public-teachers`, `/api/teacher-application`, `/api/notifications`, `/api/payment-ticket`, `/api/student-self-attendance`).
- Step 1.2: Dispatch Reviewers (2) to check code quality, types, and Prisma integration.
- Step 1.3: Dispatch Challengers (2) to run empirical/edge tests against M3 routes.
- Step 1.4: Dispatch Auditor (1) for forensic integrity verification.
- Step 1.5: Gate M3.

### Phase 2: Milestone M4 (Student & Teacher Dashboard APIs)
- Step 2.1: Dispatch Explorer to inspect all M4 routes, legacy Supabase usage, auth dependencies, and test coverage.
- Step 2.2: Dispatch Worker to refactor all M4 routes to Prisma & Clerk auth.
- Step 2.3: Dispatch Reviewers (2), Challengers (2), and Auditor (1).
- Step 2.4: Gate M4.

### Phase 3: Milestone M5 (Admin Dashboard APIs)
- Step 3.1: Dispatch Explorer to inspect all M5 admin routes, admin role checks, and schema alignments.
- Step 3.2: Dispatch Worker to refactor M5 routes to Prisma & Clerk auth.
- Step 3.3: Dispatch Reviewers (2), Challengers (2), and Auditor (1).
- Step 3.4: Gate M5.

### Phase 4: Milestone M6 (Cleanup, Integration & Final Build Gate)
- Step 4.1: Dispatch Worker to prune legacy Supabase utilities, dead files, run `test-db.mjs` against Neon, and run `npm run build`.
- Step 4.2: Dispatch Reviewers and Auditor to verify clean build and zero integrity violations.
- Step 4.3: Final Synthesis & Human Reporting.
