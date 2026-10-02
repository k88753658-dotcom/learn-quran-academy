/**
 * tests/clerk-id-fk-integrity.test.mjs
 * 
 * Empirical verification of Clerk user ID compatibility with Profile.id (String @id)
 * and PostgreSQL foreign key relational integrity in Neon DB.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PrismaClient, Prisma } from '@prisma/client';

// Load environment variables
if (!process.env.DATABASE_URL) {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env')) {
    process.loadEnvFile('.env');
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

const prisma = new PrismaClient();

const timestamp = Date.now();
const testPrefix = `test_${timestamp}`;

// Realistic Clerk User IDs (non-UUID format)
const teacherClerkId = `user_2b9LTch_${testPrefix}`;
const studentClerkId = `user_2b9LStu_${testPrefix}`;
const adminClerkId = `user_2b9LAdm_${testPrefix}`;
const edgeClerkId = `user_2b9LEdge_${testPrefix}_with-hyphen.and_underscore_long_${'x'.repeat(40)}`;

let createdStudentId = null;
let createdAttendanceId = null;
let createdBillingId = null;
let createdTicketId = null;
let createdNotificationId = null;

async function runEmpiricalTests() {
  console.log('======================================================');
  console.log('  EMPIRICAL VERIFICATION: CLERK ID & FK RELATIONAL INTEGRITY');
  console.log('======================================================\n');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Testing with realistic Clerk user IDs:`);
  console.log(`  - Teacher Clerk ID: ${teacherClerkId}`);
  console.log(`  - Student Clerk ID: ${studentClerkId}`);
  console.log(`  - Admin Clerk ID:   ${adminClerkId}`);
  console.log(`  - Edge Clerk ID:    ${edgeClerkId} (${edgeClerkId.length} chars)`);
  console.log('');

  let testsPassed = 0;
  let testsFailed = 0;

  async function step(name, fn) {
    try {
      process.stdout.write(`  [TEST] ${name} ... `);
      await fn();
      console.log('PASSED ✅');
      testsPassed++;
    } catch (err) {
      console.log('FAILED ❌');
      console.error(`         Error: ${err.message}`);
      if (err.code) console.error(`         Prisma Code: ${err.code}`);
      testsFailed++;
      throw err;
    }
  }

  try {
    // -------------------------------------------------------------
    // STEP 1: Verify Profile Creation with Realistic Clerk IDs
    // -------------------------------------------------------------
    await step('1.1 Create Teacher Profile with Clerk ID', async () => {
      const teacher = await prisma.profile.create({
        data: {
          id: teacherClerkId,
          name: `Teacher Verification ${timestamp}`,
          email: `teacher_${timestamp}@test-clerk-neon.com`,
          role: 'teacher',
          qualification: 'Alimiyyah Certified',
          specializations: ['Tajweed', 'Hifz'],
          experienceYears: 5,
        },
      });
      assert.equal(teacher.id, teacherClerkId);
      assert.equal(teacher.role, 'teacher');
      assert.deepEqual(teacher.specializations, ['Tajweed', 'Hifz']);
    });

    await step('1.2 Create Student Profile with Clerk ID', async () => {
      const student = await prisma.profile.create({
        data: {
          id: studentClerkId,
          name: `Student Verification ${timestamp}`,
          email: `student_${timestamp}@test-clerk-neon.com`,
          role: 'student',
        },
      });
      assert.equal(student.id, studentClerkId);
      assert.equal(student.role, 'student');
    });

    await step('1.3 Create Admin Profile with Clerk ID', async () => {
      const admin = await prisma.profile.create({
        data: {
          id: adminClerkId,
          name: `Admin Verification ${timestamp}`,
          email: `admin_${timestamp}@test-clerk-neon.com`,
          role: 'admin',
        },
      });
      assert.equal(admin.id, adminClerkId);
      assert.equal(admin.role, 'admin');
    });

    await step('1.4 Create Profile with Extended/Complex Non-UUID Clerk ID', async () => {
      const edgeProfile = await prisma.profile.create({
        data: {
          id: edgeClerkId,
          name: `Edge Clerk Verification ${timestamp}`,
          email: `edge_${timestamp}@test-clerk-neon.com`,
          role: 'student',
        },
      });
      assert.equal(edgeProfile.id, edgeClerkId);
      // Clean up edge profile immediately
      await prisma.profile.delete({ where: { id: edgeClerkId } });
    });

    // -------------------------------------------------------------
    // STEP 2: Verify Child Records Creation with Clerk ID Foreign Keys
    // -------------------------------------------------------------
    await step('2.1 Create Student Child Record linking to Clerk Profile IDs', async () => {
      const studentRec = await prisma.student.create({
        data: {
          profileId: studentClerkId,
          teacherId: teacherClerkId,
          studentName: `Student ${timestamp}`,
          parentName: 'Parent Guardian',
          course: 'Quran Reading Basics',
          enrolled: true,
          progress: 25,
        },
      });
      createdStudentId = studentRec.id;
      assert.ok(createdStudentId, 'Student record should have a generated UUID');
      assert.equal(studentRec.profileId, studentClerkId);
      assert.equal(studentRec.teacherId, teacherClerkId);
    });

    await step('2.2 Create Billing Record linked to Student', async () => {
      const billing = await prisma.billing.create({
        data: {
          studentId: createdStudentId,
          amountDue: '3000 PKR',
          status: 'Pending',
        },
      });
      createdBillingId = billing.id;
      assert.equal(billing.studentId, createdStudentId);
      assert.equal(billing.status, 'Pending');
      assert.equal(billing.amountDue, '3000 PKR');
    });

    await step('2.3 Create Attendance Record with Clerk markedBy ID', async () => {
      const attendance = await prisma.attendance.create({
        data: {
          studentId: createdStudentId,
          date: new Date('2026-09-29T00:00:00.000Z'),
          status: 'Present',
          markedById: adminClerkId,
        },
      });
      createdAttendanceId = attendance.id;
      assert.equal(attendance.studentId, createdStudentId);
      assert.equal(attendance.markedById, adminClerkId);
      assert.equal(attendance.status, 'Present');
    });

    await step('2.4 Create PaymentTicket linked to Student', async () => {
      const ticket = await prisma.paymentTicket.create({
        data: {
          studentId: createdStudentId,
          transactionId: `TRX_${testPrefix}_9988`,
          methodUsed: 'JazzCash',
          status: 'Reviewing',
        },
      });
      createdTicketId = ticket.id;
      assert.equal(ticket.studentId, createdStudentId);
      assert.equal(ticket.status, 'Reviewing');
    });

    await step('2.5 Create Targeted Notification linked to Student', async () => {
      const notif = await prisma.notification.create({
        data: {
          targetStudentId: createdStudentId,
          title: 'Class Scheduled',
          text: 'Your class is scheduled for tomorrow at 10 AM',
          type: 'Targeted',
          publisherRole: 'admin',
        },
      });
      createdNotificationId = notif.id;
      assert.equal(notif.targetStudentId, createdStudentId);
      assert.equal(notif.type, 'Targeted');
    });

    // -------------------------------------------------------------
    // STEP 3: Relational Queries with Prisma `include` Across Clerk FKs
    // -------------------------------------------------------------
    await step('3.1 Query Profile with Nested Student, Billing, Attendance, Tickets, and Notifications', async () => {
      const fullProfile = await prisma.profile.findUnique({
        where: { id: studentClerkId },
        include: {
          studentProfile: {
            include: {
              teacher: true,
              billing: true,
              attendances: {
                include: {
                  markedBy: true,
                },
              },
              paymentTickets: true,
              notifications: true,
            },
          },
        },
      });

      assert.ok(fullProfile, 'Profile should be found');
      assert.equal(fullProfile.id, studentClerkId);
      assert.ok(fullProfile.studentProfile, 'Student relation should be loaded');
      assert.equal(fullProfile.studentProfile.profileId, studentClerkId);
      assert.equal(fullProfile.studentProfile.teacher?.id, teacherClerkId);
      assert.equal(fullProfile.studentProfile.teacher?.qualification, 'Alimiyyah Certified');
      assert.ok(fullProfile.studentProfile.billing, 'Billing relation should be loaded');
      assert.equal(fullProfile.studentProfile.billing.amountDue, '3000 PKR');
      assert.equal(fullProfile.studentProfile.attendances.length, 1);
      assert.equal(fullProfile.studentProfile.attendances[0].markedBy?.id, adminClerkId);
      assert.equal(fullProfile.studentProfile.paymentTickets.length, 1);
      assert.equal(fullProfile.studentProfile.notifications.length, 1);
    });

    await step('3.2 Query Teacher Profile including Assigned Students with Child Profiles', async () => {
      const teacherWithStudents = await prisma.profile.findUnique({
        where: { id: teacherClerkId },
        include: {
          teacherStudents: {
            include: {
              profile: true,
              billing: true,
            },
          },
        },
      });

      assert.ok(teacherWithStudents);
      assert.equal(teacherWithStudents.teacherStudents.length, 1);
      assert.equal(teacherWithStudents.teacherStudents[0].id, createdStudentId);
      assert.equal(teacherWithStudents.teacherStudents[0].profile?.id, studentClerkId);
      assert.equal(teacherWithStudents.teacherStudents[0].billing?.amountDue, '3000 PKR');
    });

    await step('3.3 Query Attendance Record with Student, Student Profile, and MarkedBy Profile', async () => {
      const attendance = await prisma.attendance.findUnique({
        where: { id: createdAttendanceId },
        include: {
          student: {
            include: {
              profile: true,
              teacher: true,
            },
          },
          markedBy: true,
        },
      });

      assert.ok(attendance);
      assert.equal(attendance.student.profile?.id, studentClerkId);
      assert.equal(attendance.student.teacher?.id, teacherClerkId);
      assert.equal(attendance.markedBy?.id, adminClerkId);
    });

    // -------------------------------------------------------------
    // STEP 4: Adversarial Stress & Integrity Constraints Testing
    // -------------------------------------------------------------
    await step('4.1 Foreign Key Constraint: Reject Non-Existent Profile ID in Student', async () => {
      let threw = false;
      try {
        await prisma.student.create({
          data: {
            profileId: 'user_nonexistent_fake_999999',
            studentName: 'Invalid FK Student',
          },
        });
      } catch (err) {
        threw = true;
        assert.ok(
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003',
          `Expected P2003 FK violation, got ${err.code}: ${err.message}`
        );
      }
      assert.ok(threw, 'Should have rejected invalid foreign key');
    });

    await step('4.2 Foreign Key Constraint: Reject Non-Existent Teacher ID in Student', async () => {
      let threw = false;
      try {
        await prisma.student.create({
          data: {
            teacherId: 'user_nonexistent_fake_888888',
            studentName: 'Invalid Teacher FK Student',
          },
        });
      } catch (err) {
        threw = true;
        assert.ok(
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003',
          `Expected P2003 FK violation, got ${err.code}: ${err.message}`
        );
      }
      assert.ok(threw, 'Should have rejected invalid teacher foreign key');
    });

    await step('4.3 Foreign Key Constraint: Reject Non-Existent MarkedById in Attendance', async () => {
      let threw = false;
      try {
        await prisma.attendance.create({
          data: {
            studentId: createdStudentId,
            date: new Date('2026-09-30T00:00:00.000Z'),
            status: 'Absent',
            markedById: 'user_nonexistent_fake_777777',
          },
        });
      } catch (err) {
        threw = true;
        assert.ok(
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003',
          `Expected P2003 FK violation, got ${err.code}: ${err.message}`
        );
      }
      assert.ok(threw, 'Should have rejected invalid markedById foreign key');
    });

    await step('4.4 Unique Constraint: Reject Duplicate Clerk ID on Profile', async () => {
      let threw = false;
      try {
        await prisma.profile.create({
          data: {
            id: studentClerkId, // duplicate primary key
            name: 'Duplicate Clerk ID Profile',
            email: `duplicate_${timestamp}@test.com`,
          },
        });
      } catch (err) {
        threw = true;
        assert.ok(
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002',
          `Expected P2002 unique constraint violation, got ${err.code}: ${err.message}`
        );
      }
      assert.ok(threw, 'Should have rejected duplicate Clerk ID');
    });

    await step('4.5 Compound Unique Constraint: Reject Duplicate Attendance on Same Date for Same Student', async () => {
      let threw = false;
      try {
        await prisma.attendance.create({
          data: {
            studentId: createdStudentId,
            date: new Date('2026-09-29T00:00:00.000Z'), // duplicate date for same student
            status: 'Late',
          },
        });
      } catch (err) {
        threw = true;
        assert.ok(
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002',
          `Expected P2002 compound unique violation, got ${err.code}: ${err.message}`
        );
      }
      assert.ok(threw, 'Should have rejected duplicate attendance on same date');
    });

    await step('4.6 FK Referential Action onDelete: SetNull on Teacher Deletion', async () => {
      // Deleting teacher profile should nullify Student.teacherId without error
      await prisma.profile.delete({
        where: { id: teacherClerkId },
      });

      const updatedStudent = await prisma.student.findUnique({
        where: { id: createdStudentId },
      });
      assert.ok(updatedStudent);
      assert.equal(
        updatedStudent.teacherId,
        null,
        'Student.teacherId must be set to null when assigned teacher Profile is deleted'
      );
    });

    await step('4.7 FK Referential Action onDelete: Cascade on Student Profile Deletion', async () => {
      // Deleting Student Profile should cascade delete Student, Billing, Attendance, PaymentTicket, and Notification
      await prisma.profile.delete({
        where: { id: studentClerkId },
      });

      // Verify Student is deleted
      const checkStudent = await prisma.student.findUnique({
        where: { id: createdStudentId },
      });
      assert.equal(checkStudent, null, 'Student should be cascade deleted when Profile is deleted');

      // Verify Billing is deleted
      const checkBilling = await prisma.billing.findUnique({
        where: { id: createdBillingId },
      });
      assert.equal(checkBilling, null, 'Billing should be cascade deleted');

      // Verify Attendance is deleted
      const checkAttendance = await prisma.attendance.findUnique({
        where: { id: createdAttendanceId },
      });
      assert.equal(checkAttendance, null, 'Attendance should be cascade deleted');

      // Verify PaymentTicket is deleted
      const checkTicket = await prisma.paymentTicket.findUnique({
        where: { id: createdTicketId },
      });
      assert.equal(checkTicket, null, 'PaymentTicket should be cascade deleted');

      // Verify Notification is deleted
      const checkNotification = await prisma.notification.findUnique({
        where: { id: createdNotificationId },
      });
      assert.equal(checkNotification, null, 'Notification should be cascade deleted');
    });

    // -------------------------------------------------------------
    // STEP 5: Final Cleanup & Orphan Verification
    // -------------------------------------------------------------
    await step('5.1 Clean Up Admin Profile and Confirm Zero Test Artifacts in DB', async () => {
      await prisma.profile.delete({
        where: { id: adminClerkId },
      });

      // Verify no test profiles remain
      const remainingProfiles = await prisma.profile.count({
        where: {
          id: {
            in: [teacherClerkId, studentClerkId, adminClerkId, edgeClerkId],
          },
        },
      });
      assert.equal(remainingProfiles, 0, 'No test profiles should remain');

      // Verify no test students remain
      const remainingStudents = await prisma.student.count({
        where: {
          id: createdStudentId,
        },
      });
      assert.equal(remainingStudents, 0, 'No test students should remain');
    });

  } finally {
    // Safety fallback cleanup in case of test failures
    try {
      if (createdTicketId) {
        await prisma.paymentTicket.deleteMany({ where: { id: createdTicketId } });
      }
      if (createdNotificationId) {
        await prisma.notification.deleteMany({ where: { id: createdNotificationId } });
      }
      if (createdAttendanceId) {
        await prisma.attendance.deleteMany({ where: { id: createdAttendanceId } });
      }
      if (createdBillingId) {
        await prisma.billing.deleteMany({ where: { id: createdBillingId } });
      }
      if (createdStudentId) {
        await prisma.student.deleteMany({ where: { id: createdStudentId } });
      }
      await prisma.profile.deleteMany({
        where: {
          id: { in: [teacherClerkId, studentClerkId, adminClerkId, edgeClerkId] },
        },
      });
    } catch (cleanupErr) {
      console.warn('⚠️ Safety cleanup warning:', cleanupErr.message);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`Results: ${testsPassed} passed, ${testsFailed} failed (Total: ${testsPassed + testsFailed})`);
  console.log('------------------------------------------------------\n');

  if (testsFailed > 0) {
    throw new Error(`Empirical verification failed: ${testsFailed} tests failed.`);
  }

  console.log('🎉 ALL EMPIRICAL CLERK ID & FK RELATIONAL INTEGRITY TESTS PASSED!');
  return { passed: testsPassed, failed: testsFailed };
}

runEmpiricalTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Empirical test run failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
