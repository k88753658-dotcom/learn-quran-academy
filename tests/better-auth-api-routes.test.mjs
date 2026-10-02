#!/usr/bin/env node
/**
 * Protected API Routes & User Management Verification Test
 * Authoritative Requirements:
 * - ORIGINAL_REQUEST.md: "Update all protected API routes in src/app/api/ and Server Actions to verify sessions using Better Auth's server-side session checks instead of Clerk's auth()."
 * - PROJECT.md § Milestones (M4), § Interface Contracts (Session Retrieval Contract)
 */
import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from './helpers/contract-helpers.mjs';
import { getAllApiRouteHandlers, analyzeRouteSessionContract } from './helpers/better-auth-helpers.mjs';

const harness = createHarness();

// 38 Protected session-authenticating routes identified in PROJECT.md and Explorer Survey
const PROTECTED_SESSION_ROUTES = [
  'src/app/api/add-availability/route.ts',
  'src/app/api/admin-billing/route.ts',
  'src/app/api/admin-classes/route.ts',
  'src/app/api/admin-stats/route.ts',
  'src/app/api/admin-students/route.ts',
  'src/app/api/admin-teachers/route.ts',
  'src/app/api/approve-manual-payment/route.ts',
  'src/app/api/assign-task/route.ts',
  'src/app/api/assign-teacher/route.ts',
  'src/app/api/attendance/route.ts',
  'src/app/api/billing/route.ts',
  'src/app/api/courses/route.ts',
  'src/app/api/get-active-announcements/route.ts',
  'src/app/api/get-students/route.ts',
  'src/app/api/get-teacher-applications/route.ts',
  'src/app/api/get-teachers/route.ts',
  'src/app/api/live-session/route.ts',
  'src/app/api/login/route.ts',
  'src/app/api/make-admin/route.ts',
  'src/app/api/mark-attendance/route.ts',
  'src/app/api/my-attendance/route.ts',
  'src/app/api/publish-announcement/route.ts',
  'src/app/api/reject-manual-payment/route.ts',
  'src/app/api/reject-teacher-application/route.ts',
  'src/app/api/student-billing/route.ts',
  'src/app/api/student-dashboard/route.ts',
  'src/app/api/student-history/route.ts',
  'src/app/api/student-profile/route.ts',
  'src/app/api/student-schedule/route.ts',
  'src/app/api/teacher-attendance/route.ts',
  'src/app/api/teacher-classes/route.ts',
  'src/app/api/teacher-dashboard/route.ts',
  'src/app/api/teacher-schedule/route.ts',
  'src/app/api/teacher-students/route.ts',
  'src/app/api/update-progress/route.ts',
  'src/app/api/update-student/route.ts',
  'src/app/api/update-teacher-activity/route.ts',
  'src/app/api/update-teacher-profile/route.ts',
];

// 6 User Provisioning & Deletion routes
const USER_LIFECYCLE_ROUTES = [
  'src/app/api/register/route.ts',
  'src/app/api/add-teacher/route.ts',
  'src/app/api/add-student/route.ts',
  'src/app/api/approve-teacher-application/route.ts',
  'src/app/api/delete-user/route.ts',
  'src/app/api/delete-student/route.ts',
];

harness.describe('R4: Protected API Routes Session Contracts', () => {
  harness.it('API.1: Zero API routes must import @clerk/nextjs/server or clerkClient', () => {
    const allRoutes = getAllApiRouteHandlers();
    const violatingRoutes = [];

    for (const route of allRoutes) {
      const content = readProjectFile(route);
      if (content && (/@clerk\b/i.test(content) || /\bclerkClient\b/.test(content))) {
        violatingRoutes.push(route);
      }
    }

    if (violatingRoutes.length > 0) {
      assert.fail(
        `${violatingRoutes.length} API routes still contain Clerk references:\n` +
        violatingRoutes.slice(0, 10).map((r) => `  - ${r}`).join('\n')
      );
    }
    assert.equal(violatingRoutes.length, 0, 'All API routes must be free of Clerk');
  });

  harness.it('API.2: Protected session-checking routes must use Better Auth session verification', () => {
    const unmigratedRoutes = [];

    for (const route of PROTECTED_SESSION_ROUTES) {
      if (!projectFileExists(route)) continue;
      const analysis = analyzeRouteSessionContract(route);

      // Must not use Clerk
      if (analysis.hasClerk) {
        unmigratedRoutes.push({ route, reason: 'Still imports or references Clerk' });
        continue;
      }

      // Must check session via getServerSession or Better Auth
      if (!analysis.hasGetServerSession && !analysis.checksSession) {
        unmigratedRoutes.push({ route, reason: 'Missing getServerSession() or session check' });
      }
    }

    if (unmigratedRoutes.length > 0) {
      assert.fail(
        `${unmigratedRoutes.length} protected routes do not conform to session retrieval contract:\n` +
        unmigratedRoutes.slice(0, 10).map((u) => `  - ${u.route}: ${u.reason}`).join('\n')
      );
    }
  });

  harness.it('API.3: Protected routes must reject unauthenticated requests with 401 Unauthorized', () => {
    for (const route of PROTECTED_SESSION_ROUTES) {
      if (!projectFileExists(route)) continue;
      const content = readProjectFile(route);

      assert.ok(
        /401\b/.test(content) || /Unauthorized/i.test(content),
        `Route ${route} must handle unauthenticated state by returning 401 Unauthorized`
      );
    }
  });

  harness.it('API.4: User provisioning routes (register, add-teacher, add-student, approve-teacher-application) must not use clerkClient', () => {
    const provisioningRoutes = [
      'src/app/api/register/route.ts',
      'src/app/api/add-teacher/route.ts',
      'src/app/api/add-student/route.ts',
      'src/app/api/approve-teacher-application/route.ts',
    ];

    for (const route of provisioningRoutes) {
      if (projectFileExists(route)) {
        const content = readProjectFile(route);
        assert.ok(!content.includes('clerkClient'), `${route} must not use clerkClient`);
        assert.ok(!content.includes('@clerk'), `${route} must not import from @clerk`);
        assert.ok(
          content.includes('auth') || content.includes('prisma') || content.includes('user'),
          `${route} must manage user creation via Better Auth API or Prisma`
        );
      }
    }
  });

  harness.it('API.5: User deletion routes (delete-user, delete-student) must use Prisma cascade deletion without clerkClient', () => {
    const deletionRoutes = [
      'src/app/api/delete-user/route.ts',
      'src/app/api/delete-student/route.ts',
    ];

    for (const route of deletionRoutes) {
      if (projectFileExists(route)) {
        const content = readProjectFile(route);
        assert.ok(!content.includes('clerkClient'), `${route} must not call clerkClient.users.deleteUser`);
        assert.ok(!content.includes('@clerk'), `${route} must not import from @clerk`);
        assert.ok(
          content.includes('prisma.user.delete') || content.includes('prisma.profile.delete') || content.includes('prisma.student.delete'),
          `${route} must perform deletion using Prisma client cascade`
        );
      }
    }
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('better-auth-api-routes.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
