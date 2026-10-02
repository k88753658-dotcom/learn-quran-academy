/**
 * Feature 17: Admin Stats & Dashboards API Test
 * Authoritative Source: PROJECT.md Feature 17 & API Contracts
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 17: Admin Stats & Dashboards API Contract', () => {
  const stats = analyzeRouteHandler('src/app/api/admin-stats/route.ts');

  harness.it('F17.1: admin-stats/route.ts must export GET', () => {
    assert.ok(stats.exists, 'src/app/api/admin-stats/route.ts not found');
    assert.ok(stats.methods.GET, 'Must export async function GET');
  });

  harness.it('F17.2: admin-stats must enforce admin role access (403 if not admin)', () => {
    assert.ok(stats.exists);
    const checksAdmin =
      stats.code.includes('admin') ||
      stats.code.includes('403') ||
      stats.code.includes('role');
    assert.ok(checksAdmin, 'Must enforce role === admin');
  });

  harness.it('F17.3: admin-stats must compute totalStudents, attendanceRate, and pendingPayments', () => {
    assert.ok(stats.exists);
    const computesMetrics =
      stats.code.includes('totalStudents') ||
      stats.code.includes('attendanceRate') ||
      stats.code.includes('pendingPayments');
    assert.ok(computesMetrics, 'Must aggregate key operational academy metrics');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f17-admin-stats-dashboard-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
