/**
 * Feature 7: Login & Register Pages Auth Integration Test
 * Authoritative Source: PROJECT.md Feature 7 & Explorer Survey 3 Report
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 7: Login & Register Pages Auth Integration', () => {
  harness.it('F07.1: login/page.tsx and register/page.tsx must exist', () => {
    assert.ok(projectFileExists('src/app/login/page.tsx'), 'src/app/login/page.tsx not found');
    assert.ok(projectFileExists('src/app/register/page.tsx'), 'src/app/register/page.tsx not found');
  });

  harness.it('F07.2: login page must integrate with Clerk authentication', () => {
    const code = readProjectFile('src/app/login/page.tsx');
    assert.ok(code, 'login/page.tsx could not be read');
    const integratesClerk =
      code.includes('@clerk/nextjs') ||
      code.includes('SignIn') ||
      code.includes('useSignIn') ||
      code.includes('clerk');
    assert.ok(integratesClerk, 'login/page.tsx must integrate Clerk authentication');
  });

  harness.it('F07.3: login and register pages must contain zero imports from @supabase', () => {
    const loginCode = readProjectFile('src/app/login/page.tsx');
    const registerCode = readProjectFile('src/app/register/page.tsx');
    assert.ok(!loginCode?.includes('@supabase'), 'login/page.tsx must not import @supabase');
    assert.ok(!registerCode?.includes('@supabase'), 'register/page.tsx must not import @supabase');
  });

  harness.it('F07.4: register page captures academy onboarding fields', () => {
    const code = readProjectFile('src/app/register/page.tsx');
    assert.ok(code, 'register/page.tsx could not be read');
    assert.ok(code.includes('parentName') || code.includes('parent'), 'Must capture parent name');
    assert.ok(code.includes('studentName') || code.includes('student'), 'Must capture student name');
    assert.ok(code.includes('course') || code.includes('courses'), 'Must allow selecting course');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f07-login-register-pages.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
