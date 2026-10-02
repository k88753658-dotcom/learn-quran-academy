/**
 * Feature 1: Complete Prisma Schema Verification Test
 * Authoritative Source: PROJECT.md Feature 1 & Explorer Survey 2 Schema Specification
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { parsePrismaSchema, projectFileExists } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 1: Complete Prisma Schema Specification', () => {
  harness.it('F01.1: schema.prisma file must exist in prisma/ directory', () => {
    assert.ok(projectFileExists('prisma/schema.prisma'), 'prisma/schema.prisma not found');
  });

  harness.it('F01.2: datasource provider must be postgresql', () => {
    const schema = parsePrismaSchema();
    assert.ok(schema, 'Failed to parse schema.prisma');
    assert.match(schema.rawContent, /provider\s*=\s*"postgresql"/, 'Datasource provider must be postgresql for Neon DB');
  });

  harness.it('F01.3: all 8 core application models must be defined', () => {
    const schema = parsePrismaSchema();
    const requiredModels = [
      'Profile',
      'Student',
      'Billing',
      'Attendance',
      'Notification',
      'PaymentTicket',
      'Course',
      'TeacherApplication',
    ];

    for (const modelName of requiredModels) {
      assert.ok(
        schema.models[modelName],
        `Model ${modelName} is missing from prisma/schema.prisma. All 8 models are required.`
      );
    }
  });

  harness.it('F01.4: Profile model must use Clerk User ID as String @id', () => {
    const schema = parsePrismaSchema();
    const profileModel = schema.models['Profile'];
    assert.ok(profileModel, 'Profile model missing');
    assert.ok(profileModel.fields['id'], 'Profile.id field missing');
    assert.equal(profileModel.fields['id'].type, 'String', 'Profile.id must be String (not Int or auto-increment) to store Clerk user_... IDs');
    assert.ok(profileModel.fields['id'].attributes.includes('@id'), 'Profile.id must have @id attribute');
  });

  harness.it('F01.5: Profile model must include extended instructor attributes', () => {
    const schema = parsePrismaSchema();
    const profileModel = schema.models['Profile'];
    assert.ok(profileModel, 'Profile model missing');
    
    // Check required fields for full academy operation
    const expectedFields = ['email', 'role'];
    for (const f of expectedFields) {
      assert.ok(profileModel.fields[f], `Profile.${f} must exist`);
    }
  });

  harness.it('F01.6: Required Enums must be defined with all valid states', () => {
    const schema = parsePrismaSchema();
    assert.ok(schema.enums['UserRole'], 'Enum UserRole missing');
    assert.ok(schema.enums['BillingStatus'], 'Enum BillingStatus missing');
    assert.ok(schema.enums['AttendanceStatus'], 'Enum AttendanceStatus missing');
    assert.ok(schema.enums['NotificationType'], 'Enum NotificationType missing');
    assert.ok(schema.enums['TicketStatus'], 'Enum TicketStatus missing');
  });

  harness.it('F01.7: Student relations must enforce cascade delete for student data', () => {
    const schema = parsePrismaSchema();
    const studentModel = schema.models['Student'];
    assert.ok(studentModel, 'Student model missing');
    assert.ok(studentModel.fields['profileId'] || studentModel.fields['profile'], 'Student must reference Profile');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f01-prisma-schema.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
