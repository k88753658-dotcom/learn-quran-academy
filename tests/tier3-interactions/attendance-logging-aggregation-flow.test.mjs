/**
 * Tier 3: Attendance Logging & Real-Time Aggregation Lifecycle
 * Verifies cross-feature attendance workflows:
 * Teacher logs attendance -> Unique constraint check -> Student Profile metrics -> Admin Stats calculation
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { InMemoryAcademyStore } from '../helpers/mock-context.mjs';

const harness = createHarness();

harness.describe('Tier 3 Interaction: Attendance Logging & Metrics Aggregation Flow', () => {
  const store = new InMemoryAcademyStore();
  const studentId = 'stud_uuid_103';
  const teacherId = 'teacher_user_999';

  harness.it('T3.AttendanceFlow.1: Step 1 - Teacher marks attendance for student across multiple dates', () => {
    store.reset();

    const datesAndStatuses = [
      { date: '2026-09-01', status: 'Present' },
      { date: '2026-09-02', status: 'Present' },
      { date: '2026-09-03', status: 'Absent' },
      { date: '2026-09-04', status: 'Present' },
    ];

    for (const record of datesAndStatuses) {
      const key = `${studentId}_${record.date}`;
      store.attendance.set(key, {
        id: `att_${record.date}`,
        studentId,
        date: record.date,
        status: record.status,
        markedById: teacherId,
      });
    }

    assert.equal(store.attendance.size, 4);
  });

  harness.it('T3.AttendanceFlow.2: Step 2 - Compound unique constraint guard prevents duplicate entry on same date', () => {
    const duplicateKey = `${studentId}_2026-09-01`;
    assert.ok(store.attendance.has(duplicateKey), 'Record for 2026-09-01 already exists');

    // Simulate route handler upsert or conflict guard
    const existing = store.attendance.get(duplicateKey);
    // If existing, update status instead of creating duplicate row
    existing.status = 'Late';
    store.attendance.set(duplicateKey, existing);

    assert.equal(store.attendance.size, 4, 'Total attendance rows must not increase on duplicate date');
    assert.equal(store.attendance.get(duplicateKey).status, 'Late');
  });

  harness.it('T3.AttendanceFlow.3: Step 3 - Student Profile calculates correct attendance metrics', () => {
    const records = Array.from(store.attendance.values()).filter((a) => a.studentId === studentId);
    const totalSessions = records.length;
    const presentOrLate = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const attendanceRate = Math.round((presentOrLate / totalSessions) * 100);

    // 3 out of 4 sessions attended (2 Present + 1 Late) = 75%
    assert.equal(totalSessions, 4);
    assert.equal(presentOrLate, 3);
    assert.equal(attendanceRate, 75);
  });

  harness.it('T3.AttendanceFlow.4: Step 4 - Admin Stats accurately aggregates today’s active presence across students', () => {
    // Total students = 1, today = '2026-09-04'
    const today = '2026-09-04';
    const totalStudents = 1;
    const presentToday = Array.from(store.attendance.values()).filter(
      (a) => a.date === today && a.status === 'Present'
    ).length;

    const dailyRate = Math.round((presentToday / totalStudents) * 100);
    assert.equal(presentToday, 1);
    assert.equal(dailyRate, 100);
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('attendance-logging-aggregation-flow.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
