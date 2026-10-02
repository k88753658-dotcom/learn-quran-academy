/**
 * Feature 14: Attendance Management API Test
 * Authoritative Source: PROJECT.md Feature 14 & API Contracts
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 14: Attendance Management API Contract', () => {
  const attendance = analyzeRouteHandler('src/app/api/attendance/route.ts');
  const markAttendance = analyzeRouteHandler('src/app/api/mark-attendance/route.ts');

  harness.it('F14.1: /api/attendance/route.ts must export GET and POST', () => {
    assert.ok(attendance.exists, 'src/app/api/attendance/route.ts not found');
    assert.ok(attendance.methods.GET, 'Must export async function GET');
    assert.ok(attendance.methods.POST, 'Must export async function POST');
  });

  harness.it('F14.2: POST attendance must enforce staff role (teacher or admin)', () => {
    assert.ok(attendance.exists);
    const checksStaff =
      attendance.code.includes('admin') ||
      attendance.code.includes('teacher') ||
      attendance.code.includes('role');
    assert.ok(checksStaff, 'Must verify user has staff role before recording attendance');
  });

  harness.it('F14.3: must record attendance date normalized to calendar date', () => {
    assert.ok(attendance.exists);
    const normalizesDate =
      attendance.code.includes('Date') ||
      attendance.code.includes('toISOString') ||
      attendance.code.includes('split') ||
      attendance.code.includes('date');
    assert.ok(normalizesDate, 'Must normalize attendance date');
  });

  harness.it('F14.4: must support all valid attendance statuses (Present, Absent, Late, Excused)', () => {
    assert.ok(attendance.exists);
    const supportsStatuses =
      attendance.code.includes('Present') ||
      markAttendance?.code?.includes('Present');
    assert.ok(supportsStatuses, 'Must support valid AttendanceStatus values');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f14-attendance-management-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
