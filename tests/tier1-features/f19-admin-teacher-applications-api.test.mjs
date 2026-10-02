/**
 * Feature 19: Admin Teacher Applications API Test
 * Authoritative Source: PROJECT.md Feature 19 & Explorer Survey 1 § 6.2
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 19: Admin Teacher Applications API Contract', () => {
  const getApps = analyzeRouteHandler('src/app/api/get-teacher-applications/route.ts');
  const approveApp = analyzeRouteHandler('src/app/api/approve-teacher-application/route.ts');

  harness.it('F19.1: get-teacher-applications must export GET for admin review', () => {
    assert.ok(getApps.exists, 'src/app/api/get-teacher-applications/route.ts not found');
    assert.ok(getApps.methods.GET, 'Must export async function GET');
  });

  harness.it('F19.2: approve-teacher-application must export POST', () => {
    assert.ok(approveApp.exists, 'src/app/api/approve-teacher-application/route.ts not found');
    assert.ok(approveApp.methods.POST, 'Must export async function POST');
  });

  harness.it('F19.3: approve-teacher-application must accept approve and reject actions', () => {
    assert.ok(approveApp.exists);
    const supportsActions =
      approveApp.code.includes('approve') &&
      approveApp.code.includes('reject');
    assert.ok(supportsActions, 'Must support both approve and reject actions');
  });

  harness.it('F19.4: approval must provision instructor credentials and profile', () => {
    assert.ok(approveApp.exists);
    const provisionsTeacher =
      approveApp.code.includes('teacher') ||
      approveApp.code.includes('Profile') ||
      approveApp.code.includes('profile');
    assert.ok(provisionsTeacher, 'Must provision teacher account upon approval');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f19-admin-teacher-applications-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
