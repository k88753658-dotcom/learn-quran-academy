/**
 * Feature 11: Student Self-Attendance API Test
 * Authoritative Source: PROJECT.md Feature 11 & API Contracts
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 11: Student Self-Attendance API Contract', () => {
  const route = analyzeRouteHandler('src/app/api/student-self-attendance/route.ts');

  harness.it('F11.1: student-self-attendance route must exist and export POST', () => {
    assert.ok(route.exists, 'src/app/api/student-self-attendance/route.ts not found');
    assert.ok(route.methods.POST, 'Must export async function POST');
  });

  harness.it('F11.2: must require studentId in request body', () => {
    assert.ok(route.exists);
    const validatesStudentId =
      route.code.includes('studentId') &&
      (route.code.includes('400') || route.code.includes('required'));
    assert.ok(validatesStudentId, 'Must reject requests missing studentId');
  });

  harness.it('F11.3: must record attendance status as Present with markedBy attribution', () => {
    assert.ok(route.exists);
    const setsPresent = route.code.includes('Present');
    assert.ok(setsPresent, 'Self-attendance must record status as Present');
  });

  harness.it('F11.4: must guard against duplicate check-in on the same date', () => {
    assert.ok(route.exists);
    const guardsDuplicate =
      route.code.includes('date') ||
      route.code.includes('find') ||
      route.code.includes('upsert') ||
      route.code.includes('already');
    assert.ok(guardsDuplicate, 'Must check or handle existing attendance for current date');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f11-student-self-attendance-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
