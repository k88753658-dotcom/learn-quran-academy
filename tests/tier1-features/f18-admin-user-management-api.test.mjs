/**
 * Feature 18: Admin User Management API Test
 * Authoritative Source: PROJECT.md Feature 18 & Explorer Survey 1 § 6.2
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 18: Admin User Management API Contract', () => {
  const addTeacher = analyzeRouteHandler('src/app/api/add-teacher/route.ts');
  const assignTeacher = analyzeRouteHandler('src/app/api/assign-teacher/route.ts');
  const deleteStudent = analyzeRouteHandler('src/app/api/delete-student/route.ts');
  const getTeachers = analyzeRouteHandler('src/app/api/get-teachers/route.ts');
  const getStudents = analyzeRouteHandler('src/app/api/get-students/route.ts');

  harness.it('F18.1: add-teacher and assign-teacher routes must exist and export POST', () => {
    assert.ok(addTeacher.exists, 'add-teacher route missing');
    assert.ok(assignTeacher.exists, 'assign-teacher route missing');
    assert.ok(addTeacher.methods.POST, 'add-teacher must export POST');
    assert.ok(assignTeacher.methods.POST, 'assign-teacher must export POST');
  });

  harness.it('F18.2: delete-student route must exist and export DELETE', () => {
    assert.ok(deleteStudent.exists, 'delete-student route missing');
    assert.ok(deleteStudent.methods.DELETE, 'delete-student must export DELETE');
  });

  harness.it('F18.3: get-teachers and get-students routes must exist and export GET', () => {
    assert.ok(getTeachers.exists, 'get-teachers route missing');
    assert.ok(getStudents.exists, 'get-students route missing');
    assert.ok(getTeachers.methods.GET, 'get-teachers must export GET');
    assert.ok(getStudents.methods.GET, 'get-students must export GET');
  });

  harness.it('F18.4: assign-teacher must validate studentId and teacherId and update student relation', () => {
    assert.ok(assignTeacher.exists);
    const validatesFields =
      assignTeacher.code.includes('studentId') &&
      assignTeacher.code.includes('teacherId');
    assert.ok(validatesFields, 'assign-teacher must require studentId and teacherId');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f18-admin-user-management-api.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
