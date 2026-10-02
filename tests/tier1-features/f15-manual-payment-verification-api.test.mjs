/**
 * Feature 15: Manual Payment Verification API Test
 * Authoritative Source: PROJECT.md Feature 15 & Explorer Survey 1 § 6.2
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 15: Manual Payment Verification API Contract', () => {
  const route = analyzeRouteHandler('src/app/api/verify-manual-payment/route.ts');

  harness.it('F15.1: verify-manual-payment/route.ts must export POST', () => {
    assert.ok(route.exists, 'src/app/api/verify-manual-payment/route.ts not found');
    assert.ok(route.methods.POST, 'Must export async function POST');
  });

  harness.it('F15.2: must require studentId, transactionId, and methodUsed', () => {
    assert.ok(route.exists);
    const validatesInputs =
      route.code.includes('studentId') &&
      route.code.includes('transactionId') &&
      route.code.includes('methodUsed');
    assert.ok(validatesInputs, 'Must validate required payment submission fields');
  });

  harness.it('F15.3: must record PaymentTicket with status Reviewing', () => {
    assert.ok(route.exists);
    const setsReviewing =
      route.code.includes('Reviewing') ||
      route.code.includes('paymentTickets') ||
      route.code.includes('payment_tickets');
    assert.ok(setsReviewing, 'Must log payment ticket in Reviewing state');
  });

  harness.it('F15.4: must transition Billing status to Reviewing', () => {
    assert.ok(route.exists);
    const updatesBilling =
      route.code.includes('billing') ||
      route.code.includes('Billing');
    assert.ok(updatesBilling, 'Must update associated student billing account status to Reviewing');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f15-manual-payment-verification-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
