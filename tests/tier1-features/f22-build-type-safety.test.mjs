/**
 * Feature 22: Build Compilation & Type Safety Configuration Test
 * Authoritative Source: ORIGINAL_REQUEST.md (§ Acceptance Criteria) & PROJECT.md Feature 22
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists, getPackageJson } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 22: Build Compilation & Type Safety Verification', () => {
  harness.it('F22.1: tsconfig.json must enforce strict mode', () => {
    assert.ok(projectFileExists('tsconfig.json'), 'tsconfig.json missing');
    const tsconfig = JSON.parse(readProjectFile('tsconfig.json'));
    assert.equal(tsconfig.compilerOptions?.strict, true, 'TypeScript must enforce strict: true');
  });

  harness.it('F22.2: package.json must define standard build script (next build)', () => {
    const pkg = getPackageJson();
    assert.ok(pkg, 'Could not read package.json');
    assert.ok(pkg.scripts?.build, 'build script missing from package.json');
    assert.match(pkg.scripts.build, /next\s+build/, 'build script must execute next build');
  });

  harness.it('F22.3: next.config.ts must exist and export Next.js configuration', () => {
    assert.ok(projectFileExists('next.config.ts'), 'next.config.ts missing');
    const configCode = readProjectFile('next.config.ts');
    assert.ok(configCode.includes('NextConfig') || configCode.includes('nextConfig'), 'Must configure NextConfig');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f22-build-type-safety.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
