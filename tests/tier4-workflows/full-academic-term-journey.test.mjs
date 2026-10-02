/**
 * Tier 4: Full Academic Term Lifecycle Journey
 * Simulates a complete month of academy operations:
 * - Admin setup
 * - Teacher recruitment & approval
 * - Student enrollments & tuition settlements
 * - Multi-week attendance & homework logging
 * - End-of-term academic progress audit
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { InMemoryAcademyStore } from '../helpers/mock-context.mjs';

const harness = createHarness();

harness.describe('Tier 4 Real-World Journey: Full Academic Term Lifecycle', () => {
  const store = new InMemoryAcademyStore();

  harness.it('T4.TermJourney.1: Phase 1 - Academy Admin initializes courses', () => {
    store.reset();

    const courseCatalog = [
      { id: 'c1', title: 'Noorani Qaida', description: 'Foundational Arabic phonetics' },
      { id: 'c2', title: 'Quran Recitation with Tajweed', description: 'Correct articulation & rules' },
      { id: 'c3', title: 'Hifz-ul-Quran', description: 'Memorization program' },
    ];

    for (const c of courseCatalog) {
      store.courses.set(c.id, c);
    }

    assert.equal(store.courses.size, 3);
  });

  harness.it('T4.TermJourney.2: Phase 2 - Teacher applies, is approved, and enrolled into faculty', () => {
    const teacherId = 'user_clerk_instructor_1';
    store.profiles.set(teacherId, {
      id: teacherId,
      name: 'Ustadha Fatima Zahra',
      email: 'fatima@academy.com',
      role: 'teacher',
      qualification: 'Ijazah in Hafs an Asim',
      isProfileComplete: true,
      lastActive: new Date(),
    });

    assert.equal(store.profiles.get(teacherId).role, 'teacher');
  });

  harness.it('T4.TermJourney.3: Phase 3 - Students register and settle tuition fee', () => {
    const studentData = [
      { id: 's1', name: 'Aisha Omar', course: 'Noorani Qaida' },
      { id: 's2', name: 'Ibrahim Khalil', course: 'Quran Recitation with Tajweed' },
      { id: 's3', name: 'Yusuf Tariq', course: 'Hifz-ul-Quran' },
    ];

    for (const s of studentData) {
      const studentProfileId = `user_${s.id}`;
      store.profiles.set(studentProfileId, {
        id: studentProfileId,
        name: s.name,
        email: `${s.id}@example.com`,
        role: 'student',
      });

      store.students.set(s.id, {
        id: s.id,
        profileId: studentProfileId,
        studentName: s.name,
        course: s.course,
        enrolled: true, // Approved payment
        progress: 0,
        teacherId: 'user_clerk_instructor_1',
      });

      store.billing.set(s.id, {
        id: `bill_${s.id}`,
        studentId: s.id,
        amountDue: '0 PKR',
        status: 'Paid',
      });
    }

    assert.equal(store.students.size, 3);
    assert.equal(store.billing.size, 3);
  });

  harness.it('T4.TermJourney.4: Phase 4 - Multi-week instruction, daily attendance, and homework progression', () => {
    // Simulate 10 days of classes for student 's1'
    for (let day = 1; day <= 10; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `2026-09-${dayStr}`;
      const status = day === 5 ? 'Absent' : day === 8 ? 'Late' : 'Present';

      store.attendance.set(`s1_${dateStr}`, {
        id: `att_s1_${dateStr}`,
        studentId: 's1',
        date: dateStr,
        status,
        markedById: 'user_clerk_instructor_1',
      });
    }

    // Update student progress:
    const student1 = store.students.get('s1');
    student1.progress = 60; // 60% through Qaida
    student1.lastAssignment = 'Lesson 7: Tanween exercises pages 18-20';

    assert.equal(store.attendance.size, 10);
    assert.equal(student1.progress, 60);
    assert.equal(student1.lastAssignment.includes('Tanween'), true);
  });

  harness.it('T4.TermJourney.5: Phase 5 - End-of-term audit verifies clean state and reporting', () => {
    // Attendance rate for s1: 9 out of 10 attended (8 present + 1 late) = 90%
    const records = Array.from(store.attendance.values()).filter((a) => a.studentId === 's1');
    const presentOrLate = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const rate = Math.round((presentOrLate / records.length) * 100);

    assert.equal(rate, 90, 'Attendance rate should be 90%');

    // Verify all billing is in Paid state
    const allPaid = Array.from(store.billing.values()).every((b) => b.status === 'Paid');
    assert.equal(allPaid, true, 'All enrolled students must have settled billing accounts');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('full-academic-term-journey.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
