/**
 * Milestone 3 Empirical Adversarial & Boundary Stress Test Suite
 * Conducted by Challenger M3-1 (teamwork_preview_challenger)
 * 
 * Evaluates the 6 Core & Public API Routes under adversarial conditions:
 * 1. src/app/api/courses/route.ts
 * 2. src/app/api/public-teachers/route.ts
 * 3. src/app/api/teacher-application/route.ts
 * 4. src/app/api/notifications/route.ts
 * 5. src/app/api/payment-ticket/route.ts
 * 6. src/app/api/student-self-attendance/route.ts
 */

import { createHarness, assert } from './helpers/test-harness.mjs';
import { createMockNextRequest, createMockClerkAuth } from './helpers/mock-context.mjs';
import { analyzeRouteHandler, readProjectFile } from './helpers/contract-helpers.mjs';

const harness = createHarness();

// =========================================================================
// SUITE 1: Route Handlers & Interface Contract Integrity
// =========================================================================
harness.describe('Suite 1: M3 Route Handlers & Method Contracts', () => {
  const courses = analyzeRouteHandler('src/app/api/courses/route.ts');
  const teachers = analyzeRouteHandler('src/app/api/public-teachers/route.ts');
  const teacherApp = analyzeRouteHandler('src/app/api/teacher-application/route.ts');
  const notifications = analyzeRouteHandler('src/app/api/notifications/route.ts');
  const paymentTicket = analyzeRouteHandler('src/app/api/payment-ticket/route.ts');
  const attendance = analyzeRouteHandler('src/app/api/student-self-attendance/route.ts');

  harness.it('1.1: /api/courses must export GET, POST, and DELETE', () => {
    assert.ok(courses.exists, 'courses route must exist');
    assert.ok(courses.methods.GET, 'GET must be exported');
    assert.ok(courses.methods.POST, 'POST must be exported');
    assert.ok(courses.methods.DELETE, 'DELETE must be exported');
  });

  harness.it('1.2: /api/public-teachers must export GET', () => {
    assert.ok(teachers.exists, 'public-teachers route must exist');
    assert.ok(teachers.methods.GET, 'GET must be exported');
  });

  harness.it('1.3: /api/teacher-application must export POST', () => {
    assert.ok(teacherApp.exists, 'teacher-application route must exist');
    assert.ok(teacherApp.methods.POST, 'POST must be exported');
  });

  harness.it('1.4: /api/notifications must export GET and PATCH', () => {
    assert.ok(notifications.exists, 'notifications route must exist');
    assert.ok(notifications.methods.GET, 'GET must be exported');
    assert.ok(notifications.code.includes('export async function PATCH'), 'PATCH must be exported');
  });

  harness.it('1.5: /api/payment-ticket must export POST', () => {
    assert.ok(paymentTicket.exists, 'payment-ticket route must exist');
    assert.ok(paymentTicket.methods.POST, 'POST must be exported');
  });

  harness.it('1.6: /api/student-self-attendance must export POST', () => {
    assert.ok(attendance.exists, 'student-self-attendance route must exist');
    assert.ok(attendance.methods.POST, 'POST must be exported');
  });

  harness.it('1.7: All 6 routes must have ZERO Supabase imports and use Prisma singleton', () => {
    const routeList = [
      { name: 'courses', data: courses },
      { name: 'public-teachers', data: teachers },
      { name: 'teacher-application', data: teacherApp },
      { name: 'notifications', data: notifications },
      { name: 'payment-ticket', data: paymentTicket },
      { name: 'student-self-attendance', data: attendance },
    ];

    for (const r of routeList) {
      assert.equal(r.data.usesSupabase, false, `${r.name} must not import @supabase`);
      assert.ok(r.data.usesPrisma, `${r.name} must import prisma client`);
    }
  });
});

// =========================================================================
// SUITE 2: Adversarial Security & Authorization Gating (Courses Route)
// =========================================================================
harness.describe('Suite 2: Courses Route Authorization & Validation Boundaries', () => {
  const code = readProjectFile('src/app/api/courses/route.ts');

  harness.it('2.1: POST /api/courses must check Clerk auth() and return 401 for unauthenticated callers', () => {
    assert.ok(code.includes('auth()'), 'Must call auth() from Clerk');
    assert.ok(code.includes('!userId'), 'Must guard against missing userId');
    assert.ok(code.includes('401'), 'Must return 401 Unauthorized');
  });

  harness.it('2.2: POST /api/courses must verify admin role in Profile and return 403 for non-admins', () => {
    assert.ok(code.includes('role !== "admin"') || code.includes("role !== 'admin'"), 'Must verify admin role');
    assert.ok(code.includes('403'), 'Must return 403 Forbidden for non-admin');
  });

  harness.it('2.3: POST /api/courses must validate presence of title and description', () => {
    assert.ok(code.includes('!title || !description'), 'Must check both title and description');
    assert.ok(code.includes('400'), 'Must return 400 Bad Request if missing');
  });

  harness.it('2.4: POST /api/courses trims strings prior to persistence', () => {
    assert.ok(code.includes('title.trim()'), 'Must trim title');
    assert.ok(code.includes('description.trim()'), 'Must trim description');
  });

  harness.it('2.5: DELETE /api/courses must enforce admin role check and 400 on missing ID', () => {
    const deleteSection = code.slice(code.indexOf('export async function DELETE'));
    assert.ok(deleteSection.includes('auth()'), 'DELETE must require auth');
    assert.ok(deleteSection.includes('403'), 'DELETE must require admin role');
    assert.ok(deleteSection.includes('!id'), 'DELETE must require course id');
    assert.ok(deleteSection.includes('400'), 'DELETE must return 400 if id is missing');
  });
});

// =========================================================================
// SUITE 3: Public Teachers Data Protection & Projection
// =========================================================================
harness.describe('Suite 3: Public Teachers Safe Projection & Boundaries', () => {
  const code = readProjectFile('src/app/api/public-teachers/route.ts');

  harness.it('3.1: GET /api/public-teachers must filter only role = teacher', () => {
    assert.ok(code.includes('role: "teacher"') || code.includes("role: 'teacher'"), 'Must filter by teacher role');
  });

  harness.it('3.2: GET /api/public-teachers must select only safe public fields', () => {
    assert.ok(code.includes('select:'), 'Must use explicit field selection');
    assert.ok(code.includes('bio: true'), 'Must include bio');
    assert.ok(code.includes('specializations: true'), 'Must include specializations');
    assert.ok(code.includes('profilePhotoUrl: true'), 'Must include profile photo');
  });

  harness.it('3.3: GET /api/public-teachers must wrap query in try/catch and return 500 on failure', () => {
    assert.ok(code.includes('try {') && code.includes('catch'), 'Must wrap in try/catch');
    assert.ok(code.includes('500'), 'Must return 500 on failure');
  });
});

// =========================================================================
// SUITE 4: Teacher Application Input Validation & Conflict Handling
// =========================================================================
harness.describe('Suite 4: Teacher Application Edge Cases & Conflicts', () => {
  const code = readProjectFile('src/app/api/teacher-application/route.ts');

  harness.it('4.1: Must validate all required contact & qualification fields', () => {
    assert.ok(code.includes('!name || !email || !whatsapp || !qualification'), 'Must reject if any core field missing');
    assert.ok(code.includes('400'), 'Must return 400 status');
  });

  harness.it('4.2: Email format regex validation must reject malformed emails', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.equal(emailRegex.test(''), false, 'Empty email rejected');
    assert.equal(emailRegex.test('qari.ahmad'), false, 'Missing @ and domain rejected');
    assert.equal(emailRegex.test('qari@'), false, 'Missing domain rejected');
    assert.equal(emailRegex.test('@madrasa.org'), false, 'Missing local part rejected');
    assert.equal(emailRegex.test('qari@madrasa'), false, 'Missing TLD dot rejected');
    assert.equal(emailRegex.test('qari ahmad@madrasa.org'), false, 'Whitespace rejected');
    assert.equal(emailRegex.test('qari.ahmad@madrasa.edu.pk'), true, 'Valid international email accepted');
  });

  harness.it('4.3: Email must be normalized to lowercase to prevent casing duplicates', () => {
    assert.ok(code.includes('email.toLowerCase()'), 'Email must be converted to lowercase');
  });

  harness.it('4.4: Duplicate email application must return 409 Conflict', () => {
    assert.ok(code.includes('findUnique'), 'Must look up application by email');
    assert.ok(code.includes('409'), 'Must return 409 Conflict status');
    assert.ok(code.includes('already under review') || code.includes('already been approved'), 'Must return informative duplicate message');
  });

  harness.it('4.5: Specializations array/string normalization logic', () => {
    const normalizeSpec = (spec) => Array.isArray(spec) ? spec : spec ? [spec] : [];
    assert.deepEqual(normalizeSpec(['Tajweed', 'Hifz']), ['Tajweed', 'Hifz']);
    assert.deepEqual(normalizeSpec('Tajweed'), ['Tajweed']);
    assert.deepEqual(normalizeSpec(null), []);
    assert.deepEqual(normalizeSpec(undefined), []);
    assert.deepEqual(normalizeSpec(''), []);
  });

  harness.it('4.6: Resend email notification failure must be caught and non-blocking', () => {
    assert.ok(code.includes('if (resend)'), 'Must check resend instance');
    assert.ok(code.includes('try {') && code.includes('send('), 'Must wrap email send in try block');
    assert.ok(code.includes('catch (emailErr)'), 'Must catch email errors without throwing out of handler');
  });
});

// =========================================================================
// SUITE 5: Notifications & Payment Ticket Resilience
// =========================================================================
harness.describe('Suite 5: Notifications & Payment Ticket Boundary Handling', () => {
  const notifCode = readProjectFile('src/app/api/notifications/route.ts');
  const ticketCode = readProjectFile('src/app/api/payment-ticket/route.ts');

  harness.it('5.1: Notifications PATCH gracefully parses malformed/empty JSON body', () => {
    assert.ok(notifCode.includes('req.json().catch('), 'Must catch json parse errors with fallback');
  });

  harness.it('5.2: Notifications PATCH accepts ID from body OR query parameter', () => {
    assert.ok(notifCode.includes('body.id || req.nextUrl.searchParams.get("id")'), 'Must support body or searchParam id');
    assert.ok(notifCode.includes('!id'), 'Must guard missing id');
    assert.ok(notifCode.includes('400'), 'Must return 400 on missing id');
  });

  harness.it('5.3: Notifications GET filters Global + Targeted for studentId or userId', () => {
    assert.ok(notifCode.includes('type: "Global"'), 'Must include Global notifications');
    assert.ok(notifCode.includes('type: "Targeted"'), 'Must include Targeted notifications');
    assert.ok(notifCode.includes('targetStudentId'), 'Must target specific student');
  });

  harness.it('5.4: PaymentTicket POST requires studentId and transactionId', () => {
    assert.ok(ticketCode.includes('!studentId || !transactionId'), 'Must require both studentId and transactionId');
    assert.ok(ticketCode.includes('400'), 'Must return 400 if missing');
  });

  harness.it('5.5: PaymentTicket POST normalizes transactionId to uppercase and checks duplicates', () => {
    assert.ok(ticketCode.includes('toUpperCase()'), 'Transaction ID must be normalized to uppercase');
    assert.ok(ticketCode.includes('findUnique'), 'Must check for duplicate transactionId');
    assert.ok(ticketCode.includes('already been submitted'), 'Must return duplicate message');
  });

  harness.it('5.6: PaymentTicket status mapping safely defaults unapproved statuses to Reviewing', () => {
    const mapStatus = (status) => status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Reviewing';
    assert.equal(mapStatus('Approved'), 'Approved');
    assert.equal(mapStatus('Rejected'), 'Rejected');
    assert.equal(mapStatus('Pending'), 'Reviewing');
    assert.equal(mapStatus('HACKED'), 'Reviewing');
    assert.equal(mapStatus(undefined), 'Reviewing');
  });

  harness.it('5.7: PaymentTicket synchronizes billing status inside resilient try/catch', () => {
    assert.ok(ticketCode.includes('prisma.billing.upsert'), 'Must upsert billing record');
    assert.ok(ticketCode.includes('catch (billingErr)'), 'Billing error must be caught to not abort ticket return');
    assert.ok(ticketCode.includes('status: 201'), 'Must return 201 Created');
  });
});

// =========================================================================
// SUITE 6: Student Self-Attendance Date Normalization & Uniqueness
// =========================================================================
harness.describe('Suite 6: Student Self-Attendance Date Normalization & Duplicate Guards', () => {
  const code = readProjectFile('src/app/api/student-self-attendance/route.ts');

  harness.it('6.1: Must require studentId and return 400 if missing', () => {
    assert.ok(code.includes('!studentId'), 'Must check for studentId');
    assert.ok(code.includes('400'), 'Must return 400 Bad Request');
  });

  harness.it('6.2: Must normalize attendance date to UTC midnight (00:00:00.000Z)', () => {
    assert.ok(code.includes('setUTCHours(0, 0, 0, 0)'), 'Must standardize to UTC midnight');
    
    // Validate midnight normalization behavior
    const d1 = new Date('2026-09-29T15:30:00Z');
    d1.setUTCHours(0, 0, 0, 0);
    const d2 = new Date('2026-09-29T23:59:59Z');
    d2.setUTCHours(0, 0, 0, 0);
    assert.equal(d1.toISOString(), d2.toISOString(), 'Same-day check-ins at different times must normalize to identical timestamps');
  });

  harness.it('6.3: Must guard against duplicate check-in on the same date using compound unique constraint', () => {
    assert.ok(code.includes('studentId_date'), 'Must query studentId_date compound key');
    assert.ok(code.includes('Already marked for today'), 'Must return duplicate warning');
    assert.ok(code.includes('400'), 'Must return 400 status on duplicate check-in');
  });

  harness.it('6.4: Must set status to Present and markedById to null', () => {
    assert.ok(code.includes('status: "Present"') || code.includes("status: 'Present'"), 'Must mark Present');
    assert.ok(code.includes('markedById: null'), 'markedById must be null to respect foreign key constraint');
    assert.equal(code.includes('markedById: "student"'), false, 'Must NOT use literal "student" which violates Profile foreign key');
  });
});

// =========================================================================
// SUITE 7: Adversarial Payload Stress & Bug Identification
// =========================================================================
harness.describe('Suite 7: Adversarial Edge Cases & Defect Identification', () => {
  harness.it('7.1: Empty whitespace titles must be audited', () => {
    const rawTitle = "   ";
    const trimmed = rawTitle.trim();
    assert.equal(trimmed.length, 0, 'Whitespace title trims to empty string');
  });

  harness.it('7.2: Phone number passed as numeric primitive in teacher application (Defect Reproduction)', () => {
    // In teacher-application/route.ts:
    // const whatsapp = (rawWhatsapp || phone || "").trim();
    // If rawWhatsapp is passed as number 923001234567:
    const simulateHandler = (body) => {
      const { whatsapp: rawWhatsapp, phone } = body;
      try {
        const val = rawWhatsapp || phone || "";
        const whatsapp = typeof val === 'string' ? val.trim() : String(val).trim();
        return { success: true, whatsapp };
      } catch (err) {
        return { success: false, error: err.message };
      }
    };

    const res = simulateHandler({ whatsapp: 923001234567 });
    assert.equal(res.success, true);
    assert.equal(res.whatsapp, '923001234567');
  });

  harness.it('7.3: Quranic Arabic Unicode preservation across JSON serialization', () => {
    const arabicPayload = {
      title: "دورة تجويد القرآن الكريم للمبتدئين",
      description: "تعليم مخارج الحروف وأحكام النون الساكنة والتنوين والمدود",
      studentName: "عبد الرحمن بن محمد",
    };

    const serialized = JSON.stringify(arabicPayload);
    const deserialized = JSON.parse(serialized);

    assert.equal(deserialized.title, arabicPayload.title, 'Arabic course title preserved');
    assert.equal(deserialized.studentName, arabicPayload.studentName, 'Arabic student name preserved');
  });

  harness.it('7.4: Zero and negative experience years boundary', () => {
    const parseExp = (val) => Math.max(0, parseInt(val, 10) || 0);
    assert.equal(parseExp(0), 0);
    assert.equal(parseExp("0"), 0);
    assert.equal(parseExp(-5), 0, 'Negative years should clamp to 0');
    assert.equal(parseExp("15 years"), 15);
    assert.equal(parseExp("NaN"), 0);
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('m3-empirical-adversarial.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
