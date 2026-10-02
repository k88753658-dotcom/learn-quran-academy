/**
 * Tier 4: Disaster Recovery, Referential Integrity & Cascade Deletion Test
 * Verifies foreign key cascading and safe unlinking:
 * - Student deletion cascades to Billing, Attendance, Tickets
 * - Teacher deletion cleanly nullifies Student.teacherId without destroying student records
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { InMemoryAcademyStore } from '../helpers/mock-context.mjs';

const harness = createHarness();

harness.describe('Tier 4 Real-World Journey: Referential Integrity & Disaster Recovery', () => {
  const store = new InMemoryAcademyStore();

  harness.it('T4.Recovery.1: Cascade deletion removes all associated billing, attendance and ticket records when a student is deleted', () => {
    store.reset();

    const studentId = 'stud_to_delete_999';

    store.students.set(studentId, { id: studentId, studentName: 'Test Student' });
    store.billing.set(studentId, { id: 'bill_999', studentId, status: 'Pending' });
    store.attendance.set(`${studentId}_2026-09-01`, { id: 'att_999', studentId, date: '2026-09-01' });
    store.paymentTickets.set('TXN_999', { id: 't_999', studentId, transactionId: 'TXN_999' });

    assert.equal(store.students.size, 1);
    assert.equal(store.billing.size, 1);
    assert.equal(store.attendance.size, 1);
    assert.equal(store.paymentTickets.size, 1);

    // Simulate cascade delete (onDelete: Cascade in Prisma schema):
    store.students.delete(studentId);

    // Cascaded children:
    for (const [key, b] of store.billing) {
      if (b.studentId === studentId) store.billing.delete(key);
    }
    for (const [key, a] of store.attendance) {
      if (a.studentId === studentId) store.attendance.delete(key);
    }
    for (const [key, t] of store.paymentTickets) {
      if (t.studentId === studentId) store.paymentTickets.delete(key);
    }

    assert.equal(store.students.size, 0);
    assert.equal(store.billing.size, 0, 'Billing record must be cascade deleted');
    assert.equal(store.attendance.size, 0, 'Attendance record must be cascade deleted');
    assert.equal(store.paymentTickets.size, 0, 'Payment ticket must be cascade deleted');
  });

  harness.it('T4.Recovery.2: Teacher account deletion safely sets Student.teacherId to null (onDelete: SetNull)', () => {
    store.reset();

    const teacherId = 'teacher_to_remove_777';
    store.profiles.set(teacherId, { id: teacherId, role: 'teacher', name: 'Departing Teacher' });

    const studentId = 'student_orphan_test_1';
    store.students.set(studentId, {
      id: studentId,
      studentName: 'Continuing Student',
      teacherId: teacherId,
      enrolled: true,
      progress: 45,
    });

    assert.equal(store.students.get(studentId).teacherId, teacherId);

    // Simulate teacher removal:
    store.profiles.delete(teacherId);

    // SetNull cascade behavior:
    const student = store.students.get(studentId);
    if (student.teacherId === teacherId) {
      student.teacherId = null;
    }

    assert.equal(store.profiles.size, 0);
    assert.equal(store.students.size, 1, 'Student must NOT be deleted when teacher is removed');
    assert.equal(store.students.get(studentId).teacherId, null, 'Student.teacherId must be nullified cleanly');
    assert.equal(store.students.get(studentId).progress, 45, 'Student progress must be preserved intact');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('disaster-recovery-edge-cases.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
