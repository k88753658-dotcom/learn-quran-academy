## 2026-09-29T07:54:26Z
You are Worker M2 (teamwork_preview_worker).
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m2\
The authoritative user request is located at:
d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read d:\VS CODE\learn-quran-academy\PROJECT.md, d:\VS CODE\learn-quran-academy\TEST_INFRA.md, and d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\report.md (which contains exact implementation specifications for Clerk).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You have exclusive write ownership over:
- src/app/layout.tsx
- src/middleware.ts
- src/components/Navbar.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx
- src/app/admin/dashboard/page.tsx (logout button/session handling)
- src/app/teacher/dashboard/page.tsx (logout button/session handling)
- src/app/dashboard/page.tsx (logout button/session handling)
- Safe deletion of src/proxy.ts

Your Task:
1. Wrap root layout `src/app/layout.tsx` in `<ClerkProvider>` from `@clerk/nextjs`. Ensure metadata and styling remain intact.
2. Create standard Next.js edge middleware `src/middleware.ts` using `clerkMiddleware()` and `createRouteMatcher()` from `@clerk/nextjs/server`. Protect routes: `/admin(.*)`, `/teacher(.*)`, `/dashboard(.*)`. Ensure public routes (home, `/about`, `/courses`, `/teachers`, `/teach`, `/contact`, `/login`, `/register`, `/api/public-teachers`, `/api/courses`, `/api/teacher-application`, etc.) remain accessible. Remove/delete legacy `src/proxy.ts`.
3. Update `src/components/Navbar.tsx` to use Clerk components and hooks: `<SignedIn>`, `<SignedOut>`, `<UserButton>`, and clean navigation links (Login, Register, Dashboard).
4. Update `/login` and `/register` pages (`src/app/login/page.tsx`, `src/app/register/page.tsx`) to integrate cleanly with Clerk authentication (e.g. Clerk's `<SignIn />` / `<SignUp />` or Clerk authentication forms).
5. Update sidebar sign-out buttons in all 3 dashboards (`src/app/admin/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, `src/app/dashboard/page.tsx`) to use Clerk's `useClerk().signOut()` alongside local router redirect.
6. Verify your implementation:
   - Run `npx tsc --noEmit`
   - Run `node tests/run-all.mjs --feature=4`
   - Run `node tests/run-all.mjs --feature=5`
   - Run `node tests/run-all.mjs --feature=6`
   - Run `node tests/run-all.mjs --feature=7`
7. Document commands, code changes, and test results in `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m2\handoff.md`.
8. Update progress.md with timestamped logs. When finished, send a message to parent with your handoff path.
