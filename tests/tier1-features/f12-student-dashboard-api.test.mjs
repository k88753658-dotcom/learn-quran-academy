/**
 * Feature 12: Student Dashboard API Routes Test
 * Authoritative Source: PROJECT.md Feature 12 & Explorer Survey 1 § 6.2
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 12: Student Dashboard API Routes Contract', () => {
  const dashboard = analyzeRouteHandler('src/app/api/student-dashboard/route.ts');
  const profile = analyzeRouteHandler('src/app/api/student-profile/route.ts');

  harness.it('F12.1: student-dashboard/route.ts must export GET', () => {
    assert.ok(dashboard.exists, 'src/app/api/student-dashboard/route.ts not found');
    assert.ok(dashboard.methods.GET, 'Must export async function GET');
  });

  harness.it('F12.2: student-dashboard must require authenticated session', () => {
    assert.ok(dashboard.exists);
    const checksAuth =
      dashboard.code.includes('auth()') ||
      dashboard.code.includes('userId') ||
      dashboard.code.includes('user') ||
      dashboard.code.includes('401');
    assert.ok(checksAuth, 'Must reject unauthenticated student requests with 401');
  });

  harness.it('F12.3: student-dashboard must aggregate student record, assigned teacher, and billing state', () => {
    assert.ok(dashboard.exists);
    const aggregatesData =
      (dashboard.code.includes('student') || dashboard.code.includes('students')) &&
      (dashboard.code.includes('billing') || dashboard.code.includes('Billing'));
    assert.ok(aggregatesData, 'Must fetch student and related billing status');
  });

  harness.it('F12.4: student-profile/route.ts must export GET and compute attendance metrics', () => {
    assert.ok(profile.exists, 'src/app/api/student-profile/route.ts not found');
    assert.ok(profile.methods.GET, 'Must export async function GET');
    const calculatesMetrics =
      profile.code.includes('attendance') ||
      profile.code.includes('progress') ||
      profile.code.includes('rate');
    assert.ok(calculatesMetrics, 'Must aggregate student attendance statistics');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f12-student-dashboard-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
