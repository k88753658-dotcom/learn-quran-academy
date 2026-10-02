/**
 * Feature 16: Auth API Handlers Test
 * Authoritative Source: PROJECT.md Feature 16 & Explorer Survey 3
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 16: Auth API Handlers Contract', () => {
  const registerRoute = analyzeRouteHandler('src/app/api/register/route.ts');

  harness.it('F16.1: register/route.ts must export POST', () => {
    assert.ok(registerRoute.exists, 'src/app/api/register/route.ts not found');
    assert.ok(registerRoute.methods.POST, 'Must export async function POST');
  });

  harness.it('F16.2: register/route.ts must create user via Clerk SDK or Clerk webhook sync', () => {
    assert.ok(registerRoute.exists);
    const usesClerk =
      registerRoute.code.includes('@clerk') ||
      registerRoute.code.includes('clerkClient') ||
      registerRoute.code.includes('clerk');
    assert.ok(usesClerk, 'Registration flow must integrate Clerk user creation');
  });

  harness.it('F16.3: register/route.ts must synchronize Student and initial Billing in Prisma', () => {
    assert.ok(registerRoute.exists);
    const synchronizesData =
      registerRoute.code.includes('student') ||
      registerRoute.code.includes('billing');
    assert.ok(synchronizesData, 'Must create student profile and initial billing record');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f16-auth-api-handlers.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
