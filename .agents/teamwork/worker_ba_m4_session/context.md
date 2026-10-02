# Context for worker_ba_m4_session

## Objective
Refactor the 38 protected session-authenticating API routes in `src/app/api/` from Clerk to Better Auth.

## Exclusive Write Scope (38 Routes)
1. `src/app/api/add-availability/route.ts`
2. `src/app/api/admin-billing/route.ts`
3. `src/app/api/admin-classes/route.ts`
4. `src/app/api/admin-stats/route.ts`
5. `src/app/api/admin-students/route.ts`
6. `src/app/api/admin-teachers/route.ts`
7. `src/app/api/approve-manual-payment/route.ts`
8. `src/app/api/assign-task/route.ts`
9. `src/app/api/assign-teacher/route.ts`
10. `src/app/api/attendance/route.ts`
11. `src/app/api/billing/route.ts`
12. `src/app/api/courses/route.ts`
13. `src/app/api/get-active-announcements/route.ts`
14. `src/app/api/get-students/route.ts`
15. `src/app/api/get-teacher-applications/route.ts`
16. `src/app/api/get-teachers/route.ts`
17. `src/app/api/live-session/route.ts`
18. `src/app/api/login/route.ts`
19. `src/app/api/make-admin/route.ts`
20. `src/app/api/mark-attendance/route.ts`
21. `src/app/api/my-attendance/route.ts`
22. `src/app/api/publish-announcement/route.ts`
23. `src/app/api/reject-manual-payment/route.ts`
24. `src/app/api/reject-teacher-application/route.ts`
25. `src/app/api/student-billing/route.ts`
26. `src/app/api/student-dashboard/route.ts`
27: `src/app/api/student-history/route.ts`
28. `src/app/api/student-profile/route.ts`
29. `src/app/api/student-schedule/route.ts`
30. `src/app/api/teacher-attendance/route.ts`
31. `src/app/api/teacher-classes/route.ts`
32. `src/app/api/teacher-dashboard/route.ts`
33. `src/app/api/teacher-schedule/route.ts`
34. `src/app/api/teacher-students/route.ts`
35. `src/app/api/update-progress/route.ts`
36. `src/app/api/update-student/route.ts`
37. `src/app/api/update-teacher-activity/route.ts`
38. `src/app/api/update-teacher-profile/route.ts`

## Requirements
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
3. Because `Profile.id === User.id`, all queries finding profiles or records via `where: { id: userId }` or `profileId: userId` or similar remain completely intact.
4. If a route accessed `session.claims?.metadata?.role` or `user.publicMetadata?.role`, look up user role via `session.user.role` or `prisma.user.findUnique` / `prisma.profile.findUnique`.
5. Return 401 on unauthenticated access.
6. Verification: Ensure zero occurrences of "clerk" across all 38 files.
