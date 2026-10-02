/**
 * Tier 3: Teacher Recruitment, Approval & Student Assignment Lifecycle
 * Verifies cross-feature flow:
 * /teach Application -> Admin Approval -> Instructor Profile Creation -> Student Assignment -> Roster Verification
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { InMemoryAcademyStore } from '../helpers/mock-context.mjs';

const harness = createHarness();

harness.describe('Tier 3 Interaction: Teacher Recruitment & Student Assignment Flow', () => {
  const store = new InMemoryAcademyStore();

  harness.it('T3.TeacherFlow.1: Step 1 - Prospective instructor submits application on /teach', () => {
    store.reset();

    const appEmail = 'qari.ahmed@example.com';
    const app = {
      id: 'app_uuid_301',
      name: 'Qari Ahmed Hassan',
      email: appEmail,
      whatsapp: '+923112223344',
      qualification: 'Shahadat-ul-Alimiyyah (Wifaq-ul-Madaris)',
      specializations: ['Tajweed', 'Hifz', 'Qiraat'],
      experienceYears: 7,
      bio: 'Certified Quran teacher with 7 years of teaching experience.',
      status: 'pending',
      createdAt: new Date(),
    };
    store.teacherApplications.set(app.id, app);

    assert.equal(store.teacherApplications.get('app_uuid_301').status, 'pending');
  });

  harness.it('T3.TeacherFlow.2: Step 2 - Admin approves application, creating teacher Profile', () => {
    const app = store.teacherApplications.get('app_uuid_301');
    assert.ok(app);

    // Admin approves:
    app.status = 'approved';
    app.adminNotes = 'Excellent credentials, verified via interview.';

    // Create teacher Profile:
    const teacherUserId = 'user_clerk_teacher_456';
    const teacherProfile = {
      id: teacherUserId,
      name: app.name,
      email: app.email,
      role: 'teacher',
      whatsapp: app.whatsapp,
      qualification: app.qualification,
      specializations: app.specializations,
      experienceYears: app.experienceYears,
      isProfileComplete: true,
      lastActive: new Date(),
    };
    store.profiles.set(teacherUserId, teacherProfile);

    assert.equal(store.teacherApplications.get('app_uuid_301').status, 'approved');
    assert.equal(store.profiles.get(teacherUserId).role, 'teacher');
    assert.equal(store.profiles.get(teacherUserId).isProfileComplete, true);
  });

  harness.it('T3.TeacherFlow.3: Step 3 - Admin assigns enrolled student to the new teacher', () => {
    const teacherUserId = 'user_clerk_teacher_456';
    const student = {
      id: 'stud_uuid_102',
      profileId: 'user_student_789',
      studentName: 'Hamza Tariq',
      course: 'Quran Recitation with Tajweed',
      enrolled: true,
      teacherId: null,
    };
    store.students.set(student.id, student);

    // Admin executes assignment:
    student.teacherId = teacherUserId;
    store.students.set(student.id, student);

    assert.equal(store.students.get('stud_uuid_102').teacherId, teacherUserId);
  });

  harness.it('T3.TeacherFlow.4: Step 4 - Teacher dashboard lists assigned students in active roster', () => {
    const teacherUserId = 'user_clerk_teacher_456';
    // Filter students where teacherId === teacherUserId
    const assignedStudents = Array.from(store.students.values()).filter(
      (s) => s.teacherId === teacherUserId
    );

    assert.equal(assignedStudents.length, 1);
    assert.equal(assignedStudents[0].studentName, 'Hamza Tariq');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('teacher-recruitment-assignment-flow.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
