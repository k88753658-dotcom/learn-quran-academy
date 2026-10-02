/**
 * Feature 3: Neon DB Verification Script Contract Test
 * Authoritative Source: ORIGINAL_REQUEST.md (§ Acceptance Criteria) & PROJECT.md Feature 3
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 3: Neon DB Verification Script Contract', () => {
  harness.it('F03.1: test-db.mjs must exist at the project root', () => {
    assert.ok(projectFileExists('test-db.mjs'), 'test-db.mjs file not found at project root');
  });

  harness.it('F03.2: test-db.mjs must use PrismaClient to interact with Neon database', () => {
    const code = readProjectFile('test-db.mjs');
    assert.ok(code, 'test-db.mjs could not be read');
    assert.ok(
      code.includes('@prisma/client') || code.includes('prisma'),
      'test-db.mjs must instantiate and use PrismaClient'
    );
  });

  harness.it('F03.3: test-db.mjs must implement complete CRUD lifecycle: Insert, Read-back, and Cleanup', () => {
    const code = readProjectFile('test-db.mjs');
    assert.ok(code, 'test-db.mjs could not be read');
    const hasCreate = code.includes('.create(') || code.includes('.upsert(');
    const hasFind = code.includes('.findUnique(') || code.includes('.findFirst(') || code.includes('.findMany(');
    const hasDelete = code.includes('.delete(') || code.includes('.deleteMany(');

    assert.ok(hasCreate, 'test-db.mjs must insert a test record into Neon DB');
    assert.ok(hasFind, 'test-db.mjs must read back and verify the inserted record');
    assert.ok(hasDelete, 'test-db.mjs must clean up (delete) the test record so it leaves zero test artifacts');
  });

  harness.it('F03.4: test-db.mjs must properly disconnect Prisma client in finally block', () => {
    const code = readProjectFile('test-db.mjs');
    assert.ok(code, 'test-db.mjs could not be read');
    assert.ok(
      code.includes('$disconnect()'),
      'test-db.mjs must call prisma.$disconnect() to cleanly terminate connection pool'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f03-neon-script.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
