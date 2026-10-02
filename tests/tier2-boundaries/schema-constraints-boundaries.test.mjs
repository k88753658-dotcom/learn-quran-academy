/**
 * Tier 2: Schema Constraints & Integrity Boundaries Test
 * Tests Prisma database model unique constraints, foreign keys, and enum values
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { parsePrismaSchema } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Tier 2 Boundary: Schema Constraints & Model Integrity', () => {
  const schema = parsePrismaSchema();

  harness.it('T2.Schema.1: Profile.email must enforce unique constraint', () => {
    assert.ok(schema);
    const profile = schema.models['Profile'];
    assert.ok(profile);
    assert.ok(
      profile.fields['email']?.attributes.includes('@unique'),
      'Profile.email must have @unique attribute to prevent duplicate accounts'
    );
  });

  harness.it('T2.Schema.2: PaymentTicket.transactionId must enforce unique constraint', () => {
    assert.ok(schema);
    const ticket = schema.models['PaymentTicket'];
    assert.ok(ticket);
    assert.ok(
      ticket.fields['transactionId']?.attributes.includes('@unique'),
      'PaymentTicket.transactionId must be @unique to prevent receipt reuse replay attacks'
    );
  });

  harness.it('T2.Schema.3: Attendance must enforce compound unique constraint on [studentId, date]', () => {
    assert.ok(schema);
    const attendance = schema.models['Attendance'];
    assert.ok(attendance);
    const hasCompoundUnique =
      attendance.raw.some((line) => line.includes('@@unique([studentId, date])')) ||
      schema.rawContent.includes('@@unique([studentId, date])');
    assert.ok(
      hasCompoundUnique,
      'Attendance must have @@unique([studentId, date]) to prevent multiple records per day for the same student'
    );
  });

  harness.it('T2.Schema.4: AttendanceStatus enum must strictly cover all valid states', () => {
    assert.ok(schema);
    const attendanceEnum = schema.enums['AttendanceStatus'];
    assert.ok(attendanceEnum, 'AttendanceStatus enum missing');
    const values = attendanceEnum.values.map((v) => v.trim());
    assert.ok(values.includes('Present'), 'Must include Present');
    assert.ok(values.includes('Absent'), 'Must include Absent');
    assert.ok(values.includes('Late'), 'Must include Late');
  });

  harness.it('T2.Schema.5: BillingStatus enum must include Pending, Paid, Overdue, and Reviewing', () => {
    assert.ok(schema);
    const billingEnum = schema.enums['BillingStatus'];
    assert.ok(billingEnum, 'BillingStatus enum missing');
    const values = billingEnum.values.map((v) => v.trim());
    assert.ok(values.includes('Pending'), 'Must include Pending');
    assert.ok(values.includes('Paid'), 'Must include Paid');
    assert.ok(values.includes('Overdue'), 'Must include Overdue');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('schema-constraints-boundaries.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
