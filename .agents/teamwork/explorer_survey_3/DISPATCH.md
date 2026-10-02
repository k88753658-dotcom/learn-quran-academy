## 2026-09-29T07:21:00Z
Conduct a comprehensive authentication and client-side data fetching survey of d:\VS CODE\learn-quran-academy.
Find all occurrences of authentication logic: login, signup, logout, session checking, user profile fetching, role/permissions checking (admin, teacher, student, etc.), auth middleware, and protected page wrappers.
Identify all React components and pages in `src/app/` and `src/components/` that perform data fetching or call Supabase directly.
Specify how each auth flow and component will be migrated to Clerk:
- Clerk middleware setup (clerkMiddleware, public vs protected routes)
- Root layout ClerkProvider wrapping
- Clerk pre-built components (SignIn, SignUp, UserButton) or custom Clerk hooks (useUser, useAuth, currentUser, auth)
- How user identities (Clerk userId) will map to Prisma user records / roles in Neon DB.
Write comprehensive auth and data fetching migration plan to `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\report.md` and a summary `handoff.md`.
Update progress.md regularly with timestamped entries. When finished, send a message to parent with the file path.
