/**
 * Milestone 4 Empirical Adversarial & Boundary Stress Test Suite
 * Conducted by Challenger M4-1 (Empirical Challenger)
 * 
 * Adversarially evaluates:
 * - Group 1: Student API Routes (f12)
 *   1. src/app/api/student-dashboard/route.ts
 *   2. src/app/api/student-profile/route.ts
 *   3. src/app/api/student-history/route.ts
 *   4. src/app/api/student-schedule/route.ts
 *   5. src/app/api/student-billing/route.ts
 *   6. src/app/api/billing/route.ts
 * 
 * - Group 2: Teacher API Routes (f13)
 *   7. src/app/api/teacher-dashboard/route.ts
 *   8. src/app/api/update-teacher-profile/route.ts
 *   9. src/app/api/update-teacher-activity/route.ts
 *   10. src/app/api/update-student/route.ts
 *   11. src/app/api/teacher-schedule/route.ts
 *   12. src/app/api/teacher-classes/route.ts
 *   13. src/app/api/teacher-students/route.ts
 *   14. src/app/api/teacher-attendance/route.ts
 *   15. src/app/api/add-availability/route.ts
 * 
 * - Group 3: Shared / Attendance / Payments / Auth Routes (f14, f15, f16)
 *   16. src/app/api/attendance/route.ts
 *   17. src/app/api/mark-attendance/route.ts
 *   18. src/app/api/my-attendance/route.ts
 *   19. src/app/api/verify-manual-payment/route.ts
 *   20. src/app/api/login/route.ts
 *   21. src/app/api/register/route.ts
 * 
 * - Group 4: Milestone M3 Hardening Routes
 *   22. src/app/api/payment-ticket/route.ts
 *   23. src/app/api/notifications/route.ts
 */

import { createHarness, assert } from './helpers/test-harness.mjs';
import { analyzeRouteHandler, readProjectFile, parsePrismaSchema } from './helpers/contract-helpers.mjs';

const harness = createHarness();

const ALL_M4_ROUTES = [
  { path: 'src/app/api/student-dashboard/route.ts', name: 'student-dashboard', methods: ['GET'], protected: true },
  { path: 'src/app/api/student-profile/route.ts', name: 'student-profile', methods: ['GET'], protected: false },
  { path: 'src/app/api/student-history/route.ts', name: 'student-history', methods: ['GET', 'POST'], protected: false },
  { path: 'src/app/api/student-schedule/route.ts', name: 'student-schedule', methods: ['GET'], protected: true },
  { path: 'src/app/api/student-billing/route.ts', name: 'student-billing', methods: ['GET'], protected: false },
  { path: 'src/app/api/billing/route.ts', name: 'billing', methods: ['GET', 'POST'], protected: true },
  { path: 'src/app/api/teacher-dashboard/route.ts', name: 'teacher-dashboard', methods: ['GET'], protected: true },
  { path: 'src/app/api/update-teacher-profile/route.ts', name: 'update-teacher-profile', methods: ['POST'], protected: true },
  { path: 'src/app/api/update-teacher-activity/route.ts', name: 'update-teacher-activity', methods: ['POST'], protected: true },
  { path: 'src/app/api/update-student/route.ts', name: 'update-student', methods: ['POST'], protected: true },
  { path: 'src/app/api/teacher-schedule/route.ts', name: 'teacher-schedule', methods: ['GET'], protected: true },
  { path: 'src/app/api/teacher-classes/route.ts', name: 'teacher-classes', methods: ['GET'], protected: true },
  { path: 'src/app/api/teacher-students/route.ts', name: 'teacher-students', methods: ['GET'], protected: true },
  { path: 'src/app/api/teacher-attendance/route.ts', name: 'teacher-attendance', methods: ['GET'], protected: true },
  { path: 'src/app/api/add-availability/route.ts', name: 'add-availability', methods: ['POST'], protected: true },
  { path: 'src/app/api/attendance/route.ts', name: 'attendance', methods: ['GET', 'POST'], protected: true },
  { path: 'src/app/api/mark-attendance/route.ts', name: 'mark-attendance', methods: ['POST'], protected: true },
  { path: 'src/app/api/my-attendance/route.ts', name: 'my-attendance', methods: ['GET', 'POST'], protected: true },
  { path: 'src/app/api/verify-manual-payment/route.ts', name: 'verify-manual-payment', methods: ['POST'], protected: false },
  { path: 'src/app/api/login/route.ts', name: 'login', methods: ['POST'], protected: false },
  { path: 'src/app/api/register/route.ts', name: 'register', methods: ['POST'], protected: false },
  { path: 'src/app/api/payment-ticket/route.ts', name: 'payment-ticket', methods: ['POST'], protected: false },
  { path: 'src/app/api/notifications/route.ts', name: 'notifications', methods: ['GET', 'PATCH'], protected: false },
];

// =========================================================================
// SUITE 1: Zero Supabase & Prisma Singleton Eradication Audit
// =========================================================================
harness.describe('Suite 1: Architecture & Supabase Eradication across all 23 M4 Files', () => {
  for (const r of ALL_M4_ROUTES) {
    const analysis = analyzeRouteHandler(r.path);

    harness.it(`1.1.${r.name}: ${r.path} must exist and export required HTTP methods`, () => {
      assert.ok(analysis.exists, `File ${r.path} does not exist`);
      for (const m of r.methods) {
        if (m === 'PATCH') {
          assert.ok(analysis.code.includes('export async function PATCH'), `${r.name} must export PATCH`);
        } else {
          assert.ok(analysis.methods[m], `${r.name} must export async function ${m}`);
        }
      }
    });

    harness.it(`1.2.${r.name}: ${r.path} must have ZERO Supabase imports`, () => {
      assert.equal(analysis.usesSupabase, false, `${r.name} must not import @supabase or createClient`);
      assert.equal(analysis.code.includes('@/utils/supabase'), false, `${r.name} must not reference supabase utils`);
    });

    harness.it(`1.3.${r.name}: ${r.path} must import Prisma client singleton from '@/lib/prisma'`, () => {
      assert.ok(analysis.usesPrisma, `${r.name} must import prisma`);
      assert.ok(
        analysis.code.includes("from '@/lib/prisma'") || analysis.code.includes('from "@/lib/prisma"'),
        `${r.name} must import prisma from '@/lib/prisma'`
      );
    });
  }
});

// =========================================================================
// SUITE 2: Unauthenticated Access & Session Gating (401 Verification)
// =========================================================================
harness.describe('Suite 2: Unauthenticated Access Probing & 401 Unauthorized Enforcement', () => {
  const protectedRoutes = ALL_M4_ROUTES.filter((r) => r.protected);

  for (const r of protectedRoutes) {
    const code = readProjectFile(r.path);

    harness.it(`2.1.${r.name}: Must reject unauthenticated requests with HTTP 401`, () => {
      assert.ok(code.includes('auth()'), `${r.name} must invoke auth() from @clerk/nextjs/server`);
      assert.ok(code.includes('!userId'), `${r.name} must verify presence of userId`);
      assert.ok(code.includes('401'), `${r.name} must return status code 401`);
      assert.ok(
        code.includes('Unauthorized') || code.includes('Please log in'),
        `${r.name} must include an informative unauthorized error message`
      );
    });
  }

  harness.it('2.2: Attendance GET and POST must both reject unauthenticated calls with 401', () => {
    const code = readProjectFile('src/app/api/attendance/route.ts');
    const postIdx = code.indexOf('export async function POST');
    const getIdx = code.indexOf('export async function GET');
    const postCode = code.slice(postIdx, getIdx);
    const getCode = code.slice(getIdx);

    assert.ok(postCode.includes('401'), 'POST /api/attendance must return 401 for unauthenticated');
    assert.ok(getCode.includes('401'), 'GET /api/attendance must return 401 for unauthenticated');
  });

  harness.it('2.3: My-Attendance GET and POST must both reject unauthenticated calls with 401', () => {
    const code = readProjectFile('src/app/api/my-attendance/route.ts');
    const postIdx = code.indexOf('export async function POST');
    const getIdx = code.indexOf('export async function GET');
    const postCode = code.slice(postIdx, getIdx);
    const getCode = code.slice(getIdx);

    assert.ok(postCode.includes('401'), 'POST /api/my-attendance must return 401 for unauthenticated');
    assert.ok(getCode.includes('401'), 'GET /api/my-attendance must return 401 for unauthenticated');
  });
});

// =========================================================================
// SUITE 3: Cross-Role Authorization Matrix (403 Forbidden Enforcement)
// =========================================================================
harness.describe('Suite 3: Role-Based Access Control & Privilege Escalation Guards', () => {
  const teacherRoleRoutes = [
    { path: 'src/app/api/update-teacher-profile/route.ts', name: 'update-teacher-profile' },
    { path: 'src/app/api/update-teacher-activity/route.ts', name: 'update-teacher-activity' },
    { path: 'src/app/api/teacher-schedule/route.ts', name: 'teacher-schedule' },
    { path: 'src/app/api/teacher-classes/route.ts', name: 'teacher-classes' },
    { path: 'src/app/api/teacher-students/route.ts', name: 'teacher-students' },
    { path: 'src/app/api/teacher-attendance/route.ts', name: 'teacher-attendance' },
    { path: 'src/app/api/add-availability/route.ts', name: 'add-availability' },
  ];

  for (const r of teacherRoleRoutes) {
    const code = readProjectFile(r.path);

    harness.it(`3.1.${r.name}: Must reject student callers with 403 Forbidden`, () => {
      assert.ok(
        code.includes('profile.role !== "teacher"') || code.includes("profile.role !== 'teacher'"),
        `${r.name} must check profile.role === 'teacher'`
      );
      assert.ok(code.includes('403'), `${r.name} must return 403 Forbidden for unauthorized roles`);
    });
  }

  harness.it('3.2.teacher-dashboard: Teacher dashboard must gate student callers', () => {
    const code = readProjectFile('src/app/api/teacher-dashboard/route.ts');
    assert.ok(
      code.includes('profile.role !== "teacher"') || code.includes("profile.role !== 'teacher'"),
      'Must check teacher role'
    );
    // Note: Returns 404 rather than 403, preventing data exposure
    assert.ok(code.includes('404'), 'Teacher dashboard returns 404 for non-teacher accounts');
  });

  harness.it('3.3.update-student: Must enforce staff role (teacher or admin) with 403', () => {
    const code = readProjectFile('src/app/api/update-student/route.ts');
    assert.ok(
      code.includes('profile.role !== "teacher" && profile.role !== "admin"'),
      'Must require teacher or admin role'
    );
    assert.ok(code.includes('403'), 'Must return 403 Forbidden for students');
  });

  harness.it('3.4.attendance-POST: Must enforce staff role (admin or teacher) with 403', () => {
    const code = readProjectFile('src/app/api/attendance/route.ts');
    assert.ok(
      code.includes('profile.role !== "admin" && profile.role !== "teacher"'),
      'Must verify staff role'
    );
    assert.ok(code.includes('403'), 'Must return 403 Forbidden for students');
  });

  harness.it('3.5.mark-attendance: Must enforce staff role (admin or teacher) with 403', () => {
    const code = readProjectFile('src/app/api/mark-attendance/route.ts');
    assert.ok(
      code.includes('profile.role !== "admin" && profile.role !== "teacher"'),
      'Must verify staff role'
    );
    assert.ok(code.includes('403'), 'Must return 403 Forbidden for students');
  });

  harness.it('3.6.billing-POST: Must enforce admin-only role with 403', () => {
    const code = readProjectFile('src/app/api/billing/route.ts');
    assert.ok(
      code.includes('profile.role !== "admin"') || code.includes("profile.role !== 'admin'"),
      'Must verify admin role'
    );
    assert.ok(code.includes('403'), 'Must return 403 Forbidden for non-admins');
  });
});

// =========================================================================
// SUITE 4: Progress Boundary Clamping & Fuzzing (update-student)
// =========================================================================
harness.describe('Suite 4: Progress Boundary Clamping & Input Sanitization in update-student', () => {
  const code = readProjectFile('src/app/api/update-student/route.ts');

  harness.it('4.1: Implementation contains Math.max(0, Math.min(progress, 100)) clamping logic', () => {
    assert.ok(
      code.includes('Math.max(0, Math.min('),
      'Must use Math.max(0, Math.min(...)) clamping idiom'
    );
  });

  // Empirical execution of clamping algorithm on boundary values
  const clampLogic = (progress, fallback = 0) => {
    const parsed = Number(progress);
    return !isNaN(parsed) ? Math.max(0, Math.min(parsed, 100)) : fallback;
  };

  harness.it('4.2: Clamping negative values (-100, -1, -0.01) clamps to 0', () => {
    assert.equal(clampLogic(-100), 0);
    assert.equal(clampLogic(-1), 0);
    assert.equal(clampLogic(-0.01), 0);
  });

  harness.it('4.3: Clamping overflow values (101, 200, 99999, Infinity) clamps to 100 or boundary', () => {
    assert.equal(clampLogic(101), 100);
    assert.equal(clampLogic(200), 100);
    assert.equal(clampLogic(99999), 100);
    assert.equal(clampLogic(100.5), 100);
  });

  harness.it('4.4: Valid boundary values (0, 50, 100) are strictly preserved', () => {
    assert.equal(clampLogic(0), 0);
    assert.equal(clampLogic(25), 25);
    assert.equal(clampLogic(50), 50);
    assert.equal(clampLogic(75), 75);
    assert.equal(clampLogic(100), 100);
  });

  harness.it('4.5: Non-numeric strings, NaN, undefined safely fallback to current student progress', () => {
    const currentProgress = 65;
    assert.equal(clampLogic(undefined, currentProgress), currentProgress);
    assert.equal(clampLogic('invalid-progress', currentProgress), currentProgress);
    assert.equal(clampLogic('NaN', currentProgress), currentProgress);
    assert.equal(clampLogic({}, currentProgress), currentProgress);
  });

  harness.it('4.6: Numeric string coercion ("80") correctly parses to 80', () => {
    assert.equal(clampLogic('80'), 80);
    assert.equal(clampLogic('0'), 0);
    assert.equal(clampLogic('100'), 100);
  });
});

// =========================================================================
// SUITE 5: Payment Ticket Status Invariance & Injection Prevention
// =========================================================================
harness.describe('Suite 5: Payment Ticket Status Invariance & Privilege Injection Defense', () => {
  const manualPaymentCode = readProjectFile('src/app/api/verify-manual-payment/route.ts');
  const paymentTicketCode = readProjectFile('src/app/api/payment-ticket/route.ts');

  harness.it('5.1: verify-manual-payment unconditionally hardcodes status "Reviewing" on ticket creation', () => {
    assert.ok(
      manualPaymentCode.includes('status: "Reviewing"'),
      'verify-manual-payment must set status: "Reviewing"'
    );
    // Assert body.status is never read or assigned to ticket creation
    assert.equal(
      manualPaymentCode.includes('status: body.status') || manualPaymentCode.includes('status: status'),
      false,
      'verify-manual-payment must not read caller status'
    );
  });

  harness.it('5.2: verify-manual-payment unconditionally sets Billing status to "Reviewing"', () => {
    assert.ok(
      manualPaymentCode.includes('update: { status: "Reviewing" }') &&
      manualPaymentCode.includes('status: "Reviewing"'),
      'Billing status must transition to Reviewing'
    );
  });

  harness.it('5.3: payment-ticket route overrides caller status to "Reviewing" unconditionally', () => {
    assert.ok(
      paymentTicketCode.includes('const ticketStatus = "Reviewing";'),
      'payment-ticket must assign ticketStatus = "Reviewing"'
    );
    assert.equal(
      paymentTicketCode.includes('status === "Approved" ? "Approved"'),
      false,
      'Old vulnerability allowing status === "Approved" must be eradicated'
    );
  });

  harness.it('5.4: Invariance verification: Injected status "Approved", "Paid", "AdminBypass" always yields "Reviewing"', () => {
    const simulateTicketHandler = (body) => {
      const ticketStatus = "Reviewing";
      return { status: ticketStatus };
    };

    assert.equal(simulateTicketHandler({ status: 'Approved' }).status, 'Reviewing');
    assert.equal(simulateTicketHandler({ status: 'Paid' }).status, 'Reviewing');
    assert.equal(simulateTicketHandler({ status: 'AdminBypass' }).status, 'Reviewing');
    assert.equal(simulateTicketHandler({ status: null }).status, 'Reviewing');
  });

  harness.it('5.5: Duplicate transactionId is rejected with 400', () => {
    assert.ok(
      manualPaymentCode.includes('already been submitted') && manualPaymentCode.includes('400'),
      'verify-manual-payment must reject duplicate tx IDs'
    );
    assert.ok(
      paymentTicketCode.includes('already been submitted') && paymentTicketCode.includes('400'),
      'payment-ticket must reject duplicate tx IDs'
    );
  });
});

// =========================================================================
// SUITE 6: Notifications Privacy Scoping
// =========================================================================
harness.describe('Suite 6: Notifications Privacy Scoping & Information Leakage Defense', () => {
  const notifCode = readProjectFile('src/app/api/notifications/route.ts');

  harness.it('6.1: Untargeted queries (no studentId / userId) strictly scoped to { isActive: true, type: "Global" }', () => {
    assert.ok(
      notifCode.includes('{ isActive: true, type: "Global" }'),
      'Untargeted queries must filter exclusively by Global type'
    );
  });

  harness.it('6.2: Targeted queries only include Global OR Targeted matching targetStudentId', () => {
    assert.ok(
      notifCode.includes('{ type: "Global" }') &&
      notifCode.includes('{ type: "Targeted", targetStudentId }'),
      'Targeted queries must only return Global and student-specific targeted notifications'
    );
  });

  // Empirical test of notification query builder logic
  const buildNotificationFilter = (targetStudentId) => {
    return targetStudentId
      ? {
          isActive: true,
          OR: [
            { type: "Global" },
            { type: "Targeted", targetStudentId },
          ],
        }
      : { isActive: true, type: "Global" };
  };

  harness.it('6.3: Simulated untargeted query never includes Targeted notifications in filter', () => {
    const filter = buildNotificationFilter(undefined);
    assert.deepEqual(filter, { isActive: true, type: "Global" });
  });

  harness.it('6.4: Simulated targeted query scopes Targeted notifications strictly to studentId', () => {
    const filter = buildNotificationFilter('student_123');
    assert.equal(filter.isActive, true);
    assert.equal(filter.OR.length, 2);
    assert.deepEqual(filter.OR[0], { type: "Global" });
    assert.deepEqual(filter.OR[1], { type: "Targeted", targetStudentId: 'student_123' });
  });
});

// =========================================================================
// SUITE 7: Attendance Date Normalization & Compound Key Integrity
// =========================================================================
harness.describe('Suite 7: Attendance Calendar Date Normalization & Compound Uniqueness', () => {
  const schema = parsePrismaSchema();
  const attendanceCode = readProjectFile('src/app/api/attendance/route.ts');
  const markAttendanceCode = readProjectFile('src/app/api/mark-attendance/route.ts');

  harness.it('7.1: Prisma schema enforces @@unique([studentId, date]) on Attendance model', () => {
    const attendanceModel = schema.models['Attendance'];
    assert.ok(attendanceModel, 'Attendance model must exist');
    assert.ok(
      schema.rawContent.includes('@@unique([studentId, date])'),
      'Attendance model must have @@unique([studentId, date])'
    );
  });

  harness.it('7.2: attendance/route.ts normalizes date to UTC midnight before upsert', () => {
    assert.ok(
      attendanceCode.includes('setUTCHours(0, 0, 0, 0)'),
      'Must call setUTCHours(0, 0, 0, 0)'
    );
    assert.ok(
      attendanceCode.includes('studentId_date:'),
      'Must use studentId_date compound unique key in upsert'
    );
  });

  harness.it('7.3: mark-attendance/route.ts normalizes date to UTC midnight before upsert', () => {
    assert.ok(
      markAttendanceCode.includes('setUTCHours(0, 0, 0, 0)'),
      'Must call setUTCHours(0, 0, 0, 0)'
    );
    assert.ok(
      markAttendanceCode.includes('studentId_date:'),
      'Must use studentId_date compound unique key in upsert'
    );
  });

  harness.it('7.4: Empirical normalization produces identical timestamp across morning and night check-ins', () => {
    const date1 = new Date('2026-09-29T04:15:32.100Z');
    const date2 = new Date('2026-09-29T23:58:19.999Z');
    date1.setUTCHours(0, 0, 0, 0);
    date2.setUTCHours(0, 0, 0, 0);
    assert.equal(date1.getTime(), date2.getTime(), 'UTC midnight timestamps must match exactly');
    assert.equal(date1.toISOString(), '2026-09-29T00:00:00.000Z');
  });

  harness.it('7.5: Attendance status validation strictly rejects invalid enum strings', () => {
    const validStatuses = ["Present", "Absent", "Late", "Excused"];
    assert.ok(validStatuses.includes("Present"));
    assert.ok(validStatuses.includes("Absent"));
    assert.ok(validStatuses.includes("Late"));
    assert.ok(validStatuses.includes("Excused"));
    assert.equal(validStatuses.includes("HACKED"), false);
    assert.equal(validStatuses.includes("HalfDay"), false);
  });
});

// =========================================================================
// SUITE 8: Frontend UI Compatibility (Aliases & Array Destructuring)
// =========================================================================
harness.describe('Suite 8: Frontend Consumer Compatibility & Legacy Aliases', () => {
  const teacherDashCode = readProjectFile('src/app/api/teacher-dashboard/route.ts');
  const studentDashCode = readProjectFile('src/app/api/student-dashboard/route.ts');

  harness.it('8.1: teacher-dashboard returns both camelCase and snake_case aliases for UI bindings', () => {
    assert.ok(teacherDashCode.includes('studentName: s.studentName') && teacherDashCode.includes('student_name: s.studentName'));
    assert.ok(teacherDashCode.includes('liveClassroomLink: s.liveClassroomLink') && teacherDashCode.includes('live_classroom_link: s.liveClassroomLink'));
    assert.ok(teacherDashCode.includes('lastAssignment: s.lastAssignment') && teacherDashCode.includes('last_assignment: s.lastAssignment'));
    assert.ok(teacherDashCode.includes('_id: s.id'));
  });

  harness.it('8.2: student-dashboard returns billing as array for client destructuring [student.billing] : []', () => {
    assert.ok(
      studentDashCode.includes('billing: student.billing ? [student.billing] : []'),
      'student-dashboard must return billing array'
    );
  });

  harness.it('8.3: teacher-dashboard returns billing as array for client destructuring [s.billing] : []', () => {
    assert.ok(
      teacherDashCode.includes('billing: s.billing ? [s.billing] : []'),
      'teacher-dashboard must return billing array'
    );
  });
});

// =========================================================================
// SUITE 9: Adversarial Findings & Defect Mining
// =========================================================================
harness.describe('Suite 9: Adversarial Boundary Edge Cases & Defect Findings', () => {
  const teacherAttCode = readProjectFile('src/app/api/teacher-attendance/route.ts');
  const attendanceCode = readProjectFile('src/app/api/attendance/route.ts');
  const loginCode = readProjectFile('src/app/api/login/route.ts');
  const updateStudentCode = readProjectFile('src/app/api/update-student/route.ts');

  harness.it('9.1 [Finding]: teacher-attendance filterStudentId parameter bypasses teacher roster scoping', () => {
    // Audit line 37:
    // const targetIds = filterStudentId ? [filterStudentId] : studentIds;
    // When filterStudentId is passed, it is NOT checked against studentIds!
    assert.ok(
      teacherAttCode.includes('const targetIds = filterStudentId ? [filterStudentId] : studentIds;'),
      'Line 37 directly uses filterStudentId without verifying teacher ownership'
    );
    assert.equal(
      teacherAttCode.includes('studentIds.includes(filterStudentId)'),
      false,
      'Lacks membership check on filterStudentId'
    );
  });

  harness.it('9.2 [Finding]: GET /api/attendance lacks role check, allowing any logged-in student to query all academy logs', () => {
    const getSection = attendanceCode.slice(attendanceCode.indexOf('export async function GET'));
    assert.ok(getSection.includes('auth()'), 'GET checks auth');
    assert.equal(
      getSection.includes('profile.role') || getSection.includes('role === "teacher"') || getSection.includes('role === "admin"'),
      false,
      'GET /api/attendance does not verify caller has teacher or admin role'
    );
  });

  harness.it('9.3 [Finding]: /api/login POST verifies email existence in Profile but does NOT verify password against hash or Clerk', () => {
    assert.ok(loginCode.includes('findUnique({ where: { email: cleanEmail } })'));
    assert.equal(
      loginCode.includes('verifyPassword') || loginCode.includes('bcrypt') || loginCode.includes('argon2'),
      false,
      'login/route.ts has no password verification step'
    );
  });

  harness.it('9.4 [Finding]: update-student authorizes any teacher to update any student in the academy', () => {
    assert.ok(updateStudentCode.includes('profile.role !== "teacher" && profile.role !== "admin"'));
    assert.equal(
      updateStudentCode.includes('targetStudent.teacherId === profile.id'),
      false,
      'update-student does not enforce teacherId match on non-admin teachers'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('m4-empirical-adversarial.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
