# Context for worker_ba_m4_lifecycle

## Objective
Refactor the 6 user provisioning & deletion routes in `src/app/api/` from Clerk to Better Auth & Prisma.

## Exclusive Write Scope (6 Routes)
1. `src/app/api/register/route.ts`
2. `src/app/api/add-teacher/route.ts`
3. `src/app/api/add-student/route.ts`
4. `src/app/api/approve-teacher-application/route.ts`
5. `src/app/api/delete-user/route.ts`
6. `src/app/api/delete-student/route.ts`

## Requirements
1. Eradicate all `clerkClient` and `@clerk/nextjs` references.
2. In user creation routes (`register`, `add-teacher`, `add-student`, `approve-teacher-application`):
   - Replace `clerkClient.users.createUser` with Better Auth or Prisma creation.
   - For email/password accounts, you can create the `User` and `Account` records directly via `prisma.user.create` or use `auth.api.signUpEmail` from `@/lib/auth`.
   - Remember `Profile` has 1:1 relation to `User` (`Profile.id === User.id`).
3. In user deletion routes (`delete-user`, `delete-student`):
   - Replace `clerkClient.users.deleteUser(id)` with `prisma.user.delete({ where: { id: userId } })`.
   - Since `Profile`, `Session`, and `Account` all have `onDelete: Cascade` referencing `User.id`, deleting `prisma.user` automatically cascades and cleans up all related records cleanly.
4. Verify session authorization if the route requires it using `getServerSession()` from `@/lib/session`.
5. Return appropriate JSON responses and status codes.
6. Ensure zero occurrences of "clerk" across these 6 files.
