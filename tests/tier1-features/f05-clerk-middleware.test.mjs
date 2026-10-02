/**
 * Feature 5: Clerk Route Protection Middleware Test
 * Authoritative Source: PROJECT.md Feature 5 & Architecture (§ Authentication)
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 5: Clerk Route Protection Middleware Contract', () => {
  harness.it('F05.1: src/middleware.ts must exist as primary Next.js edge middleware', () => {
    assert.ok(projectFileExists('src/middleware.ts'), 'src/middleware.ts file not found');
  });

  harness.it('F05.2: legacy src/proxy.ts should be removed or deprecated in favor of middleware.ts', () => {
    const proxyExists = projectFileExists('src/proxy.ts');
    // If it exists, it must not be active or must not reference supabase
    if (proxyExists) {
      const proxyCode = readProjectFile('src/proxy.ts');
      assert.ok(
        !proxyCode.includes('@supabase') || proxyCode.includes('// deprecated'),
        'Legacy src/proxy.ts must not contain active @supabase/ssr middleware'
      );
    }
  });

  harness.it('F05.3: middleware.ts must use clerkMiddleware from @clerk/nextjs/server', () => {
    const code = readProjectFile('src/middleware.ts');
    assert.ok(code, 'middleware.ts could not be read');
    assert.ok(
      code.includes('clerkMiddleware'),
      'src/middleware.ts must export clerkMiddleware()'
    );
    assert.ok(
      code.includes('@clerk/nextjs/server') || code.includes('@clerk/nextjs'),
      'src/middleware.ts must import clerkMiddleware from @clerk/nextjs/server'
    );
  });

  harness.it('F05.4: middleware must protect sensitive portal routes (/admin, /teacher, /dashboard)', () => {
    const code = readProjectFile('src/middleware.ts');
    assert.ok(code, 'middleware.ts could not be read');
    const hasAdminMatcher = code.includes('/admin') || code.includes('admin');
    const hasTeacherMatcher = code.includes('/teacher') || code.includes('teacher');
    const hasDashboardMatcher = code.includes('/dashboard') || code.includes('dashboard');

    assert.ok(hasAdminMatcher, 'Middleware must protect /admin routes');
    assert.ok(hasTeacherMatcher, 'Middleware must protect /teacher routes');
    assert.ok(hasDashboardMatcher, 'Middleware must protect /dashboard routes');
  });

  harness.it('F05.5: middleware must export config.matcher excluding static assets', () => {
    const code = readProjectFile('src/middleware.ts');
    assert.ok(code, 'middleware.ts could not be read');
    assert.match(
      code,
      /export\s+const\s+config\s*=\s*\{[\s\S]*matcher\s*:/,
      'middleware.ts must export config object with matcher array'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f05-clerk-middleware.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
