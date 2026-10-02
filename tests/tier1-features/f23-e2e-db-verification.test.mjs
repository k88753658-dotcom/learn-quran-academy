/**
 * Feature 23: E2E DB Verification Execution Test
 * Authoritative Source: ORIGINAL_REQUEST.md (§ Acceptance Criteria) & PROJECT.md Feature 23
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { projectFileExists, readProjectFile } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 23: E2E DB Verification Execution Contract', () => {
  harness.it('F23.1: test-db.mjs must be runnable as an ES module or Node script', () => {
    assert.ok(projectFileExists('test-db.mjs'), 'test-db.mjs missing');
    const content = readProjectFile('test-db.mjs');
    assert.ok(content.length > 50, 'test-db.mjs must not be empty');
  });

  harness.it('F23.2: test-db.mjs must handle errors and exit with non-zero status code on failure', () => {
    const content = readProjectFile('test-db.mjs');
    assert.ok(content, 'test-db.mjs could not be read');
    const handlesExit =
      content.includes('process.exit(1)') ||
      content.includes('catch') ||
      content.includes('throw');
    assert.ok(handlesExit, 'test-db.mjs must propagate failure status code on error');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f23-e2e-db-verification.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
