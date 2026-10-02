#!/usr/bin/env node
/**
 * E2E Clerk Zero Footprint Verification Test
 * Authoritative Requirements:
 * - ORIGINAL_REQUEST.md: "A global text search confirms there are exactly 0 occurrences of the word clerk anywhere in the src/ directory."
 * - R1: Completely uninstall @clerk/nextjs and remove all Clerk components (<ClerkProvider>, <SignInButton>, <UserButton>, etc.) from layout, middleware, Navbar, dashboards.
 */
import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists, getPackageJson } from './helpers/contract-helpers.mjs';
import { findClerkOccurrencesInSrc } from './helpers/better-auth-helpers.mjs';

const harness = createHarness();

harness.describe('R1 & Acceptance Criteria: Total Elimination of Clerk', () => {
  harness.it('R1.1: @clerk/nextjs must not exist in package.json dependencies or devDependencies', () => {
    const pkg = getPackageJson();
    assert.ok(pkg, 'package.json could not be loaded');
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};

    assert.equal(
      deps['@clerk/nextjs'],
      undefined,
      '@clerk/nextjs is still present in dependencies'
    );
    assert.equal(
      devDeps['@clerk/nextjs'],
      undefined,
      '@clerk/nextjs is still present in devDependencies'
    );
  });

  harness.it('R1.2: Exactly 0 occurrences of "clerk" (case-insensitive) across entire src/ directory', () => {
    const matches = findClerkOccurrencesInSrc();
    if (matches.length > 0) {
      const summary = matches
        .slice(0, 10)
        .map((m) => `  - ${m.file}:${m.line} -> "${m.content}"`)
        .join('\n');
      const extra = matches.length > 10 ? `\n  ... and ${matches.length - 10} more` : '';
      assert.fail(
        `Found ${matches.length} occurrences of "clerk" in src/:\n${summary}${extra}`
      );
    }
    assert.equal(matches.length, 0, 'Must have exactly 0 occurrences of "clerk" in src/');
  });

  harness.it('R1.3: src/app/layout.tsx must not contain <ClerkProvider> or @clerk imports', () => {
    assert.ok(projectFileExists('src/app/layout.tsx'), 'src/app/layout.tsx missing');
    const content = readProjectFile('src/app/layout.tsx');
    assert.ok(!content.includes('<ClerkProvider'), 'layout.tsx still references <ClerkProvider>');
    assert.ok(!content.includes('</ClerkProvider>'), 'layout.tsx still references </ClerkProvider>');
    assert.ok(!content.includes('@clerk'), 'layout.tsx still imports from @clerk');
  });

  harness.it('R1.4: src/middleware.ts must not contain clerkMiddleware or @clerk imports', () => {
    assert.ok(projectFileExists('src/middleware.ts'), 'src/middleware.ts missing');
    const content = readProjectFile('src/middleware.ts');
    assert.ok(!content.includes('clerkMiddleware'), 'src/middleware.ts still references clerkMiddleware');
    assert.ok(!content.includes('@clerk'), 'src/middleware.ts still imports from @clerk');
  });

  harness.it('R1.5: src/components/Navbar.tsx must not contain <UserButton> or Clerk hooks', () => {
    assert.ok(projectFileExists('src/components/Navbar.tsx'), 'src/components/Navbar.tsx missing');
    const content = readProjectFile('src/components/Navbar.tsx');
    assert.ok(!content.includes('<UserButton'), 'Navbar.tsx still references <UserButton>');
    assert.ok(!content.includes('useUser'), 'Navbar.tsx still references useUser from Clerk');
    assert.ok(!content.includes('useClerk'), 'Navbar.tsx still references useClerk');
    assert.ok(!content.includes('@clerk'), 'Navbar.tsx still imports from @clerk');
  });

  harness.it('R1.6: Student, Teacher, and Admin dashboards must not import or use useClerk', () => {
    const dashboards = [
      'src/app/dashboard/page.tsx',
      'src/app/teacher/dashboard/page.tsx',
      'src/app/admin/dashboard/page.tsx',
    ];

    for (const dashPath of dashboards) {
      if (projectFileExists(dashPath)) {
        const content = readProjectFile(dashPath);
        assert.ok(
          !content.includes('@clerk'),
          `${dashPath} still contains @clerk import`
        );
        assert.ok(
          !content.includes('useClerk'),
          `${dashPath} still references useClerk`
        );
      }
    }
  });

  harness.it('R1.7: No API routes in src/app/api/ import @clerk/nextjs/server or clerkClient', () => {
    const srcDir = 'src/app/api';
    if (!projectFileExists(srcDir)) return;

    const matches = findClerkOccurrencesInSrc().filter((m) => m.file.startsWith('src/app/api/'));
    assert.equal(
      matches.length,
      0,
      `API routes still contain ${matches.length} Clerk occurrences (expected 0)`
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('e2e-clerk-zero.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
