# Context for worker_ba_m4

## Objective
Implement Milestone 4: Refactor API Routes & User Management from Clerk to Better Auth.

## Scope & File Ownership
You exclusively own:
- All route handlers under `src/app/api/` that currently import or use `@clerk/nextjs` or `@clerk/nextjs/server`:
  - 38 session-authenticating routes
  - 6 user provisioning/deletion routes (`register`, `add-teacher`, `add-student`, `approve-teacher-application`, `delete-user`, `delete-student`)

## Key Contracts
1. Session Retrieval:
   Replace `@clerk/nextjs/server` (`auth()`, `currentUser()`) with `getServerSession()` from `@/lib/session`:
   ```ts
   import { getServerSession } from '@/lib/session';

   const session = await getServerSession();
   if (!session?.user?.id) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   const userId = session.user.id;
   ```
   Note: Since `Profile.id === User.id`, all queries finding profiles with `where: { id: userId }` continue to work without modification.

2. User Provisioning & Registration:
   - Replace Clerk API calls (`clerkClient.users.createUser()`, etc.) with Better Auth's `auth.api.signUpEmail` or direct Prisma creation.
   - For password-based users created by admin/teacher flows, ensure password and user credentials are registered properly with Better Auth or appropriate schema models.

3. User Deletion:
   - In `delete-user` and `delete-student`, replace `clerkClient.users.deleteUser(id)` with deleting the `User` from Prisma:
     ```ts
     await prisma.user.delete({ where: { id: userId } });
     ```
     Because of cascade delete (`onDelete: Cascade`), deleting the `User` automatically cleans up sessions, accounts, and profile.

4. Eradicate Clerk:
   - Ensure zero imports from `@clerk/nextjs` or `@clerk/nextjs/server` remain in `src/app/api/`.

5. Verification:
   - Run `node tests/better-auth-api-routes.test.mjs`.
