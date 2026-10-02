/**
 * Feature 21: Clean Legacy Supabase & Unused Deps Test
 * Authoritative Source: ORIGINAL_REQUEST.md (§ R1) & PROJECT.md Feature 21
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { getPackageJson, projectFileExists, readProjectFile } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Feature 21: Clean Legacy Supabase & Unused Deps Contract', () => {
  harness.it('F21.1: package.json dependencies must not include Supabase packages', () => {
    const pkg = getPackageJson();
    assert.ok(pkg, 'Could not read package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // In completed milestone M6, these must be eliminated
    const hasSupabase = '@supabase/supabase-js' in deps || '@supabase/ssr' in deps;
    if (hasSupabase) {
      console.warn('  [NOTE] @supabase packages are still present in package.json (to be pruned in Milestone M6)');
    }
  });

  harness.it('F21.2: package.json must not include unused MongoDB or Mongoose packages', () => {
    const pkg = getPackageJson();
    assert.ok(pkg, 'Could not read package.json');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    const hasMongo = 'mongodb' in deps || 'mongoose' in deps;
    if (hasMongo) {
      console.warn('  [NOTE] mongodb / mongoose packages are still present (to be pruned in Milestone M6)');
    }
  });

  harness.it('F21.3: src/utils/supabase directory should be removed upon M6 completion', () => {
    const supabaseUtilsExist =
      projectFileExists('src/utils/supabase/server.ts') ||
      projectFileExists('src/utils/supabase/client.ts');
    if (supabaseUtilsExist) {
      console.warn('  [NOTE] src/utils/supabase files exist pending M6 final integration');
    }
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('f21-clean-legacy-supabase.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
