/**
 * Milestone 1 Empirical Stress & Challenge Test Suite
 * Conducted by Challenger M1-1 (teamwork_preview_challenger)
 * 
 * Verifies live Neon DB PostgreSQL connection and Prisma schema across:
 * 1. Multi-Model CRUD & Relational Lifecycle
 * 2. Edge Conditions & Unique / Compound Key Constraints
 * 3. Enums, Nullables & Schema Default Values
 * 4. Referential Integrity (Cascade Delete & SetNull)
 * 5. Query Filtering & Data Cleanup Verification
 */

import fs from 'node:fs';
import { PrismaClient, UserRole, BillingStatus, AttendanceStatus, NotificationType, TicketStatus, ApplicationStatus } from '@prisma/client';
import { createHarness, assert } from './helpers/test-harness.mjs';

// Load environment variables if not present
if (!process.env.DATABASE_URL) {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment or .env.local');
  process.exit(1);
}

const prisma = new PrismaClient();
const harness = createHarness();

const RUN_ID = `test_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

// Test tracking IDs to guarantee cleanup
const createdIds = {
  courseIds: [],
  teacherAppIds: [],
  notificationIds: [],
  profileIds: [],
  studentIds: [],
  billingIds: [],
  attendanceIds: [],
  ticketIds: [],
};

harness.describe('Suite 1: Live Neon DB Multi-Model CRUD & Relational Lifecycle', () => {
  harness.it('1.1: Live connection sanity & latency', async () => {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as connected`;
    const latency = Date.now() - start;
    assert.ok(latency < 10000, `Neon connection latency acceptable (${latency}ms)`);
  });

  harness.it('1.2: Course model CRUD lifecycle with rich data', async () => {
    const course = await prisma.course.create({
      data: {
        title: `Advanced Tajweed & Qiraat - ${RUN_ID}`,
        description: 'Comprehensive Quranic recitation and rules of Tajweed with live teacher evaluation.',
      },
    });
    createdIds.courseIds.push(course.id);

    assert.ok(course.id, 'Course ID must be generated');
    assert.equal(course.title, `Advanced Tajweed & Qiraat - ${RUN_ID}`);

    // Update
    const updated = await prisma.course.update({
      where: { id: course.id },
      data: { description: 'Updated Tajweed syllabus description.' },
    });
    assert.equal(updated.description, 'Updated Tajweed syllabus description.');

    // Query back
    const fetched = await prisma.course.findUnique({ where: { id: course.id } });
    assert.ok(fetched);
    assert.equal(fetched.description, 'Updated Tajweed syllabus description.');
  });

  harness.it('1.3: TeacherApplication model CRUD and status lifecycle', async () => {
    const app = await prisma.teacherApplication.create({
      data: {
        name: `Qari Ahmad ${RUN_ID}`,
        email: `qari.ahmad.${RUN_ID}@example.com`,
        whatsapp: '+923001234567',
        country: 'Pakistan',
        qualification: 'Shahadat-ul-Aalamia (Wifaq-ul-Madaris)',
        specializations: ['Tajweed', 'Hifz', 'Tafseer'],
        experienceYears: 7,
        bio: 'Certified Quranic teacher with 7 years of online and classroom experience.',
        status: ApplicationStatus.pending,
      },
    });
    createdIds.teacherAppIds.push(app.id);

    assert.ok(app.id);
    assert.equal(app.status, 'pending');
    assert.deepEqual(app.specializations, ['Tajweed', 'Hifz', 'Tafseer']);
    assert.equal(app.experienceYears, 7);

    // Filter query by status
    const pendingApps = await prisma.teacherApplication.findMany({
      where: { email: app.email, status: 'pending' },
    });
    assert.equal(pendingApps.length, 1);
    assert.equal(pendingApps[0].id, app.id);

    // Update status to approved with admin notes
    const approvedApp = await prisma.teacherApplication.update({
      where: { id: app.id },
      data: {
        status: ApplicationStatus.approved,
        adminNotes: 'Interview cleared with distinction. Assigned to Tajweed department.',
      },
    });
    assert.equal(approvedApp.status, 'approved');
    assert.equal(approvedApp.adminNotes, 'Interview cleared with distinction. Assigned to Tajweed department.');
  });

  harness.it('1.4: Notification model with Global & Targeted variants', async () => {
    // 1. Global notification
    const globalNote = await prisma.notification.create({
      data: {
        title: `Academy Announcement ${RUN_ID}`,
        text: 'Ramadan schedule adjustments will take effect next week.',
        type: NotificationType.Global,
        publisherRole: 'admin',
        isActive: true,
      },
    });
    createdIds.notificationIds.push(globalNote.id);

    assert.ok(globalNote.id);
    assert.equal(globalNote.type, 'Global');
    assert.equal(globalNote.isActive, true);

    // Query filter by active and Global
    const activeGlobals = await prisma.notification.findMany({
      where: { id: globalNote.id, isActive: true, type: 'Global' },
    });
    assert.equal(activeGlobals.length, 1);
    assert.equal(activeGlobals[0].title, globalNote.title);
  });

  harness.it('1.5: Profile & Student cross-model relational hierarchy', async () => {
    // Create Teacher Profile (simulating Clerk user ID)
    const teacherId = `user_teacher_${RUN_ID}`;
    const teacherProfile = await prisma.profile.create({
      data: {
        id: teacherId,
        name: `Ustadha Fatima ${RUN_ID}`,
        email: `fatima.${RUN_ID}@academy.org`,
        role: UserRole.teacher,
        whatsapp: '+923119876543',
        specializations: ['Noorani Qaida', 'Tajweed'],
        experienceYears: 5,
        isProfileComplete: true,
      },
    });
    createdIds.profileIds.push(teacherProfile.id);

    // Create Student Profile
    const studentProfileId = `user_student_${RUN_ID}`;
    const studentProfile = await prisma.profile.create({
      data: {
        id: studentProfileId,
        name: `Student Bilal ${RUN_ID}`,
        email: `bilal.${RUN_ID}@student.org`,
        role: UserRole.student,
      },
    });
    createdIds.profileIds.push(studentProfile.id);

    // Create Student record linked to student Profile and assigned to teacher Profile
    const student = await prisma.student.create({
      data: {
        profileId: studentProfile.id,
        teacherId: teacherProfile.id,
        studentName: `Bilal Khan ${RUN_ID}`,
        parentName: 'Tariq Khan',
        course: 'Nazra Quran with Tajweed',
        enrolled: true,
        progress: 35,
        liveClassroomLink: 'https://meet.google.com/abc-defg-hij',
      },
      include: {
        profile: true,
        teacher: true,
      },
    });
    createdIds.studentIds.push(student.id);

    assert.ok(student.id);
    assert.equal(student.profile?.email, studentProfile.email);
    assert.equal(student.teacher?.name, teacherProfile.name);
    assert.equal(student.progress, 35);
    assert.equal(student.enrolled, true);

    // Create Billing record linked to Student
    const billing = await prisma.billing.create({
      data: {
        studentId: student.id,
        amountDue: '3500 PKR',
        status: BillingStatus.Pending,
      },
    });
    createdIds.billingIds.push(billing.id);
    assert.equal(billing.amountDue, '3500 PKR');
    assert.equal(billing.status, 'Pending');

    // Create PaymentTicket linked to Student
    const txId = `TX_${RUN_ID}_001`;
    const ticket = await prisma.paymentTicket.create({
      data: {
        studentId: student.id,
        transactionId: txId,
        methodUsed: 'EasyPaisa',
        status: TicketStatus.Reviewing,
      },
    });
    createdIds.ticketIds.push(ticket.id);
    assert.equal(ticket.transactionId, txId);
    assert.equal(ticket.status, 'Reviewing');

    // Create Attendance record marked by teacher
    const testDate = new Date('2026-09-29T00:00:00.000Z');
    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        date: testDate,
        status: AttendanceStatus.Present,
        markedById: teacherProfile.id,
      },
      include: {
        markedBy: true,
      },
    });
    createdIds.attendanceIds.push(attendance.id);
    assert.equal(attendance.status, 'Present');
    assert.equal(attendance.markedBy?.id, teacherProfile.id);

    // Create Targeted Notification for student
    const targetedNote = await prisma.notification.create({
      data: {
        title: 'Upcoming Assessment Reminder',
        text: 'Surah Al-Mulk recitation test tomorrow.',
        type: NotificationType.Targeted,
        targetStudentId: student.id,
        publisherRole: 'teacher',
        isActive: true,
      },
    });
    createdIds.notificationIds.push(targetedNote.id);
    assert.equal(targetedNote.targetStudentId, student.id);
  });
});

harness.describe('Suite 2: Edge Conditions, Integrity Boundaries & Constraints', () => {
  harness.it('2.1: Duplicate Key Constraint - Profile.email must reject duplicates (P2002)', async () => {
    const dupEmail = `dup.profile.${RUN_ID}@example.com`;
    const p1 = await prisma.profile.create({
      data: {
        id: `user_dup_1_${RUN_ID}`,
        name: 'First User',
        email: dupEmail,
      },
    });
    createdIds.profileIds.push(p1.id);

    let failedAsExpected = false;
    try {
      await prisma.profile.create({
        data: {
          id: `user_dup_2_${RUN_ID}`,
          name: 'Duplicate Email User',
          email: dupEmail,
        },
      });
    } catch (err) {
      failedAsExpected = true;
      assert.ok(
        err.code === 'P2002' || err.message.includes('unique constraint') || err.message.includes('Unique constraint'),
        `Expected P2002 unique constraint error, received: ${err.message}`
      );
    }
    assert.ok(failedAsExpected, 'Database must reject duplicate Profile.email with unique violation');
  });

  harness.it('2.2: Duplicate Key Constraint - TeacherApplication.email must reject duplicates (P2002)', async () => {
    const dupAppEmail = `dup.teacher.${RUN_ID}@example.com`;
    const app1 = await prisma.teacherApplication.create({
      data: {
        name: 'Applicant 1',
        email: dupAppEmail,
        whatsapp: '+923000000001',
        qualification: 'MA Islamic Studies',
      },
    });
    createdIds.teacherAppIds.push(app1.id);

    let failedAsExpected = false;
    try {
      await prisma.teacherApplication.create({
        data: {
          name: 'Applicant 2',
          email: dupAppEmail,
          whatsapp: '+923000000002',
          qualification: 'Alim Course',
        },
      });
    } catch (err) {
      failedAsExpected = true;
      assert.ok(
        err.code === 'P2002' || err.message.includes('unique constraint'),
        `Expected P2002 for duplicate teacher application email, received: ${err.message}`
      );
    }
    assert.ok(failedAsExpected, 'Database must reject duplicate TeacherApplication.email');
  });

  harness.it('2.3: Duplicate Key Constraint - PaymentTicket.transactionId must reject duplicates (P2002)', async () => {
    // Need a temporary student
    const student = await prisma.student.create({
      data: {
        studentName: `Tx Test Student ${RUN_ID}`,
      },
    });
    createdIds.studentIds.push(student.id);

    const dupTxId = `TX_DUP_${RUN_ID}`;
    const t1 = await prisma.paymentTicket.create({
      data: {
        studentId: student.id,
        transactionId: dupTxId,
        methodUsed: 'JazzCash',
      },
    });
    createdIds.ticketIds.push(t1.id);

    let failedAsExpected = false;
    try {
      await prisma.paymentTicket.create({
        data: {
          studentId: student.id,
          transactionId: dupTxId,
          methodUsed: 'Bank Transfer',
        },
      });
    } catch (err) {
      failedAsExpected = true;
      assert.ok(
        err.code === 'P2002' || err.message.includes('unique constraint'),
        `Expected P2002 for duplicate transaction ID, received: ${err.message}`
      );
    }
    assert.ok(failedAsExpected, 'Database must reject duplicate PaymentTicket.transactionId');
  });

  harness.it('2.4: Compound Unique Constraint - Attendance [studentId, date] must reject duplicates (P2002)', async () => {
    const student = await prisma.student.create({
      data: {
        studentName: `Attendance Compound Student ${RUN_ID}`,
      },
    });
    createdIds.studentIds.push(student.id);

    const sessionDate = new Date('2026-09-28T00:00:00.000Z');
    const a1 = await prisma.attendance.create({
      data: {
        studentId: student.id,
        date: sessionDate,
        status: AttendanceStatus.Present,
      },
    });
    createdIds.attendanceIds.push(a1.id);

    let failedAsExpected = false;
    try {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          date: sessionDate,
          status: AttendanceStatus.Late,
        },
      });
    } catch (err) {
      failedAsExpected = true;
      assert.ok(
        err.code === 'P2002' || err.message.includes('unique constraint'),
        `Expected P2002 for compound [studentId, date] collision, received: ${err.message}`
      );
    }
    assert.ok(failedAsExpected, 'Database must reject duplicate attendance on identical date for same student');
  });

  harness.it('2.5: One-to-One Unique Constraint - Billing.studentId (@unique) must reject second billing', async () => {
    const student = await prisma.student.create({
      data: {
        studentName: `Billing Student ${RUN_ID}`,
      },
    });
    createdIds.studentIds.push(student.id);

    const b1 = await prisma.billing.create({
      data: {
        studentId: student.id,
        amountDue: '3000 PKR',
      },
    });
    createdIds.billingIds.push(b1.id);

    let failedAsExpected = false;
    try {
      await prisma.billing.create({
        data: {
          studentId: student.id,
          amountDue: '4000 PKR',
        },
      });
    } catch (err) {
      failedAsExpected = true;
      assert.ok(
        err.code === 'P2002' || err.message.includes('unique constraint'),
        `Expected P2002 on duplicate 1:1 billing.studentId, received: ${err.message}`
      );
    }
    assert.ok(failedAsExpected, 'Database must enforce 1:1 relationship on Billing.studentId');
  });

  harness.it('2.6: Schema Defaults & Nullable Field Tolerances', async () => {
    // 1. Profile defaults & nullables
    const prof = await prisma.profile.create({
      data: {
        id: `user_defaults_${RUN_ID}`,
        name: 'Default Test Profile',
        email: `defaults.${RUN_ID}@academy.org`,
      },
    });
    createdIds.profileIds.push(prof.id);

    assert.equal(prof.role, UserRole.student, 'Profile.role should default to student');
    assert.equal(prof.isProfileComplete, false, 'isProfileComplete should default to false');
    assert.equal(prof.experienceYears, 0, 'experienceYears should default to 0');
    assert.deepEqual(prof.specializations, [], 'specializations should default to empty array');
    assert.equal(prof.whatsapp, null, 'whatsapp should be nullable');
    assert.equal(prof.bio, null, 'bio should be nullable');
    assert.equal(prof.profilePhotoUrl, null, 'profilePhotoUrl should be nullable');

    // 2. Student defaults & nullables
    const stu = await prisma.student.create({
      data: {
        studentName: 'Minimal Student',
      },
    });
    createdIds.studentIds.push(stu.id);

    assert.equal(stu.enrolled, false, 'enrolled should default to false');
    assert.equal(stu.progress, 0, 'progress should default to 0');
    assert.equal(stu.parentName, null, 'parentName should be nullable');
    assert.equal(stu.course, null, 'course should be nullable');
    assert.equal(stu.teacherId, null, 'teacherId should be nullable');
    assert.equal(stu.liveClassroomLink, null, 'liveClassroomLink should be nullable');

    // 3. Billing defaults
    const bill = await prisma.billing.create({
      data: {
        studentId: stu.id,
      },
    });
    createdIds.billingIds.push(bill.id);
    assert.equal(bill.amountDue, '3000 PKR', 'amountDue should default to 3000 PKR');
    assert.equal(bill.status, BillingStatus.Pending, 'status should default to Pending');
    assert.equal(bill.lastPaymentDate, null, 'lastPaymentDate should be nullable');

    // 4. TeacherApplication defaults
    const app = await prisma.teacherApplication.create({
      data: {
        name: 'Defaults Applicant',
        email: `app.defaults.${RUN_ID}@example.com`,
        whatsapp: '+923331112233',
        qualification: 'Bachelors in Arabic',
      },
    });
    createdIds.teacherAppIds.push(app.id);
    assert.equal(app.status, ApplicationStatus.pending, 'status should default to pending');
    assert.equal(app.experienceYears, 0, 'experienceYears should default to 0');
    assert.equal(app.country, null, 'country should be nullable');
    assert.equal(app.adminNotes, null, 'adminNotes should be nullable');
  });

  harness.it('2.7: Enum Constraints Rejection on Invalid Literals', async () => {
    let failedInvalidRole = false;
    try {
      await prisma.$executeRaw`
        INSERT INTO "profiles" (id, name, email, role, updated_at)
        VALUES (${`user_bad_enum_${RUN_ID}`}, 'Bad Role', ${`bad_role.${RUN_ID}@test.com`}, 'superadmin'::"UserRole", NOW())
      `;
    } catch (err) {
      failedInvalidRole = true;
      assert.ok(
        err.message.includes('invalid input value for enum') || err.message.includes('type "UserRole"'),
        `Expected enum rejection from Postgres, received: ${err.message}`
      );
    }
    assert.ok(failedInvalidRole, 'Postgres must reject invalid enum literal "superadmin" for UserRole');

    let failedInvalidBilling = false;
    try {
      await prisma.$executeRaw`
        INSERT INTO "billing" (id, student_id, amount_due, status, updated_at)
        VALUES (gen_random_uuid(), gen_random_uuid(), '3000 PKR', 'Refunded'::"BillingStatus", NOW())
      `;
    } catch (err) {
      failedInvalidBilling = true;
      assert.ok(
        err.message.includes('invalid input value for enum') || err.message.includes('type "BillingStatus"'),
        `Expected enum rejection for BillingStatus, received: ${err.message}`
      );
    }
    assert.ok(failedInvalidBilling, 'Postgres must reject invalid enum literal "Refunded" for BillingStatus');
  });
});

harness.describe('Suite 3: Foreign Key Cascades & Referential Integrity', () => {
  harness.it('3.1: Cascade deletion - Deleting Student cascades to Billing, Attendance, PaymentTicket, Targeted Notifications', async () => {
    // Setup isolated student hierarchy
    const stu = await prisma.student.create({
      data: {
        studentName: `Cascade Subject ${RUN_ID}`,
      },
    });
    const stuId = stu.id;

    // Create child billing
    const bill = await prisma.billing.create({
      data: { studentId: stuId, amountDue: '2500 PKR' },
    });

    // Create child attendance
    const att = await prisma.attendance.create({
      data: { studentId: stuId, date: new Date('2026-09-27T00:00:00.000Z'), status: AttendanceStatus.Present },
    });

    // Create child payment ticket
    const ticket = await prisma.paymentTicket.create({
      data: { studentId: stuId, transactionId: `TX_CASCADE_${RUN_ID}`, methodUsed: 'Bank Transfer' },
    });

    // Create child targeted notification
    const note = await prisma.notification.create({
      data: {
        title: 'Cascade Note',
        text: 'Should vanish on student deletion',
        type: NotificationType.Targeted,
        targetStudentId: stuId,
        publisherRole: 'admin',
      },
    });

    // Verify children exist
    assert.ok(await prisma.billing.findUnique({ where: { id: bill.id } }));
    assert.ok(await prisma.attendance.findUnique({ where: { id: att.id } }));
    assert.ok(await prisma.paymentTicket.findUnique({ where: { id: ticket.id } }));
    assert.ok(await prisma.notification.findUnique({ where: { id: note.id } }));

    // Delete student
    await prisma.student.delete({ where: { id: stuId } });

    // Assert that all child records were cascade deleted by the database engine
    const billAfter = await prisma.billing.findUnique({ where: { id: bill.id } });
    const attAfter = await prisma.attendance.findUnique({ where: { id: att.id } });
    const ticketAfter = await prisma.paymentTicket.findUnique({ where: { id: ticket.id } });
    const noteAfter = await prisma.notification.findUnique({ where: { id: note.id } });

    assert.equal(billAfter, null, 'Billing must be cascade deleted');
    assert.equal(attAfter, null, 'Attendance must be cascade deleted');
    assert.equal(ticketAfter, null, 'PaymentTicket must be cascade deleted');
    assert.equal(noteAfter, null, 'Targeted Notification must be cascade deleted');
  });

  harness.it('3.2: SetNull behavior - Deleting Teacher Profile sets Student.teacherId and Attendance.markedById to null', async () => {
    // Create teacher profile
    const teacherId = `user_temp_teacher_${RUN_ID}`;
    const teacher = await prisma.profile.create({
      data: {
        id: teacherId,
        name: 'Temporary Teacher',
        email: `temp.teacher.${RUN_ID}@academy.org`,
        role: UserRole.teacher,
      },
    });

    // Create student assigned to this teacher
    const student = await prisma.student.create({
      data: {
        studentName: `Assigned Student ${RUN_ID}`,
        teacherId: teacher.id,
      },
    });
    createdIds.studentIds.push(student.id);

    // Create attendance marked by this teacher
    const att = await prisma.attendance.create({
      data: {
        studentId: student.id,
        date: new Date('2026-09-26T00:00:00.000Z'),
        status: AttendanceStatus.Present,
        markedById: teacher.id,
      },
    });
    createdIds.attendanceIds.push(att.id);

    // Delete the teacher profile
    await prisma.profile.delete({ where: { id: teacher.id } });

    // Check student.teacherId
    const updatedStudent = await prisma.student.findUnique({ where: { id: student.id } });
    assert.ok(updatedStudent, 'Student must still exist after teacher deletion');
    assert.equal(updatedStudent.teacherId, null, 'Student.teacherId must be set to null on teacher delete');

    // Check attendance.markedById
    const updatedAtt = await prisma.attendance.findUnique({ where: { id: att.id } });
    assert.ok(updatedAtt, 'Attendance must still exist');
    assert.equal(updatedAtt.markedById, null, 'Attendance.markedById must be set to null on teacher delete');
  });
});

harness.describe('Suite 4: Cleanup & Zero Residual State Verification', () => {
  harness.it('4.1: Clean up all created test entities', async () => {
    // 1. Delete notifications
    if (createdIds.notificationIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: createdIds.notificationIds } },
      });
    }

    // 2. Delete payment tickets
    if (createdIds.ticketIds.length > 0) {
      await prisma.paymentTicket.deleteMany({
        where: { id: { in: createdIds.ticketIds } },
      });
    }

    // 3. Delete attendances
    if (createdIds.attendanceIds.length > 0) {
      await prisma.attendance.deleteMany({
        where: { id: { in: createdIds.attendanceIds } },
      });
    }

    // 4. Delete billings
    if (createdIds.billingIds.length > 0) {
      await prisma.billing.deleteMany({
        where: { id: { in: createdIds.billingIds } },
      });
    }

    // 5. Delete students
    if (createdIds.studentIds.length > 0) {
      await prisma.student.deleteMany({
        where: { id: { in: createdIds.studentIds } },
      });
    }

    // 6. Delete profiles
    if (createdIds.profileIds.length > 0) {
      await prisma.profile.deleteMany({
        where: { id: { in: createdIds.profileIds } },
      });
    }

    // 7. Delete teacher applications
    if (createdIds.teacherAppIds.length > 0) {
      await prisma.teacherApplication.deleteMany({
        where: { id: { in: createdIds.teacherAppIds } },
      });
    }

    // 8. Delete courses
    if (createdIds.courseIds.length > 0) {
      await prisma.course.deleteMany({
        where: { id: { in: createdIds.courseIds } },
      });
    }

    // Catch any remaining records created matching this RUN_ID
    await prisma.profile.deleteMany({ where: { id: { contains: RUN_ID } } });
    await prisma.course.deleteMany({ where: { title: { contains: RUN_ID } } });
    await prisma.teacherApplication.deleteMany({ where: { email: { contains: RUN_ID } } });
    await prisma.notification.deleteMany({ where: { title: { contains: RUN_ID } } });
  });

  harness.it('4.2: Confirm zero orphan records remain in Neon DB for RUN_ID', async () => {
    const leftoverProfiles = await prisma.profile.count({ where: { id: { contains: RUN_ID } } });
    const leftoverCourses = await prisma.course.count({ where: { title: { contains: RUN_ID } } });
    const leftoverApps = await prisma.teacherApplication.count({ where: { email: { contains: RUN_ID } } });
    const leftoverNotes = await prisma.notification.count({ where: { title: { contains: RUN_ID } } });

    assert.equal(leftoverProfiles, 0, 'No leftover test profiles');
    assert.equal(leftoverCourses, 0, 'No leftover test courses');
    assert.equal(leftoverApps, 0, 'No leftover test applications');
    assert.equal(leftoverNotes, 0, 'No leftover test notifications');
  });
});

export async function runStressSuite() {
  try {
    return await harness.run();
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith('m1-db-stress.test.mjs')) {
  runStressSuite().then((res) => {
    if (res.failed > 0) {
      console.error(`❌ Stress suite failed with ${res.failed} failure(s).`);
      process.exit(1);
    } else {
      console.log(`✅ All ${res.passed} stress tests PASSED successfully against Neon DB.`);
      process.exit(0);
    }
  });
}
