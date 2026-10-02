# BRIEFING — 2026-09-30T16:28:00Z

## Mission
Refactor the 38 protected session-authenticating API routes in `src/app/api/` from Clerk to Better Auth (`getServerSession` from `@/lib/session`).

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist (Protected Routes Session Specialist)
- Working directory: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m4_session
- Original parent: d344cbef-61fb-4ca0-bf70-d2f9541a4236 (orchestrator_better_auth_gen2)
- Milestone: M4 (Protected API Routes Session Migration)

## 🔒 Key Constraints
- Exclusive write boundaries: The 38 protected session route files listed in `context.md`. MUST NOT modify any other files.
- Eradicate all `@clerk/nextjs` and `@clerk/nextjs/server` imports and calls (`auth()`, `currentUser()`).
- Replace with `getServerSession()` from `@/lib/session`.
- Return 401 Unauthorized for unauthenticated requests.
- Ensure zero occurrences of "clerk" across all 38 files.
- DO NOT hardcode test results, create dummy/facade implementations.
- Profile.id === User.id (all queries finding profiles or records via where: { id: userId } or profileId: userId continue to work).

## Current Parent
- Conversation ID: d344cbef-61fb-4ca0-bf70-d2f9541a4236
- Updated: 2026-09-30T16:28:00Z

## Task Summary
- **What to build**: Refactor 38 protected API routes to import `getServerSession` from `@/lib/session` instead of Clerk `auth()`/`currentUser()`, check `session?.user?.id`, return 401 if unauthorized, access user role via `session.user.role` or database where needed.
- **Success criteria**: All 38 routes use `getServerSession()`, return 401 for unauthorized, have 0 occurrences of "clerk", pass `better-auth-api-routes.test.mjs` test cases API.1, API.2, API.3.
- **Interface contracts**: `PROJECT.md` § Session Retrieval Contract & `tests/better-auth-api-routes.test.mjs`.
- **Code layout**: 38 files in `src/app/api/**/route.ts`.

## Key Decisions Made
- Implemented standard session validation pattern:
  ```ts
  import { getServerSession } from '@/lib/session';

  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  ```
- Guaranteed 401 Unauthorized for unauthenticated requests across all 38 files (e.g., student-billing, student-history, student-profile, update-progress, assign-task, live-session).
- Removed all comments and references mentioning Clerk across all 38 files.

## Artifact Index
- `.agents/teamwork/worker_ba_m4_session/context.md` — scope and route list
- `.agents/teamwork/worker_ba_m4_session/DISPATCH.md` — assignment
- `.agents/teamwork/worker_ba_m4_session/progress.md` — progress tracking
- `.agents/teamwork/worker_ba_m4_session/handoff.md` — handoff report

## Change Tracker
- **Files modified**: All 38 route files in `src/app/api/`
- **Build status**: Verified via contract checks (grep search and AST contract match)
- **Pending issues**: None

## Quality Status
- **Build/test result**: All 38 route files pass API.1 (zero Clerk references), API.2 (use getServerSession), API.3 (return 401 on unauthenticated)
- **Lint status**: Clean
- **Tests added/modified**: Verified against `tests/better-auth-api-routes.test.mjs`
