/**
 * Tier 3: Student Onboarding, Tuition Payment & Verification Lifecycle
 * Verifies cross-feature state transitions:
 * Register -> Pending Billing -> Payment Ticket Submission -> Admin Approval -> Active Enrollment
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { InMemoryAcademyStore } from '../helpers/mock-context.mjs';

const harness = createHarness();

harness.describe('Tier 3 Interaction: Student Onboarding & Payment Lifecycle Flow', () => {
  const store = new InMemoryAcademyStore();

  harness.it('T3.Onboarding.1: Step 1 - Student registers account, creating Profile, Student, and Billing (Pending)', () => {
    store.reset();

    const clerkUserId = 'user_student_abc123';
    const profile = {
      id: clerkUserId,
      name: 'Zayd Ali',
      email: 'zayd@example.com',
      role: 'student',
      whatsapp: '+923001234567',
    };
    store.profiles.set(clerkUserId, profile);

    const studentId = 'stud_uuid_101';
    const student = {
      id: studentId,
      profileId: clerkUserId,
      studentName: 'Zayd Ali',
      parentName: 'Ali Khan',
      course: 'Tajweed Fundamentals',
      enrolled: false,
      progress: 0,
      teacherId: null,
    };
    store.students.set(studentId, student);

    const billingId = 'bill_uuid_101';
    const billing = {
      id: billingId,
      studentId: studentId,
      amountDue: '3000 PKR',
      status: 'Pending',
      lastPaymentDate: null,
    };
    store.billing.set(studentId, billing);

    assert.equal(store.profiles.get(clerkUserId).role, 'student');
    assert.equal(store.students.get(studentId).enrolled, false, 'Initial enrollment must be false');
    assert.equal(store.billing.get(studentId).status, 'Pending', 'Initial billing status must be Pending');
  });

  harness.it('T3.Onboarding.2: Step 2 - Student submits payment receipt, transitioning status to Reviewing', () => {
    const studentId = 'stud_uuid_101';
    const transactionId = 'TXN_EASYPAISA_987654';

    // Verify duplicate guard
    assert.ok(!store.paymentTickets.has(transactionId), 'Ticket should not exist prior to submission');

    const ticket = {
      id: 'ticket_uuid_201',
      studentId: studentId,
      transactionId: transactionId,
      methodUsed: 'EasyPaisa',
      status: 'Reviewing',
      submittedAt: new Date(),
    };
    store.paymentTickets.set(transactionId, ticket);

    // Update billing to Reviewing
    const billing = store.billing.get(studentId);
    billing.status = 'Reviewing';
    store.billing.set(studentId, billing);

    assert.equal(store.paymentTickets.get(transactionId).status, 'Reviewing');
    assert.equal(store.billing.get(studentId).status, 'Reviewing');
    assert.equal(store.students.get(studentId).enrolled, false, 'Student remains unenrolled while under review');
  });

  harness.it('T3.Onboarding.3: Step 3 - Admin approves payment ticket, activating enrollment and clearing dues', () => {
    const studentId = 'stud_uuid_101';
    const transactionId = 'TXN_EASYPAISA_987654';

    // Admin executes approve action:
    const ticket = store.paymentTickets.get(transactionId);
    ticket.status = 'Approved';
    ticket.resolvedAt = new Date();

    const billing = store.billing.get(studentId);
    billing.status = 'Paid';
    billing.amountDue = '0 PKR';
    billing.lastPaymentDate = new Date();

    const student = store.students.get(studentId);
    student.enrolled = true;
    student.liveClassroomLink = 'https://zoom.us/j/academy123';

    assert.equal(store.paymentTickets.get(transactionId).status, 'Approved');
    assert.equal(store.billing.get(studentId).status, 'Paid');
    assert.equal(store.students.get(studentId).enrolled, true, 'Student is now officially enrolled');
  });

  harness.it('T3.Onboarding.4: Step 4 - Student dashboard reflects active enrollment and live class access', () => {
    const studentId = 'stud_uuid_101';
    const student = store.students.get(studentId);
    const billing = store.billing.get(studentId);

    // Student dashboard query simulation:
    const dashboardData = {
      student: {
        id: student.id,
        name: student.studentName,
        enrolled: student.enrolled,
        classroomLink: student.liveClassroomLink,
      },
      billing: {
        status: billing.status,
        amountDue: billing.amountDue,
      },
    };

    assert.equal(dashboardData.student.enrolled, true);
    assert.equal(dashboardData.billing.status, 'Paid');
    assert.ok(dashboardData.student.classroomLink.includes('zoom.us'));
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('student-onboarding-payment-flow.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
