/**
 * Feature 4: Clerk Provider Root Layout Verification Test
 * Authoritative Source: PROJECT.md Feature 4 & Architecture (§ Authentication)
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 4: Clerk Provider Root Layout Contract', () => {
  harness.it('F04.1: src/app/layout.tsx must exist', () => {
    assert.ok(projectFileExists('src/app/layout.tsx'), 'src/app/layout.tsx not found');
  });

  harness.it('F04.2: layout.tsx must import ClerkProvider from @clerk/nextjs', () => {
    const code = readProjectFile('src/app/layout.tsx');
    assert.ok(code, 'layout.tsx could not be read');
    assert.match(
      code,
      /import\s+.*\bClerkProvider\b.*from\s+['"]@clerk\/nextjs['"]/,
      'Must import ClerkProvider from @clerk/nextjs'
    );
  });

  harness.it('F04.3: root layout must wrap <html> and <body> inside <ClerkProvider>', () => {
    const code = readProjectFile('src/app/layout.tsx');
    assert.ok(code, 'layout.tsx could not be read');
    assert.ok(
      code.includes('<ClerkProvider') && code.includes('</ClerkProvider>'),
      'Root layout component tree must be wrapped in <ClerkProvider>'
    );
  });

  harness.it('F04.4: layout.tsx must contain zero imports from @supabase', () => {
    const code = readProjectFile('src/app/layout.tsx');
    assert.ok(code, 'layout.tsx could not be read');
    assert.ok(
      !code.includes('@supabase'),
      'layout.tsx must not contain any legacy @supabase imports'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f04-clerk-layout.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
