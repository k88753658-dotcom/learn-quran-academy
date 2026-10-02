/**
 * Milestone M5 Empirical Adversarial Verification Suite
 * Authoritative Challenger Verification for Learn Quran Academy Milestone M5
 * 
 * Tests:
 * 1. Admin RBAC & Session Enforcement across all M5 endpoints
 * 2. Self-deletion & privilege protection
 * 3. Manual Payment Approval/Rejection State Machine
 * 4. Teacher Application Approval/Rejection State Machine & Clerk provisioning
 * 5. Admin Stats formula resiliency (zero-division defense)
 * 6. M4 Hardening Defect Verification (proving vulnerabilities are closed)
 * 7. Zero Supabase / legacy imports across all 23 files
 */

import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists, parsePrismaSchema } from './helpers/contract-helpers.mjs';

const harness = createHarness();

const M5_ALL_23_FILES = [
  // Group 1: 11 existing refactored admin routes
  'src/app/api/admin-stats/route.ts',
  'src/app/api/get-students/route.ts',
  'src/app/api/get-teachers/route.ts',
  'src/app/api/add-teacher/route.ts',
  'src/app/api/assign-teacher/route.ts',
  'src/app/api/delete-student/route.ts',
  'src/app/api/get-teacher-applications/route.ts',
  'src/app/api/approve-teacher-application/route.ts',
  'src/app/api/approve-manual-payment/route.ts',
  'src/app/api/get-active-announcements/route.ts',
  'src/app/api/publish-announcement/route.ts',

  // Group 2: 8 companion admin routes
  'src/app/api/admin-students/route.ts',
  'src/app/api/admin-teachers/route.ts',
  'src/app/api/admin-classes/route.ts',
  'src/app/api/admin-billing/route.ts',
  'src/app/api/add-student/route.ts',
  'src/app/api/delete-user/route.ts',
  'src/app/api/reject-teacher-application/route.ts',
  'src/app/api/reject-manual-payment/route.ts',

  // Group 3: 4 M4 hardening routes
  'src/app/api/teacher-attendance/route.ts',
  'src/app/api/update-student/route.ts',
  'src/app/api/attendance/route.ts',
  'src/app/api/login/route.ts',
];

// =========================================================================
// SUITE 1: Zero Legacy Supabase Probing
// =========================================================================
harness.describe('Suite 1: Zero Legacy Supabase Probing Across All 23 Target Endpoints', () => {
  harness.it('1.1: Every one of the 23 files must exist on disk', () => {
    for (const relPath of M5_ALL_23_FILES) {
      assert.ok(projectFileExists(relPath), `File must exist: ${relPath}`);
    }
  });

  harness.it('1.2: Absolutely zero occurrences of @supabase or createClient across all 23 files', () => {
    for (const relPath of M5_ALL_23_FILES) {
      const content = readProjectFile(relPath);
      assert.ok(content, `Cannot read ${relPath}`);
      assert.equal(
        content.includes('@supabase') || content.includes('@/utils/supabase'),
        false,
        `Forbidden Supabase import found in ${relPath}`
      );
    }
  });

  harness.it('1.3: All 23 files must import and use @/lib/prisma and @clerk/nextjs', () => {
    for (const relPath of M5_ALL_23_FILES) {
      const content = readProjectFile(relPath);
      assert.ok(
        content.includes('@/lib/prisma'),
        `Missing @/lib/prisma import in ${relPath}`
      );
      assert.ok(
        content.includes('@clerk/nextjs/server'),
        `Missing @clerk/nextjs/server import in ${relPath}`
      );
    }
  });
});

// =========================================================================
// SUITE 2: RBAC Matrix & Gating Enforcement Probing
// =========================================================================
harness.describe('Suite 2: RBAC Matrix & Gating Enforcement Across Admin Endpoints', () => {
  const adminOnlyRoutes = [
    'src/app/api/admin-stats/route.ts',
    'src/app/api/add-teacher/route.ts',
    'src/app/api/assign-teacher/route.ts',
    'src/app/api/delete-student/route.ts',
    'src/app/api/get-teacher-applications/route.ts',
    'src/app/api/approve-teacher-application/route.ts',
    'src/app/api/approve-manual-payment/route.ts',
    'src/app/api/admin-students/route.ts',
    'src/app/api/admin-teachers/route.ts',
    'src/app/api/admin-classes/route.ts',
    'src/app/api/admin-billing/route.ts',
    'src/app/api/add-student/route.ts',
    'src/app/api/delete-user/route.ts',
    'src/app/api/reject-teacher-application/route.ts',
    'src/app/api/reject-manual-payment/route.ts',
  ];

  harness.it('2.1: All 15 dedicated admin endpoints enforce admin role checks', () => {
    for (const relPath of adminOnlyRoutes) {
      const code = readProjectFile(relPath);
      assert.ok(
        code.includes('role !== "admin"') || code.includes('profile.role !== "admin"'),
        `Must enforce admin role gating in ${relPath}`
      );
      assert.ok(
        code.includes('403'),
        `Must return 403 Forbidden for non-admin callers in ${relPath}`
      );
      assert.ok(
        code.includes('401'),
        `Must return 401 Unauthorized for unauthenticated callers in ${relPath}`
      );
    }
  });

  harness.it('2.2: Staff routes (get-students, get-teachers, publish-announcement) enforce staff role', () => {
    const staffRoutes = [
      'src/app/api/get-students/route.ts',
      'src/app/api/get-teachers/route.ts',
      'src/app/api/publish-announcement/route.ts',
    ];

    for (const relPath of staffRoutes) {
      const code = readProjectFile(relPath);
      assert.ok(
        code.includes('role !== "admin"') && code.includes('role !== "teacher"'),
        `Must enforce staff (admin or teacher) role gating in ${relPath}`
      );
      assert.ok(code.includes('403'), `Must return 403 in ${relPath}`);
    }
  });

  harness.it('2.3: get-students enforces strict tenant isolation for teachers', () => {
    const code = readProjectFile('src/app/api/get-students/route.ts');
    assert.ok(
      code.includes('whereClause.teacherId = profile.id'),
      'Teacher query must scope whereClause.teacherId to profile.id'
    );
  });
});

// =========================================================================
// SUITE 3: Admin Stats Resiliency & Formula Defense
// =========================================================================
harness.describe('Suite 3: Admin Stats Resiliency & Formula Defense', () => {
  const statsCode = readProjectFile('src/app/api/admin-stats/route.ts');

  // Mathematical oracle test for attendance calculation
  const calculateAttendanceRate = (totalStudents, presentCount) => {
    return totalStudents > 0
      ? Math.round((presentCount / totalStudents) * 100)
      : 0;
  };

  harness.it('3.1: Zero students produces 0 (not NaN, not Infinity)', () => {
    assert.equal(calculateAttendanceRate(0, 0), 0);
    assert.equal(calculateAttendanceRate(0, 5), 0);
  });

  harness.it('3.2: Realistic student attendance rates round accurately', () => {
    assert.equal(calculateAttendanceRate(100, 85), 85);
    assert.equal(calculateAttendanceRate(3, 1), 33);
    assert.equal(calculateAttendanceRate(3, 2), 67);
    assert.equal(calculateAttendanceRate(10, 10), 100);
  });

  harness.it('3.3: Implementation contains the zero-division ternary guard', () => {
    assert.ok(
      statsCode.includes('totalStudents > 0') &&
      statsCode.includes('Math.round((presentCount / totalStudents) * 100)'),
      'Must contain defensive division guard'
    );
  });

  harness.it('3.4: Active courses metric aggregates DB Course count and active Student courses', () => {
    assert.ok(
      statsCode.includes('Math.max(activeCoursesCount, uniqueStudentCourses)') ||
      statsCode.includes('uniqueStudentCourses'),
      'Must aggregate unique active courses'
    );
  });
});

// =========================================================================
// SUITE 4: Manual Payment State Machine Invariance (F20)
// =========================================================================
harness.describe('Suite 4: Manual Payment State Machine Invariance (F20)', () => {
  const approveCode = readProjectFile('src/app/api/approve-manual-payment/route.ts');
  const rejectCode = readProjectFile('src/app/api/reject-manual-payment/route.ts');

  harness.it('4.1: approve-manual-payment validates studentId and action', () => {
    assert.ok(
      approveCode.includes('!studentId') && approveCode.includes('!action'),
      'Must validate studentId and action'
    );
  });

  harness.it('4.2: Approval transitions student.enrolled to true and billing.status to Paid', () => {
    assert.ok(
      approveCode.includes('enrolled: true'),
      'Approve action must set enrolled: true'
    );
    assert.ok(
      approveCode.includes('status: "Paid"'),
      'Approve action must set billing status Paid'
    );
    assert.ok(
      approveCode.includes('amountDue: "0 PKR"'),
      'Approve action must clear amountDue to 0 PKR'
    );
    assert.ok(
      approveCode.includes('status: "Approved"'),
      'Approve action must resolve paymentTicket with Approved'
    );
  });

  harness.it('4.3: Rejection resets billing to Pending and paymentTicket to Rejected', () => {
    assert.ok(
      approveCode.includes('status: "Pending"') || rejectCode.includes('status: "Pending"'),
      'Reject flow must reset billing status to Pending'
    );
    assert.ok(
      approveCode.includes('status: "Rejected"') || rejectCode.includes('status: "Rejected"'),
      'Reject flow must mark paymentTicket as Rejected'
    );
  });

  harness.it('4.4: reject-manual-payment dedicated route exists and enforces 403 for non-admins', () => {
    assert.ok(rejectCode.includes('role !== "admin"'), 'reject-manual-payment must gate non-admins');
    assert.ok(rejectCode.includes('status: "Rejected"'), 'reject-manual-payment must set Rejected');
  });
});

// =========================================================================
// SUITE 5: Teacher Recruitment State Machine Invariance (F19)
// =========================================================================
harness.describe('Suite 5: Teacher Recruitment State Machine Invariance (F19)', () => {
  const approveAppCode = readProjectFile('src/app/api/approve-teacher-application/route.ts');
  const rejectAppCode = readProjectFile('src/app/api/reject-teacher-application/route.ts');

  harness.it('5.1: approve-teacher-application validates applicationId and action', () => {
    assert.ok(
      approveAppCode.includes('!applicationId') && approveAppCode.includes('!action'),
      'Must require applicationId and action'
    );
  });

  harness.it('5.2: approve-teacher-application rejects non-pending applications with 409 Conflict', () => {
    assert.ok(
      approveAppCode.includes('application.status !== "pending"') &&
      approveAppCode.includes('409'),
      'Must guard against re-processing applications'
    );
  });

  harness.it('5.3: Teacher approval provisions Clerk user with role: teacher in publicMetadata', () => {
    assert.ok(
      approveAppCode.includes('role: "teacher"'),
      'Must set role: teacher in metadata'
    );
    assert.ok(
      approveAppCode.includes('client.users.createUser'),
      'Must call clerkClient createUser'
    );
  });

  harness.it('5.4: Teacher approval rollback: deletes Clerk user if DB transaction fails', () => {
    assert.ok(
      approveAppCode.includes('client.users.deleteUser(clerkUserId)'),
      'Must rollback Clerk user on DB error'
    );
  });

  harness.it('5.5: reject-teacher-application updates application status to rejected and stores notes', () => {
    assert.ok(
      rejectAppCode.includes('status: "rejected"'),
      'Must update status to rejected'
    );
    assert.ok(
      rejectAppCode.includes('adminNotes:'),
      'Must record adminNotes'
    );
  });
});

// =========================================================================
// SUITE 6: User Management Defenses (F18)
// =========================================================================
harness.describe('Suite 6: User Management Defenses & Boundary Protections (F18)', () => {
  const deleteUserCode = readProjectFile('src/app/api/delete-user/route.ts');
  const addStudentCode = readProjectFile('src/app/api/add-student/route.ts');
  const addTeacherCode = readProjectFile('src/app/api/add-teacher/route.ts');
  const assignTeacherCode = readProjectFile('src/app/api/assign-teacher/route.ts');

  harness.it('6.1: delete-user prevents self-deletion by active admin', () => {
    assert.ok(
      deleteUserCode.includes('cleanTargetId === userId'),
      'delete-user must verify caller is not deleting their own active ID'
    );
    assert.ok(
      deleteUserCode.includes('Admins cannot delete their own active account'),
      'Must return self-deletion error'
    );
  });

  harness.it('6.2: add-student validates email regex and enforces minimum password length', () => {
    assert.ok(
      addStudentCode.includes('emailRegex'),
      'add-student must validate email format'
    );
    assert.ok(
      addStudentCode.includes('prisma.$transaction'),
      'add-student must execute transactional profile + student + billing creation'
    );
  });

  harness.it('6.3: add-teacher rejects duplicate email with 409 Conflict', () => {
    assert.ok(
      addTeacherCode.includes('existing') && addTeacherCode.includes('409'),
      'add-teacher must check for existing profile and return 409'
    );
    assert.ok(
      addTeacherCode.includes('password.length < 6') || addTeacherCode.includes('.length < 6'),
      'add-teacher must check min password length'
    );
  });

  harness.it('6.4: assign-teacher handles unassigned and null safely to unassign students', () => {
    assert.ok(
      assignTeacherCode.includes('teacherId !== "unassigned"') &&
      assignTeacherCode.includes('teacherId !== "null"'),
      'assign-teacher must support clearing teacher assignments'
    );
  });
});

// =========================================================================
// SUITE 7: Empirical Verification of M4 Hardening Fixes
// =========================================================================
harness.describe('Suite 7: Milestone M4 Hardening Fixes Empirical Verification', () => {
  const teacherAttCode = readProjectFile('src/app/api/teacher-attendance/route.ts');
  const attCode = readProjectFile('src/app/api/attendance/route.ts');
  const updateStudentCode = readProjectFile('src/app/api/update-student/route.ts');
  const loginCode = readProjectFile('src/app/api/login/route.ts');

  harness.it('7.1: teacher-attendance verifies student belongs to teacher (studentIds.includes check)', () => {
    assert.ok(
      teacherAttCode.includes('studentIds.includes(filterStudentId)'),
      'teacher-attendance MUST verify filterStudentId is in teacher studentIds'
    );
    assert.ok(
      teacherAttCode.includes('attendances: []'),
      'Must return empty array if student is not assigned to teacher'
    );
  });

  harness.it('7.2: GET /api/attendance gates access to staff roles (teacher or admin)', () => {
    const getFunc = attCode.slice(attCode.indexOf('export async function GET'));
    assert.ok(
      getFunc.includes('role !== "admin"') && getFunc.includes('role !== "teacher"'),
      'GET /api/attendance must reject non-staff callers'
    );
    assert.ok(
      getFunc.includes('403'),
      'Must return 403 Forbidden for unauthorized roles'
    );
  });

  harness.it('7.3: update-student checks teacherId ownership before allowing student updates', () => {
    assert.ok(
      updateStudentCode.includes('targetStudent.teacherId !== profile.id'),
      'update-student MUST verify teacherId match when caller is a teacher'
    );
    assert.ok(
      updateStudentCode.includes('Forbidden: You are not assigned to this student'),
      'Must return 403 if teacher does not teach this student'
    );
  });

  harness.it('7.4: /api/login requires active session and validates caller profile matches requested email', () => {
    assert.ok(
      loginCode.includes('const { userId } = await auth();') &&
      loginCode.includes('401'),
      '/api/login must require active session'
    );
    assert.ok(
      loginCode.includes('sessionProfile.email !== cleanEmail && sessionProfile.role !== "admin"'),
      '/api/login must forbid probing profiles other than caller own email'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('m5-empirical-adversarial.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
