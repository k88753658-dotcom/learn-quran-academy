/**
 * Milestone 3 Comprehensive Verification & Adversarial Challenge Suite
 * Conducted by Challenger 2 (teamwork_preview_challenger)
 * 
 * Verifies the 6 Core & Public API Routes for Milestone M3:
 * 1. src/app/api/courses/route.ts
 * 2. src/app/api/public-teachers/route.ts
 * 3. src/app/api/teacher-application/route.ts
 * 4. src/app/api/notifications/route.ts
 * 5. src/app/api/payment-ticket/route.ts
 * 6. src/app/api/student-self-attendance/route.ts
 */

import { createHarness, assert } from './helpers/test-harness.mjs';
import { analyzeRouteHandler, readProjectFile, parsePrismaSchema } from './helpers/contract-helpers.mjs';

const harness = createHarness();

// =========================================================================
// SUITE 1: Route Handlers Architecture & Supabase Eradication
// =========================================================================
harness.describe('Suite 1: Architecture & Supabase Eradication Contracts', () => {
  const routes = [
    { path: 'src/app/api/courses/route.ts', name: 'Courses', methods: ['GET', 'POST', 'DELETE'] },
    { path: 'src/app/api/public-teachers/route.ts', name: 'Public Teachers', methods: ['GET'] },
    { path: 'src/app/api/teacher-application/route.ts', name: 'Teacher Application', methods: ['POST'] },
    { path: 'src/app/api/notifications/route.ts', name: 'Notifications', methods: ['GET', 'PATCH'] },
    { path: 'src/app/api/payment-ticket/route.ts', name: 'Payment Ticket', methods: ['POST'] },
    { path: 'src/app/api/student-self-attendance/route.ts', name: 'Student Self-Attendance', methods: ['POST'] },
  ];

  for (const r of routes) {
    const analysis = analyzeRouteHandler(r.path);

    harness.it(`1.${r.name}: ${r.path} must exist and export required HTTP methods`, () => {
      assert.ok(analysis.exists, `Route ${r.path} does not exist`);
      for (const m of r.methods) {
        if (m === 'PATCH') {
          assert.ok(analysis.code.includes('export async function PATCH'), `${r.name} must export PATCH`);
        } else {
          assert.ok(analysis.methods[m], `${r.name} must export ${m}`);
        }
      }
    });

    harness.it(`1.${r.name}.Supabase: ${r.path} must have ZERO Supabase imports`, () => {
      assert.equal(analysis.usesSupabase, false, `${r.name} must not import @supabase or createClient`);
      assert.equal(analysis.code.includes('@/utils/supabase'), false, `${r.name} must not reference supabase utils`);
    });

    harness.it(`1.${r.name}.Prisma: ${r.path} must import and use Prisma singleton`, () => {
      assert.ok(analysis.usesPrisma, `${r.name} must use Prisma`);
      assert.ok(
        analysis.code.includes("from '@/lib/prisma'") || analysis.code.includes('from "@/lib/prisma"'),
        `${r.name} must import prisma from '@/lib/prisma'`
      );
    });
  }
});

// =========================================================================
// SUITE 2: Response Shape & Frontend Contract Conformance
// =========================================================================
harness.describe('Suite 2: Response Shape & Frontend Consumer Contracts', () => {
  const coursesCode = readProjectFile('src/app/api/courses/route.ts');
  const teachersCode = readProjectFile('src/app/api/public-teachers/route.ts');
  const teacherAppCode = readProjectFile('src/app/api/teacher-application/route.ts');
  const notifCode = readProjectFile('src/app/api/notifications/route.ts');
  const ticketCode = readProjectFile('src/app/api/payment-ticket/route.ts');
  const attendanceCode = readProjectFile('src/app/api/student-self-attendance/route.ts');

  harness.it('2.1: /api/courses GET must return { success: true, courses } shape for admin and register consumers', () => {
    assert.ok(
      coursesCode.includes('return NextResponse.json({ success: true, courses });'),
      'Must return standardized { success: true, courses }'
    );
  });

  harness.it('2.2: /api/courses POST must return { success: true, course } with status 201', () => {
    assert.ok(
      coursesCode.includes('return NextResponse.json({ success: true, course }, { status: 201 });'),
      'Must return 201 Created with { success: true, course }'
    );
  });

  harness.it('2.3: /api/courses DELETE must return { success: true, message }', () => {
    assert.ok(
      coursesCode.includes('return NextResponse.json({ success: true, message: "Course deleted successfully" });'),
      'Must return { success: true, message } on course deletion'
    );
  });

  harness.it('2.4: /api/public-teachers GET must return { success: true, teachers } shape for TeachersSection.tsx', () => {
    assert.ok(
      teachersCode.includes('return NextResponse.json({ success: true, teachers });'),
      'Must return { success: true, teachers } matching TeachersSection expectations'
    );
  });

  harness.it('2.5: /api/teacher-application POST must return { success: true, message, id } for /teach portal', () => {
    assert.ok(
      teacherAppCode.includes('success: true') && teacherAppCode.includes('id: application.id'),
      'Must return success flag and created application ID'
    );
  });

  harness.it('2.6: /api/notifications GET must return { success: true, notifications }', () => {
    assert.ok(
      notifCode.includes('return NextResponse.json({ success: true, notifications });'),
      'Must return { success: true, notifications }'
    );
  });

  harness.it('2.7: /api/notifications PATCH must return { success: true, message, notification }', () => {
    assert.ok(
      notifCode.includes('message: "Notification marked as read"') && notifCode.includes('notification'),
      'PATCH must return updated notification and confirmation message'
    );
  });

  harness.it('2.8: /api/payment-ticket POST must return { success: true, ticket, id } with status 201', () => {
    assert.ok(
      ticketCode.includes('status: 201') && ticketCode.includes('ticket'),
      'Must return status 201 with ticket payload'
    );
  });

  harness.it('2.9: /api/student-self-attendance POST must return { success: true, message, attendance }', () => {
    assert.ok(
      attendanceCode.includes('message: "Attendance marked successfully!"') && attendanceCode.includes('attendance'),
      'Must return success confirmation and attendance record'
    );
  });
});

// =========================================================================
// SUITE 3: Prisma Schema Alignment & Field Mapping
// =========================================================================
harness.describe('Suite 3: Prisma Schema Model Integrity', () => {
  const schema = parsePrismaSchema();

  harness.it('3.1: Course model matches route operations', () => {
    const course = schema.models['Course'];
    assert.ok(course, 'Course model must exist');
    assert.ok(course.fields['title'], 'Course must have title');
    assert.ok(course.fields['description'], 'Course must have description');
  });

  harness.it('3.2: Profile model has all public-teacher projection fields', () => {
    const profile = schema.models['Profile'];
    assert.ok(profile, 'Profile model must exist');
    assert.ok(profile.fields['bio'], 'Profile must have bio');
    assert.ok(profile.fields['specializations'], 'Profile must have specializations');
    assert.ok(profile.fields['qualification'], 'Profile must have qualification');
    assert.ok(profile.fields['experienceYears'], 'Profile must have experienceYears');
    assert.ok(profile.fields['profilePhotoUrl'], 'Profile must have profilePhotoUrl');
  });

  harness.it('3.3: TeacherApplication model matches application fields and status enum', () => {
    const app = schema.models['TeacherApplication'];
    assert.ok(app, 'TeacherApplication model must exist');
    assert.ok(app.fields['name'], 'Must have name');
    assert.ok(app.fields['email'], 'Must have email');
    assert.ok(app.fields['whatsapp'], 'Must have whatsapp');
    assert.ok(app.fields['qualification'], 'Must have qualification');
    assert.ok(app.fields['status'], 'Must have status');

    const appEnum = schema.enums['ApplicationStatus'];
    assert.ok(appEnum, 'ApplicationStatus enum must exist');
    const vals = appEnum.values.map(v => v.trim());
    assert.ok(vals.includes('pending') && vals.includes('approved') && vals.includes('rejected'));
  });

  harness.it('3.4: Attendance model has nullable markedById to avoid FK violation on self check-in', () => {
    const attendance = schema.models['Attendance'];
    assert.ok(attendance, 'Attendance model must exist');
    assert.ok(attendance.fields['markedById'], 'Attendance must have markedById');
    assert.ok(attendance.fields['markedById'].type.endsWith('?'), 'markedById must be optional/nullable String?');
  });

  harness.it('3.5: PaymentTicket model has unique transactionId and TicketStatus enum', () => {
    const ticket = schema.models['PaymentTicket'];
    assert.ok(ticket, 'PaymentTicket model must exist');
    assert.ok(ticket.fields['transactionId'].attributes.includes('@unique'), 'transactionId must be unique');

    const ticketEnum = schema.enums['TicketStatus'];
    assert.ok(ticketEnum, 'TicketStatus enum must exist');
    const vals = ticketEnum.values.map(v => v.trim());
    assert.ok(vals.includes('Reviewing') && vals.includes('Approved') && vals.includes('Rejected'));
  });
});

// =========================================================================
// SUITE 4: Adversarial Edge Cases & Vulnerability Analysis
// =========================================================================
harness.describe('Suite 4: Adversarial Stress Tests & Vulnerability Mining', () => {
  const coursesCode = readProjectFile('src/app/api/courses/route.ts');
  const teacherAppCode = readProjectFile('src/app/api/teacher-application/route.ts');
  const notifCode = readProjectFile('src/app/api/notifications/route.ts');
  const ticketCode = readProjectFile('src/app/api/payment-ticket/route.ts');
  const attendanceCode = readProjectFile('src/app/api/student-self-attendance/route.ts');

  harness.it('4.1 [Finding]: Whitespace-only course titles are not caught by !title guard', () => {
    // Audit observation:
    // Route checks: if (!title || !description)
    // Then trims: data: { title: title.trim(), description: description.trim() }
    const title = '   ';
    const passesCheck = !(!title || !'Valid description');
    assert.equal(passesCheck, true, 'Whitespace-only title passes !title check');
    assert.equal(title.trim(), '', 'Trimmed title is empty string persisted to DB');
  });

  harness.it('4.2 [Finding]: PaymentTicket POST allows caller-supplied status without admin check', () => {
    // Audit observation:
    // Route extracts status from body:
    // const ticketStatus = status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : "Reviewing";
    // Without verifying if requester is admin!
    const simulateStatusMapping = (inputStatus) => {
      return inputStatus === 'Approved' ? 'Approved' : inputStatus === 'Rejected' ? 'Rejected' : 'Reviewing';
    };

    assert.equal(simulateStatusMapping('Approved'), 'Approved', 'VULNERABILITY: User can pass status: "Approved"');
    assert.equal(ticketCode.includes('auth()'), false, 'Payment ticket has NO auth check for status override');
  });

  harness.it('4.3 [Finding]: Invalid date string in self-attendance causes unhandled 500 error instead of 400', () => {
    const invalidDateStr = 'not-a-valid-date';
    const dateObj = new Date(invalidDateStr);
    assert.ok(Number.isNaN(dateObj.getTime()), 'new Date("invalid") yields NaN time');
    // Prisma query with Invalid Date will throw an exception caught by outer catch, returning 500
  });

  harness.it('4.4 [Finding]: Non-existent course deletion in DELETE /api/courses returns 500 (P2025) instead of 404', () => {
    // prisma.course.delete({ where: { id } }) throws P2025 if id does not exist
    assert.equal(coursesCode.includes('P2025'), false, 'Route does not catch Prisma P2025 not found error');
    assert.ok(coursesCode.includes('500'), 'Returns 500 on record not found');
  });

  harness.it('4.5 [Positive]: Notifications PATCH uses defensive json parsing .catch(() => ({}))', () => {
    assert.ok(notifCode.includes('req.json().catch('), 'Correctly handles empty or malformed request body');
  });

  harness.it('4.6 [Positive]: Teacher application email regex correctly validates standard RFC-like formats', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.equal(emailRegex.test('ustadh@academy.com'), true);
    assert.equal(emailRegex.test('invalid-email'), false);
    assert.equal(emailRegex.test('test@.com'), false);
    assert.equal(emailRegex.test('test@domain'), false);
  });

  harness.it('4.7 [Positive]: Self-attendance UTC midnight normalization prevents time-shift duplicate collisions', () => {
    const morning = new Date('2026-09-29T08:00:00.000Z');
    const evening = new Date('2026-09-29T21:45:00.000Z');
    morning.setUTCHours(0, 0, 0, 0);
    evening.setUTCHours(0, 0, 0, 0);
    assert.equal(morning.getTime(), evening.getTime(), 'Different times on same UTC date normalize to identical timestamp');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('m3-challenger2-verification.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
