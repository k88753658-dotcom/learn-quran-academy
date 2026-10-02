#!/usr/bin/env node
/**
 * Better Auth Database Schema & Model Verification Test
 * Authoritative Requirements:
 * - ORIGINAL_REQUEST.md: "Update prisma/schema.prisma to include the standard Better Auth required models (User, Session, Account, Verification). Ensure the existing Profile or user relations map correctly to the new Auth models."
 * - PROJECT.md § Architecture & § Interface Contracts: Profile.id references User.id via 1:1 Shared Primary Key with onDelete: Cascade.
 */
import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists, parsePrismaSchema, getPackageJson } from './helpers/contract-helpers.mjs';
import { analyzeBetterAuthSchema } from './helpers/better-auth-helpers.mjs';

const harness = createHarness();

harness.describe('R2: Better Auth Schema Models & Identity Contracts', () => {
  harness.it('R2.1: better-auth must be installed in package.json dependencies', () => {
    const pkg = getPackageJson();
    assert.ok(pkg, 'package.json could not be loaded');
    const deps = pkg.dependencies || {};
    assert.ok(deps['better-auth'], 'better-auth is not installed in package.json dependencies');
  });

  harness.it('R2.2: prisma/schema.prisma must define model User with required Better Auth fields', () => {
    const analysis = analyzeBetterAuthSchema();
    assert.ok(analysis.valid, 'Prisma schema could not be parsed');
    assert.ok(analysis.hasUser, 'model User is missing from prisma/schema.prisma');

    const fields = analysis.userModel.fields;
    assert.ok(fields.id, 'User model must have id field');
    assert.ok(fields.email, 'User model must have email field');
    assert.ok(fields.emailVerified !== undefined, 'User model must have emailVerified field');
    assert.ok(fields.createdAt, 'User model must have createdAt field');
    assert.ok(fields.updatedAt, 'User model must have updatedAt field');
  });

  harness.it('R2.3: prisma/schema.prisma must define model Session with token and user relations', () => {
    const analysis = analyzeBetterAuthSchema();
    assert.ok(analysis.hasSession, 'model Session is missing from prisma/schema.prisma');

    const fields = analysis.sessionModel.fields;
    assert.ok(fields.id, 'Session model must have id field');
    assert.ok(fields.token, 'Session model must have token field');
    assert.ok(fields.expiresAt, 'Session model must have expiresAt field');
    assert.ok(fields.userId, 'Session model must have userId field');

    // Check cascade relation from Session to User
    const rawContent = analysis.sessionModel.raw.join('\n');
    assert.ok(
      /onDelete:\s*Cascade/.test(rawContent),
      'Session model must cascade delete when User is deleted (onDelete: Cascade)'
    );
  });

  harness.it('R2.4: prisma/schema.prisma must define model Account with provider and credential fields', () => {
    const analysis = analyzeBetterAuthSchema();
    assert.ok(analysis.hasAccount, 'model Account is missing from prisma/schema.prisma');

    const fields = analysis.accountModel.fields;
    assert.ok(fields.id, 'Account model must have id field');
    assert.ok(fields.accountId, 'Account model must have accountId field');
    assert.ok(fields.providerId, 'Account model must have providerId field');
    assert.ok(fields.userId, 'Account model must have userId field');

    const rawContent = analysis.accountModel.raw.join('\n');
    assert.ok(
      /onDelete:\s*Cascade/.test(rawContent),
      'Account model must cascade delete when User is deleted (onDelete: Cascade)'
    );
  });

  harness.it('R2.5: prisma/schema.prisma must define model Verification for auth tokens', () => {
    const analysis = analyzeBetterAuthSchema();
    assert.ok(analysis.hasVerification, 'model Verification is missing from prisma/schema.prisma');

    const fields = analysis.verificationModel.fields;
    assert.ok(fields.id, 'Verification model must have id field');
    assert.ok(fields.identifier, 'Verification model must have identifier field');
    assert.ok(fields.value, 'Verification model must have value field');
    assert.ok(fields.expiresAt, 'Verification model must have expiresAt field');
  });

  harness.it('R2.6: Profile.id must link 1:1 with User.id via Shared Primary Key (onDelete: Cascade)', () => {
    const analysis = analyzeBetterAuthSchema();
    assert.ok(analysis.hasProfile, 'model Profile is missing from prisma/schema.prisma');

    const profileRel = analysis.profileUserRelation;
    assert.ok(profileRel, 'Profile model must have user relation');
    assert.ok(profileRel.declared, 'Profile model must declare: user User @relation(...)');
    assert.ok(
      profileRel.referencesId && profileRel.fieldsId,
      'Profile user relation must use fields: [id], references: [id] (Shared Primary Key)'
    );
    assert.ok(
      profileRel.hasCascade,
      'Profile user relation must specify onDelete: Cascade so deleting User cascades to Profile'
    );
  });

  harness.it('R2.7: Prisma schema must not contain legacy Clerk comments', () => {
    const content = readProjectFile('prisma/schema.prisma');
    assert.ok(content, 'prisma/schema.prisma could not be read');
    assert.ok(
      !/clerk/i.test(content),
      'prisma/schema.prisma still contains references to Clerk in comments or field descriptions'
    );
  });

  harness.it('R2.8: Domain models (Student, Attendance) must retain relations to Profile', () => {
    const parsed = parsePrismaSchema();
    const student = parsed.models.Student;
    const attendance = parsed.models.Attendance;

    assert.ok(student, 'model Student is missing');
    assert.ok(student.fields.profileId, 'Student must maintain profileId relation');
    assert.ok(attendance, 'model Attendance is missing');
    assert.ok(attendance.fields.markedById, 'Attendance must maintain markedById relation');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('better-auth-schema.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
