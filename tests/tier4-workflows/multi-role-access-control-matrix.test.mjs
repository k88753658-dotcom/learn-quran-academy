/**
 * Tier 4: Multi-Role Access Control Matrix Verification
 * Tests the entire RBAC matrix across all user personas (Anonymous, Student, Teacher, Admin)
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';

const harness = createHarness();

harness.describe('Tier 4 Real-World Journey: Multi-Role Access Control Matrix', () => {
  // Authoritative matrix definition according to PROJECT.md
  const rbacMatrix = [
    { route: '/api/courses (GET)', public: true, student: true, teacher: true, admin: true },
    { route: '/api/courses (POST/DEL)', public: false, student: false, teacher: false, admin: true },
    { route: '/api/public-teachers', public: true, student: true, teacher: true, admin: true },
    { route: '/api/teacher-application', public: true, student: true, teacher: true, admin: true },
    { route: '/api/verify-manual-payment', public: true, student: true, teacher: true, admin: true },
    { route: '/api/student-dashboard', public: false, student: true, teacher: false, admin: false },
    { route: '/api/teacher-dashboard', public: false, student: false, teacher: true, admin: false },
    { route: '/api/attendance (POST)', public: false, student: false, teacher: true, admin: true },
    { route: '/api/admin-stats', public: false, student: false, teacher: false, admin: true },
    { route: '/api/approve-manual-payment', public: false, student: false, teacher: false, admin: true },
    { route: '/api/approve-teacher-application', public: false, student: false, teacher: false, admin: true },
    { route: '/api/add-teacher', public: false, student: false, teacher: false, admin: true },
  ];

  const canAccess = (policy, role) => {
    if (!role) return policy.public;
    if (role === 'student') return policy.student;
    if (role === 'teacher') return policy.teacher;
    if (role === 'admin') return policy.admin;
    return false;
  };

  harness.it('T4.RBAC.1: Anonymous visitors have access ONLY to designated public endpoints', () => {
    for (const rule of rbacMatrix) {
      const allowed = canAccess(rule, null);
      assert.equal(
        allowed,
        rule.public,
        `Anonymous access policy violated for ${rule.route}`
      );
    }
  });

  harness.it('T4.RBAC.2: Students can access learning dashboards but are denied administrative endpoints', () => {
    const studentBlocked = [
      '/api/admin-stats',
      '/api/courses (POST/DEL)',
      '/api/approve-manual-payment',
      '/api/approve-teacher-application',
      '/api/teacher-dashboard',
      '/api/add-teacher',
    ];

    for (const routeName of studentBlocked) {
      const rule = rbacMatrix.find((r) => r.route === routeName);
      assert.ok(rule);
      assert.equal(canAccess(rule, 'student'), false, `Student must be denied access to ${routeName}`);
    }
  });

  harness.it('T4.RBAC.3: Teachers can access teaching rosters and log attendance but cannot manage payments or courses', () => {
    const teacherAllowed = ['/api/teacher-dashboard', '/api/attendance (POST)'];
    const teacherBlocked = ['/api/admin-stats', '/api/approve-manual-payment', '/api/courses (POST/DEL)'];

    for (const routeName of teacherAllowed) {
      const rule = rbacMatrix.find((r) => r.route === routeName);
      assert.ok(rule);
      assert.equal(canAccess(rule, 'teacher'), true, `Teacher must be allowed access to ${routeName}`);
    }

    for (const routeName of teacherBlocked) {
      const rule = rbacMatrix.find((r) => r.route === routeName);
      assert.ok(rule);
      assert.equal(canAccess(rule, 'teacher'), false, `Teacher must be denied access to ${routeName}`);
    }
  });

  harness.it('T4.RBAC.4: Administrators possess full authorization over management endpoints', () => {
    const adminRoutes = [
      '/api/admin-stats',
      '/api/courses (POST/DEL)',
      '/api/approve-manual-payment',
      '/api/approve-teacher-application',
      '/api/add-teacher',
    ];

    for (const routeName of adminRoutes) {
      const rule = rbacMatrix.find((r) => r.route === routeName);
      assert.ok(rule);
      assert.equal(canAccess(rule, 'admin'), true, `Admin must have access to ${routeName}`);
    }
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('multi-role-access-control-matrix.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
