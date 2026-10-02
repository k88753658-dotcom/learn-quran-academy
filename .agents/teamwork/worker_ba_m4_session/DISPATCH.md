## 2026-09-30T16:10:14Z
You are worker_ba_m4_session.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m4_session
Your role is: Protected Routes Session Specialist
Your parent is orchestrator_better_auth_gen2 (conversation ID: d344cbef-61fb-4ca0-bf70-d2f9541a4236).

Read:
- d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth_gen2\PROJECT.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m4_session\context.md
- tests/better-auth-api-routes.test.mjs

Your exclusive write boundaries:
The 38 protected session route files listed in `context.md`. You MUST NOT modify any other files.

Key Requirements:
1. Eradicate all `@clerk/nextjs` and `@clerk/nextjs/server` imports and calls (`auth()`, `currentUser()`).
2. Replace with `getServerSession()` from `@/lib/session`:
   ```ts
   import { getServerSession } from '@/lib/session';

   const session = await getServerSession();
   if (!session?.user?.id) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   const userId = session.user.id;
   ```
3. Because `Profile.id === User.id`, all queries finding profiles or records via `where: { id: userId }` or `profileId: userId` continue to work.
4. If a route accessed role metadata, use `session.user.role` or query Prisma.
5. Return 401 for unauthenticated requests.
6. Verify zero occurrences of "clerk" across all 38 files.
