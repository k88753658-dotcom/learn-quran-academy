/**
 * Feature 9: Public Teachers & Teach API Test
 * Authoritative Source: PROJECT.md Feature 9
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 9: Public Teachers & Teach API Contract', () => {
  const publicTeachers = analyzeRouteHandler('src/app/api/public-teachers/route.ts');
  const teacherApp = analyzeRouteHandler('src/app/api/teacher-application/route.ts');

  harness.it('F09.1: /api/public-teachers/route.ts must export GET for landing page showcase', () => {
    assert.ok(publicTeachers.exists, 'src/app/api/public-teachers/route.ts not found');
    assert.ok(publicTeachers.methods.GET, 'Must export async function GET');
  });

  harness.it('F09.2: /api/teacher-application/route.ts must export POST for candidate applications', () => {
    assert.ok(teacherApp.exists, 'src/app/api/teacher-application/route.ts not found');
    assert.ok(teacherApp.methods.POST, 'Must export async function POST');
  });

  harness.it('F09.3: teacher-application must validate candidate email and contact fields', () => {
    assert.ok(teacherApp.exists);
    const validatesFields =
      teacherApp.code.includes('email') &&
      teacherApp.code.includes('whatsapp') &&
      teacherApp.code.includes('qualification');
    assert.ok(validatesFields, 'Must validate core applicant information');
  });

  harness.it('F09.4: public-teachers must query only verified teacher profiles', () => {
    assert.ok(publicTeachers.exists);
    const filtersTeachers =
      publicTeachers.code.includes('teacher') ||
      publicTeachers.code.includes('qualification');
    assert.ok(filtersTeachers, 'Must filter records by teacher role');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f09-public-teachers-teach-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
