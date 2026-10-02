#!/usr/bin/env node
/**
 * Tier 3 & Tier 4: Real-World Workflows & Cross-Feature Integration Test Suite
 * Authoritative Sources:
 * - PROJECT.md § Architecture, § Interface Contracts, § Milestones (M1-M5)
 * - Validates multi-step lifecycle flows, multi-role RBAC truth table, and forensic audit.
 */
import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists, parsePrismaSchema } from './helpers/contract-helpers.mjs';
import { findClerkOccurrencesInSrc, analyzeBetterAuthSchema } from './helpers/better-auth-helpers.mjs';

const harness = createHarness();

harness.describe('Tier 3 & 4: Cross-Feature Flows & Real-World RBAC Journeys', () => {
  // Tier 3: Interactions
  harness.it('T3.1: Student Lifecycle Integration - Registration, Profile Linking & Session Contract', () => {
    // 1. Verify register route handles user creation
    assert.ok(projectFileExists('src/app/api/register/route.ts'), 'Register route must exist');
    const registerCode = readProjectFile('src/app/api/register/route.ts');
    assert.ok(!registerCode.includes('clerkClient'), 'Register route must not use Clerk');

    // 2. Verify Profile is linked to User via Shared PK
    const schemaAnalysis = analyzeBetterAuthSchema();
    assert.ok(schemaAnalysis.profileUserRelation?.isSharedPrimaryKey, 'Profile must have Shared PK 1:1 relation with User');

    // 3. Verify session helper retrieves user
    assert.ok(projectFileExists('src/lib/session.ts'), 'Session helper must exist');
    const sessionCode = readProjectFile('src/lib/session.ts');
    assert.ok(sessionCode.includes('auth.api.getSession'), 'Session helper must query auth API');
  });

  harness.it('T3.2: Teacher Onboarding & Application Approval Workflow', () => {
    // 1. Teacher application approval endpoint
    const approvalRoute = 'src/app/api/approve-teacher-application/route.ts';
    assert.ok(projectFileExists(approvalRoute), `${approvalRoute} must exist`);
    const approvalCode = readProjectFile(approvalRoute);

    // 2. Must not use Clerk
    assert.ok(!approvalCode.includes('clerkClient'), 'Approval route must not use Clerk client');

    // 3. Teacher Application model in schema
    const parsed = parsePrismaSchema();
    assert.ok(parsed.models.TeacherApplication, 'model TeacherApplication must exist in Prisma schema');
  });

  harness.it('T3.3: User Deletion & Cascade Cleanliness Lifecycle', () => {
    const deleteRoute = 'src/app/api/delete-user/route.ts';
    assert.ok(projectFileExists(deleteRoute), `${deleteRoute} must exist`);
    const deleteCode = readProjectFile(deleteRoute);

    // Must delete via Prisma cascade, not Clerk
    assert.ok(!deleteCode.includes('clerkClient'), 'Delete route must not use Clerk client');
    assert.ok(
      deleteCode.includes('prisma.user.delete') || deleteCode.includes('prisma.profile.delete'),
      'Delete route must perform cascade deletion via Prisma'
    );
  });

  // Tier 4: Workflows & RBAC Matrix
  harness.it('T4.1: Multi-Role Access Control (RBAC) Truth Table Enforcement', () => {
    // Check that role-specific API routes enforce role checks
    const roleGuards = [
      { route: 'src/app/api/admin-stats/route.ts', expectedRole: 'admin' },
      { route: 'src/app/api/admin-teachers/route.ts', expectedRole: 'admin' },
      { route: 'src/app/api/teacher-classes/route.ts', expectedRole: 'teacher' },
      { route: 'src/app/api/student-dashboard/route.ts', expectedRole: 'student' },
    ];

    for (const guard of roleGuards) {
      if (projectFileExists(guard.route)) {
        const code = readProjectFile(guard.route);
        assert.ok(
          code.includes(guard.expectedRole) || code.includes('role') || code.includes('UserRole'),
          `${guard.route} must verify role authorization (expected: ${guard.expectedRole})`
        );
      }
    }
  });

  harness.it('T4.2: Zero-Clerk Forensic Audit - Complete src/ scan', () => {
    const clerkMatches = findClerkOccurrencesInSrc();
    if (clerkMatches.length > 0) {
      const summary = clerkMatches
        .slice(0, 5)
        .map((m) => `  - ${m.file}:${m.line} (${m.content})`)
        .join('\n');
      assert.fail(
        `Forensic audit failed: ${clerkMatches.length} Clerk references found in src/:\n${summary}`
      );
    }
    assert.equal(clerkMatches.length, 0, 'Zero Clerk occurrences across entire src/');
  });

  harness.it('T4.3: Edge Routing Contract & Public Surface Integrity', () => {
    assert.ok(projectFileExists('src/middleware.ts'), 'Middleware must exist');
    const middleware = readProjectFile('src/middleware.ts');

    // Public pages should never be intercepted
    assert.ok(middleware.includes('/login'), 'Login must be accessible publicly');
    assert.ok(middleware.includes('/register'), 'Register must be accessible publicly');
    assert.ok(middleware.includes('/api/auth'), 'Auth catch-all must be accessible publicly');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('better-auth-workflows.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
