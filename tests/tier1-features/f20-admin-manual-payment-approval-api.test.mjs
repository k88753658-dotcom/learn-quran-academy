/**
 * Feature 20: Admin Manual Payment Approval API Test
 * Authoritative Source: PROJECT.md Feature 20 & Explorer Survey 1 § 6.2
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 20: Admin Manual Payment Approval API Contract', () => {
  const route = analyzeRouteHandler('src/app/api/approve-manual-payment/route.ts');

  harness.it('F20.1: approve-manual-payment/route.ts must export POST', () => {
    assert.ok(route.exists, 'src/app/api/approve-manual-payment/route.ts not found');
    assert.ok(route.methods.POST, 'Must export async function POST');
  });

  harness.it('F20.2: must require studentId and action in payload', () => {
    assert.ok(route.exists);
    const validatesPayload =
      route.code.includes('studentId') &&
      route.code.includes('action');
    assert.ok(validatesPayload, 'Must require studentId and action');
  });

  harness.it('F20.3: Approve action must enroll student and mark billing Paid', () => {
    assert.ok(route.exists);
    const handlesApprove =
      route.code.includes('Approve') &&
      (route.code.includes('enrolled') || route.code.includes('Paid'));
    assert.ok(handlesApprove, 'Must update student enrollment and billing on approval');
  });

  harness.it('F20.4: Reject action must reset billing to Pending and update ticket status', () => {
    assert.ok(route.exists);
    const handlesReject =
      route.code.includes('Reject') &&
      (route.code.includes('Rejected') || route.code.includes('Pending'));
    assert.ok(handlesReject, 'Must mark ticket rejected and billing pending on rejection');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f20-admin-manual-payment-approval-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
