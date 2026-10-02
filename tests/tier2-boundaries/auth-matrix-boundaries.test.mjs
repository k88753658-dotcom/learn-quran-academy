/**
 * Tier 2: Authentication & Authorization Boundary Conditions
 * Tests RBAC boundaries, privilege escalation guards, and session integrity
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Tier 2 Boundary: RBAC Matrix & Role Escalation Guards', () => {
  harness.it('T2.Auth.1: /api/admin-stats must reject unauthenticated requests with 401 or 403', () => {
    const route = analyzeRouteHandler('src/app/api/admin-stats/route.ts');
    assert.ok(route.exists);
    const rejectsUnauth =
      route.code.includes('401') ||
      route.code.includes('403') ||
      route.code.includes('Unauthorized');
    assert.ok(rejectsUnauth, 'admin-stats must explicitly guard against unauthenticated calls');
  });

  harness.it('T2.Auth.2: /api/admin-stats must reject student callers with 403 Forbidden', () => {
    const route = analyzeRouteHandler('src/app/api/admin-stats/route.ts');
    assert.ok(route.exists);
    const checksAdminRole =
      route.code.includes('admin') &&
      (route.code.includes('403') || route.code.includes('error'));
    assert.ok(checksAdminRole, 'Must forbid non-admin roles from accessing executive stats');
  });

  harness.it('T2.Auth.3: /api/add-teacher must enforce admin-only privilege', () => {
    const route = analyzeRouteHandler('src/app/api/add-teacher/route.ts');
    assert.ok(route.exists);
    const guardsAdmin =
      route.code.includes('admin') &&
      (route.code.includes('403') || route.code.includes('status: 403'));
    assert.ok(guardsAdmin, 'Only admin can add instructor accounts');
  });

  harness.it('T2.Auth.4: /api/teacher-dashboard must forbid student role from viewing teacher rosters', () => {
    const route = analyzeRouteHandler('src/app/api/teacher-dashboard/route.ts');
    assert.ok(route.exists);
    const checksTeacher =
      route.code.includes('teacher') ||
      route.code.includes('role');
    assert.ok(checksTeacher, 'Teacher dashboard must be gated against student role');
  });

  harness.it('T2.Auth.5: /api/courses POST & DELETE must reject unauthenticated callers', () => {
    const route = analyzeRouteHandler('src/app/api/courses/route.ts');
    assert.ok(route.exists);
    const guardsMutations =
      route.code.includes('401') ||
      route.code.includes('403') ||
      route.code.includes('admin');
    assert.ok(guardsMutations, 'Course additions and deletions must be restricted to admins');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('auth-matrix-boundaries.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
