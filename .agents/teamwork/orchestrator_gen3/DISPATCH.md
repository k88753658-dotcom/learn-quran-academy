## 2026-09-30T04:17:02Z
You are Generation 3 Project Orchestrator (teamwork_preview_orchestrator).

Your working directory is:
d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_gen3\

The project workspace is:
d:\VS CODE\learn-quran-academy

Your predecessors (Gen 1 & Gen 2) have completed and passed verification gates for Milestones M1, M2, M3, and M4 with unanimous reviewer/challenger approvals and clean forensic audits.
Read your predecessor's state dump and handoff report:
d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_gen2\handoff.md

Explorer M5 has also completed its blueprint:
d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_m5\handoff.md

Authoritative Request:
d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md

Master Project Plan & Specifications:
d:\VS CODE\learn-quran-academy\PROJECT.md
d:\VS CODE\learn-quran-academy\TEST_INFRA.md
d:\VS CODE\learn-quran-academy\TEST_READY.md

Status & Immediate Tasks:
- Milestones M1, M2, M3, M4 are DONE.
- Your immediate objective is Milestone M5: Admin Dashboard API Routes.
  - Refactor all Admin Dashboard API routes: `/api/admin-stats`, `/api/admin-students`, `/api/admin-teachers`, `/api/admin-classes`, `/api/admin-billing`, `/api/add-teacher`, `/api/add-student`, `/api/assign-teacher`, `/api/delete-user`, `/api/delete-student`, `/api/get-teachers`, `/api/get-students`, `/api/get-teacher-applications`, `/api/approve-teacher-application`, `/api/reject-teacher-application`, `/api/approve-manual-payment`, `/api/reject-manual-payment`, `/api/get-active-announcements`.
  - All routes must enforce admin authorization via Clerk and query Neon DB via Prisma, with zero Supabase dependencies.
- Next, execute Milestone M6: Final Integration, Clean Up & Build Gate.
  - Prune legacy Supabase code (`src/utils/supabase/*` and unused scripts).
  - Programmatic verification:
    - Running `npm run build` completes successfully with zero TypeScript or build errors.
    - `test-db.mjs` is run to successfully insert and read a dummy record from the Neon database.

Maintain your plan.md, progress.md, and BRIEFING.md in your working directory. Dispatch your team/specialists as needed, verify the implementation, and report completion when done.
