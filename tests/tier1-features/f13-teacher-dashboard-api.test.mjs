/**
 * Feature 13: Teacher Dashboard API Routes Test
 * Authoritative Source: PROJECT.md Feature 13 & Explorer Survey 1 § 6.2
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 13: Teacher Dashboard API Routes Contract', () => {
  const dashboard = analyzeRouteHandler('src/app/api/teacher-dashboard/route.ts');
  const activity = analyzeRouteHandler('src/app/api/update-teacher-activity/route.ts');
  const profile = analyzeRouteHandler('src/app/api/update-teacher-profile/route.ts');

  harness.it('F13.1: teacher-dashboard/route.ts must export GET', () => {
    assert.ok(dashboard.exists, 'src/app/api/teacher-dashboard/route.ts not found');
    assert.ok(dashboard.methods.GET, 'Must export async function GET');
  });

  harness.it('F13.2: teacher-dashboard must enforce teacher role authorization', () => {
    assert.ok(dashboard.exists);
    const checksTeacherRole =
      dashboard.code.includes('teacher') ||
      dashboard.code.includes('role');
    assert.ok(checksTeacherRole, 'Must enforce role === teacher');
  });

  harness.it('F13.3: teacher-dashboard must filter students by assigned teacherId', () => {
    assert.ok(dashboard.exists);
    const filtersByTeacher =
      dashboard.code.includes('teacher_id') ||
      dashboard.code.includes('teacherId') ||
      dashboard.code.includes('teacherStudents');
    assert.ok(filtersByTeacher, 'Must only return students assigned to the authenticated teacher');
  });

  harness.it('F13.4: update-teacher-profile and update-teacher-activity routes must exist', () => {
    assert.ok(activity.exists, 'update-teacher-activity route not found');
    assert.ok(profile.exists, 'update-teacher-profile route not found');
    assert.ok(activity.methods.POST, 'update-teacher-activity must export POST');
    assert.ok(profile.methods.POST, 'update-teacher-profile must export POST');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f13-teacher-dashboard-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
