/**
 * Feature 2: Prisma Singleton Client Verification Test
 * Authoritative Source: PROJECT.md Feature 2 & Interface Contracts (§ Prisma Singleton Contract)
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 2: Prisma Singleton Client Contract', () => {
  harness.it('F02.1: src/lib/prisma.ts or src/lib/db/prisma.ts must exist', () => {
    const exists = projectFileExists('src/lib/prisma.ts') || projectFileExists('src/lib/db/prisma.ts');
    assert.ok(exists, 'Prisma singleton client file not found in src/lib/prisma.ts or src/lib/db/prisma.ts');
  });

  harness.it('F02.2: singleton client must export "prisma" named export', () => {
    const code = readProjectFile('src/lib/prisma.ts') || readProjectFile('src/lib/db/prisma.ts');
    assert.ok(code, 'Prisma singleton file could not be read');
    assert.match(
      code,
      /export\s+(const|let|var)\s+prisma\b/,
      'Must export `prisma` singleton instance as named export'
    );
  });

  harness.it('F02.3: must implement global caching to prevent Next.js Fast Refresh connection exhaustion', () => {
    const code = readProjectFile('src/lib/prisma.ts') || readProjectFile('src/lib/db/prisma.ts');
    assert.ok(code, 'Prisma singleton file could not be read');
    const hasGlobalCache =
      code.includes('globalThis') ||
      code.includes('global') ||
      code.includes('globalForPrisma');
    assert.ok(
      hasGlobalCache,
      'Prisma client must use globalThis caching pattern to avoid leaking connection pools during development Fast Refresh'
    );
  });

  harness.it('F02.4: imports PrismaClient from @prisma/client', () => {
    const code = readProjectFile('src/lib/prisma.ts') || readProjectFile('src/lib/db/prisma.ts');
    assert.ok(code, 'Prisma singleton file could not be read');
    assert.match(
      code,
      /import\s+.*\bPrismaClient\b.*from\s+['"]@prisma\/client['"]/,
      'Must import PrismaClient from @prisma/client'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f02-prisma-client.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
