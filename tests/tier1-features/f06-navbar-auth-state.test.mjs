/**
 * Feature 6: Navbar & Client Auth State Test
 * Authoritative Source: PROJECT.md Feature 6 & Architecture (§ Authentication)
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 6: Navbar & Client Auth State Contract', () => {
  harness.it('F06.1: src/components/Navbar.tsx must exist', () => {
    assert.ok(projectFileExists('src/components/Navbar.tsx'), 'src/components/Navbar.tsx not found');
  });

  harness.it('F06.2: Navbar must utilize Clerk authentication components or hooks', () => {
    const code = readProjectFile('src/components/Navbar.tsx');
    assert.ok(code, 'Navbar.tsx could not be read');
    const hasClerkAuth =
      code.includes('@clerk/nextjs') &&
      (code.includes('SignedIn') ||
        code.includes('SignedOut') ||
        code.includes('UserButton') ||
        code.includes('useUser') ||
        code.includes('useAuth') ||
        code.includes('useClerk'));
    assert.ok(
      hasClerkAuth,
      'Navbar.tsx must import and use Clerk auth primitives (SignedIn, SignedOut, UserButton, or useClerk/useUser)'
    );
  });

  harness.it('F06.3: Navbar must not import or depend on Supabase auth client', () => {
    const code = readProjectFile('src/components/Navbar.tsx');
    assert.ok(code, 'Navbar.tsx could not be read');
    assert.ok(
      !code.includes('@supabase'),
      'Navbar.tsx must not contain any @supabase imports'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f06-navbar-auth-state.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
