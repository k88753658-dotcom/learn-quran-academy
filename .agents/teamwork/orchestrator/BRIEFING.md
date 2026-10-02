# BRIEFING — 2026-09-29T08:21:30Z

## Mission
Migrate "Learn Quran Academy" Next.js application from Supabase to Neon DB (using Prisma) and Clerk (for authentication), refactoring all API routes and data fetching to use the new stack, passing `npm run build` and verifying database connection via `test-db.mjs`.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator
- Original parent: parent
- Original parent conversation ID: 2023d182-7bfd-4065-87de-7116f2f63775

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: d:\VS CODE\learn-quran-academy\PROJECT.md
1. **Decompose**: Survey codebase with 3 explorers, then decompose into milestones or iterate.
2. **Dispatch & Execute**: Direct (iteration loop) or Delegate (sub-orchestrator).
3. **On failure** (in this order): Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate.
4. **Succession**: Singleton orchestrator retains orchestration responsibility.
- **Work items**:
  1. Survey & Architecture Mapping [done]
  2. Database Schema & Prisma Neon Setup (M1) [done]
  3. Clerk Authentication Setup & Middleware (M2) [Iteration 2 in-progress]
  4. Core & Public API Routes (M3) [in-progress]
  5. Student & Teacher Dashboard API Routes (M4) [pending]
  6. Admin Dashboard API Routes (M5) [pending]
  7. Final Integration, Clean Up & Build Gate (M6) [pending]
- **Current phase**: 2 (M2 Remediation & M3 Implementation)
- **Current focus**: Worker M2 Remediation & Worker M3

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/teamwork/ folder.
- Audit is a binary veto: if auditor reports integrity violation, milestone fails unconditionally.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: 2023d182-7bfd-4065-87de-7116f2f63775
- Updated: not yet

## Key Decisions Made
- Milestone M1 PASSED verification gate.
- E2E Test Suite published (`TEST_INFRA.md`, `TEST_READY.md`).
- Dispatched Worker M2 Remediation to fix `/teach` route matcher in `middleware.ts` and Navbar Clerk v7 compatibility.
- Dispatched Worker M3 in parallel to migrate 6 Core & Public API routes to Prisma.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|---|---|---|---|---|
| worker_m2_remediation | teamwork_preview_worker | M2 Remediation: Middleware & Navbar | in-progress | 3810435b-9a11-4b3d-9654-3d46fd106714 |
| worker_m3 | teamwork_preview_worker | M3: Core & Public API Routes | in-progress | 44efed9a-480b-434c-ba1f-cddff70e4b82 |

## Succession Status
- Succession required: no
- Spawn count: 18
- Predecessor: none
- Successor: none

## Active Timers
- Heartbeat cron: 5151de75-150e-4241-94b2-4b7d5106459c/task-235

## Artifact Index
- d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md — Authoritative User Request
- d:\VS CODE\learn-quran-academy\PROJECT.md — Master Project Specification
- d:\VS CODE\learn-quran-academy\TEST_INFRA.md — E2E Test Suite Specification
- d:\VS CODE\learn-quran-academy\TEST_READY.md — Operational Test Readiness Guide
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator\DISPATCH.md — Orchestrator Dispatch Log
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator\BRIEFING.md — Situational awareness
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator\progress.md — Liveness & iteration status
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator\plan.md — Project plan
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator\GATE_STATUS.md — Gate verdicts
