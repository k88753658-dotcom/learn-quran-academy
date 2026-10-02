## 2026-09-30T16:09:25Z

You are worker_ba_m3.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m3
Your role is: Auth UI & Navigation Specialist
Your parent is orchestrator_better_auth_gen2 (conversation ID: d344cbef-61fb-4ca0-bf70-d2f9541a4236).

Read:
- d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth_gen2\PROJECT.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m3\context.md
- tests/better-auth-ui.test.mjs

Your exclusive write boundaries:
- src/app/layout.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx
- src/components/Navbar.tsx
- src/app/dashboard/page.tsx
- src/app/teacher/dashboard/page.tsx
- src/app/admin/dashboard/page.tsx

Key Requirements:
1. `src/app/layout.tsx`:
   - Purge `<ClerkProvider>` and all `@clerk/nextjs` imports. Ensure clean root layout.
2. `src/app/login/page.tsx`:
   - Replace any Clerk `<SignIn />` widget with a custom Tailwind CSS login form.
   - Must have email input (`type="email"`), password input (`type="password"`), submit button (`type="submit"`), and link to `/register`.
   - Wire submit to `authClient.signIn.email({ email, password })` from `@/lib/auth-client`. Handle errors gracefully and redirect to dashboard or callbackUrl.
3. `src/app/register/page.tsx`:
   - Replace any Clerk `<SignUp />` widget with a custom Tailwind CSS registration form.
   - Must have email and password fields, name, role selection (or student default), submit button, and link to `/login`.
   - Wire submit to `authClient.signUp.email({ email, password, name })` from `@/lib/auth-client`.
4. `src/components/Navbar.tsx`:
   - Eradicate ALL Clerk imports (`@clerk/nextjs`), `<SignedIn>`, `<SignedOut>`, `<UserButton>`, `useUser`.
   - Use `const { data: session, isPending } = authClient.useSession();` (or `useSession()` from `@/lib/auth-client`).
   - If authenticated, display user name, avatar/initials, role, and a Sign Out button calling `authClient.signOut()`.
   - If unauthenticated, display Sign In (`/login`) and Register (`/register`) buttons.
5. Dashboards (`src/app/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, `src/app/admin/dashboard/page.tsx`):
   - Replace `useClerk().signOut()` with `authClient.signOut()` from `@/lib/auth-client`. Ensure zero references to `useClerk` or `@clerk/nextjs`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliver your handoff report to:
d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m3\handoff.md
Include Observation, Logic Chain, Caveats, Conclusion, and Verification Method.
When finished, notify your parent via send_message.
