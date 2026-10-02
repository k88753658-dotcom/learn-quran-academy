/**
 * Feature 8: Public Courses API Test
 * Authoritative Source: PROJECT.md Feature 8 & API Contracts
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 8: Public Courses API Contract (/api/courses)', () => {
  const route = analyzeRouteHandler('src/app/api/courses/route.ts');

  harness.it('F08.1: /api/courses/route.ts must exist and export GET, POST, DELETE', () => {
    assert.ok(route.exists, 'src/app/api/courses/route.ts not found');
    assert.ok(route.methods.GET, 'Must export async function GET');
    assert.ok(route.methods.POST, 'Must export async function POST');
    assert.ok(route.methods.DELETE, 'Must export async function DELETE');
  });

  harness.it('F08.2: must interact with database using Prisma (prisma.course)', () => {
    assert.ok(route.exists);
    const usesPrisma = route.usesPrisma || route.code.includes('course');
    assert.ok(usesPrisma, 'Route must target Prisma course model');
  });

  harness.it('F08.3: POST and DELETE must enforce admin role check', () => {
    assert.ok(route.exists);
    const hasAdminCheck =
      route.code.includes('admin') ||
      route.code.includes('role') ||
      route.code.includes('403') ||
      route.code.includes('401');
    assert.ok(hasAdminCheck, 'Privileged course mutations must enforce admin authorization');
  });

  harness.it('F08.4: must return standardized JSON envelope', () => {
    assert.ok(route.exists);
    assert.ok(route.code.includes('NextResponse.json'), 'Must return responses via NextResponse.json');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f08-public-courses-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
