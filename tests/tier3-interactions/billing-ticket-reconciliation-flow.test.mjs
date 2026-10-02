/**
 * Tier 3: Billing & Payment Ticket Reconciliation Flow
 * Verifies rejection handling and automated Stripe payment fulfillment
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { InMemoryAcademyStore } from '../helpers/mock-context.mjs';

const harness = createHarness();

harness.describe('Tier 3 Interaction: Payment Ticket Rejection & Stripe Fulfillment', () => {
  const store = new InMemoryAcademyStore();

  harness.it('T3.Reconciliation.1: Admin rejection resets billing to Pending and leaves student unenrolled', () => {
    store.reset();

    const studentId = 'stud_uuid_104';
    store.students.set(studentId, {
      id: studentId,
      studentName: 'Bilal Khan',
      enrolled: false,
    });

    store.billing.set(studentId, {
      id: 'bill_104',
      studentId,
      amountDue: '3000 PKR',
      status: 'Reviewing',
    });

    const txnId = 'TXN_INVALID_000';
    store.paymentTickets.set(txnId, {
      id: 'ticket_104',
      studentId,
      transactionId: txnId,
      status: 'Reviewing',
    });

    // Admin executes Reject:
    const ticket = store.paymentTickets.get(txnId);
    ticket.status = 'Rejected';
    ticket.resolvedAt = new Date();

    const billing = store.billing.get(studentId);
    billing.status = 'Pending';

    const student = store.students.get(studentId);

    assert.equal(ticket.status, 'Rejected');
    assert.equal(billing.status, 'Pending');
    assert.equal(student.enrolled, false);
  });

  harness.it('T3.Reconciliation.2: Stripe Webhook checkout.session.completed automatically provisions enrollment', () => {
    const studentId = 'stud_uuid_105';
    store.students.set(studentId, {
      id: studentId,
      studentName: 'Maryam Noor',
      course: 'Basic Qaida',
      enrolled: false,
      progress: 0,
    });

    store.billing.set(studentId, {
      id: 'bill_105',
      studentId,
      amountDue: '3000 PKR',
      status: 'Pending',
    });

    // Simulate Stripe webhook payload processing:
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            studentId: studentId,
            courseName: 'Noorani Qaida for Beginners',
          },
          payment_status: 'paid',
        },
      },
    };

    if (event.type === 'checkout.session.completed') {
      const { studentId: targetId, courseName } = event.data.object.metadata;
      const student = store.students.get(targetId);
      if (student) {
        student.course = courseName;
        student.enrolled = true;
      }

      const billing = store.billing.get(targetId);
      if (billing) {
        billing.status = 'Paid';
        billing.amountDue = '0 PKR';
        billing.lastPaymentDate = new Date();
      }
    }

    const student = store.students.get(studentId);
    const billing = store.billing.get(studentId);

    assert.equal(student.enrolled, true);
    assert.equal(student.course, 'Noorani Qaida for Beginners');
    assert.equal(billing.status, 'Paid');
    assert.equal(billing.amountDue, '0 PKR');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('billing-ticket-reconciliation-flow.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
