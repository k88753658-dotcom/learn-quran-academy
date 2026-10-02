/**
 * Feature 10: Notifications & Payment Tickets API Test
 * Authoritative Source: PROJECT.md Feature 10
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 10: Notifications & Payment Tickets API Contract', () => {
  const notifications = analyzeRouteHandler('src/app/api/notifications/route.ts');
  const paymentTicket = analyzeRouteHandler('src/app/api/payment-ticket/route.ts');

  harness.it('F10.1: /api/notifications/route.ts must export GET and PATCH', () => {
    assert.ok(notifications.exists, 'notifications route not found');
    assert.ok(notifications.methods.GET, 'Must export GET method');
    assert.ok(notifications.code.includes('export async function PATCH'), 'Must export PATCH method');
  });

  harness.it('F10.2: /api/payment-ticket/route.ts must export POST', () => {
    assert.ok(paymentTicket.exists, 'payment-ticket route not found');
    assert.ok(paymentTicket.methods.POST, 'Must export POST method');
  });

  harness.it('F10.3: notifications must support Global and Targeted notifications with Prisma', () => {
    assert.ok(notifications.exists);
    assert.equal(notifications.usesSupabase, false, 'Must not use Supabase');
    assert.ok(notifications.usesPrisma, 'Must use Prisma client');
    const supportsTargeting =
      notifications.code.includes('Global') &&
      notifications.code.includes('Targeted');
    assert.ok(supportsTargeting, 'Must filter notifications by Global or student targeted notifications');
  });

  harness.it('F10.4: payment-ticket must validate studentId and transactionId with Prisma', () => {
    assert.ok(paymentTicket.exists);
    assert.equal(paymentTicket.usesSupabase, false, 'Must not use Supabase');
    assert.ok(paymentTicket.usesPrisma, 'Must use Prisma client');
    assert.ok(paymentTicket.code.includes('studentId'), 'Must require studentId');
    assert.ok(paymentTicket.code.includes('transactionId'), 'Must require transactionId');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f10-notifications-tickets-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
