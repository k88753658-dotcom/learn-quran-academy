# BRIEFING — 2026-09-30T05:19:10Z

## Mission
Orchestrate the migration of "Learn Quran Academy" Next.js app from Clerk to Better Auth with Prisma and Neon DB.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth
- Original parent: parent
- Original parent conversation ID: 7929646f-a185-42b2-b30d-71acd5d22b13

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\PROJECT.md
1. **Decompose**: Surveyed full scope with 3 Explorers, created PROJECT.md with architecture, milestones, interface contracts, feature inventory.
2. **Dispatch & Execute**: Direct iteration loop or delegate to sub-orchestrators for milestones (Explorer -> Worker -> Reviewer -> Challenger -> Auditor gate).
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate
4. **Succession**: Self-succeed at 16 spawns: write handoff.md, cancel crons, spawn successor
- **Work items**:
  1. Survey & Project Specification [done]
  2. E2E Test Track [in-progress]
  3. Milestone 1: Package Dependencies & Prisma Database Schema [in-progress]
  4. Milestone 2: Better Auth Core Infrastructure & Middleware [pending]
  5. Milestone 3: Authentication UI & Navigation Components [pending]
  6. Milestone 4: API Routes Migration [pending]
  7. Milestone 5: Verification, Zero-Clerk Audit & Build Acceptance [pending]
- **Current phase**: 2 (Execution)
- **Current focus**: Executing M1 (worker_ba_m1) and E2E Test Writer (test_writer_ba_e2e)

## 🔒 Key Constraints
- Dispatch-only: NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- Only edit metadata/state files (.md) in .agents/teamwork/ folder.
- Hard audit enforcement: auditor integrity violation is a binary veto.
- Zero occurrences of "clerk" in src/ directory.
- `npm run build` must succeed with zero errors.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: 7929646f-a185-42b2-b30d-71acd5d22b13
- Updated: not yet

## Key Decisions Made
- Completed Survey phase with 3 Explorers.
- Architected 1:1 Shared Primary Key linking Better Auth `User` and `Profile` (`Profile.id === User.id`).
- Created authoritative PROJECT.md at `.agents/teamwork/orchestrator_better_auth/PROJECT.md`.
- Dispatched parallel E2E Test Writer and Milestone 1 Worker.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_ba_1 | teamwork_preview_explorer | Survey Clerk footprint across codebase | completed | 0b2fe8ec-6228-4240-acbd-713fa3c46d14 |
| explorer_survey_ba_2 | teamwork_preview_explorer | Survey Prisma schema & Better Auth models | completed | f644db63-5714-4b82-8d55-03a8202782ee |
| explorer_survey_ba_3 | teamwork_preview_explorer | Survey Better Auth API, client hooks & UI | completed | 029aec3b-1a40-4663-a160-38d223b49c11 |
| test_writer_ba_e2e | teamwork_preview_test_writer | E2E Test Suite & Test Infra creation | in-progress | 69409fd5-ae8e-46f1-98b7-71b7e1952a53 |
| worker_ba_m1 | teamwork_preview_worker | Milestone 1 implementation (Deps & Prisma) | in-progress | 74b62b84-a976-4d2a-a235-b1e9ee727d01 |

## Succession Status
- Succession required: no
- Spawn count: 5 / 16
- Pending subagents: 69409fd5-ae8e-46f1-98b7-71b7e1952a53, 74b62b84-a976-4d2a-a235-b1e9ee727d01
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: 7d598a49-2559-46ca-b0d0-9bec91c43a4e/task-16
- Safety timer: covered by heartbeat cron
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md — Authoritative project requirements
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\PROJECT.md — Global project plan and contracts
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\DISPATCH.md — Orchestrator dispatch record
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\BRIEFING.md — Persistent working memory
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth\progress.md — Liveness and status tracking
