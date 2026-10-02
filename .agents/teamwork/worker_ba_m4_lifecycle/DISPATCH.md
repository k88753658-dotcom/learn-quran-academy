## 2026-09-30T16:10:14Z
You are worker_ba_m4_lifecycle.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m4_lifecycle
Your role is: User Lifecycle & Deletion Specialist
Your parent is orchestrator_better_auth_gen2 (conversation ID: d344cbef-61fb-4ca0-bf70-d2f9541a4236).

Read:
- d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth_gen2\PROJECT.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m4_lifecycle\context.md
- tests/better-auth-api-routes.test.mjs

Your exclusive write boundaries:
1. src/app/api/register/route.ts
2. src/app/api/add-teacher/route.ts
3. src/app/api/add-student/route.ts
4. src/app/api/approve-teacher-application/route.ts
5. src/app/api/delete-user/route.ts
6. src/app/api/delete-student/route.ts
You MUST NOT modify any other files.

Key Requirements:
1. Eradicate all `clerkClient` and `@clerk/nextjs` references.
2. In user creation routes (`register`, `add-teacher`, `add-student`, `approve-teacher-application`):
   - Replace `clerkClient.users.createUser` with Better Auth or Prisma creation.
   - For email/password accounts, you can create the `User` and `Account` records directly via `prisma.user.create` or use `auth.api.signUpEmail` from `@/lib/auth`.
   - Remember `Profile` has 1:1 relation to `User` (`Profile.id === User.id`).
3. In user deletion routes (`delete-user`, `delete-student`):
   - Replace `clerkClient.users.deleteUser(id)` with `prisma.user.delete({ where: { id: userId } })`.
   - Cascade delete cleans up all related records automatically.
4. Verify session authorization where needed via `getServerSession()` from `@/lib/session`.
5. Ensure zero occurrences of "clerk" across these 6 files.
