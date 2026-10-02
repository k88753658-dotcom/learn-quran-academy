/**
 * Tier 2 Boundary: Clerk Client Components & Hooks API Contract Verification
 * Authoritative Spec: @clerk/nextjs v7.9.7 (Clerk Core 3), PROJECT.md, ORIGINAL_REQUEST.md
 */
import { createRequire } from 'node:module';
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from '../helpers/contract-helpers.mjs';

const require = createRequire(import.meta.url);
const clerk = require('@clerk/nextjs');

const harness = createHarness();

harness.describe('Tier 2 Boundary: Clerk v7.9.7 Client Contracts & Deprecations', () => {
  harness.it('T2.Clerk.1: @clerk/nextjs v7.9.7 exports <Show> as modern replacement for control components', () => {
    assert.equal(typeof clerk.Show, 'function', 'clerk.Show must be exported as a function');
  });

  harness.it('T2.Clerk.2: Calling SignedIn or SignedOut in Clerk v7.9.7 throws runtime removal error', () => {
    let signedOutThrew = false;
    let signedInThrew = false;

    try {
      clerk.SignedOut({});
    } catch (err) {
      signedOutThrew = true;
      assert.ok(
        err.message.includes('not available in @clerk/nextjs Core 3'),
        'SignedOut error message must state it is not available in Core 3'
      );
    }

    try {
      clerk.SignedIn({});
    } catch (err) {
      signedInThrew = true;
      assert.ok(
        err.message.includes('not available in @clerk/nextjs Core 3'),
        'SignedIn error message must state it is not available in Core 3'
      );
    }

    assert.ok(signedOutThrew, 'SignedOut must throw when rendered in Clerk v7');
    assert.ok(signedInThrew, 'SignedIn must throw when rendered in Clerk v7');
  });

  harness.it('T2.Clerk.3: Navbar.tsx must NOT render deprecated <SignedIn> or <SignedOut> components', () => {
    const navbarCode = readProjectFile('src/components/Navbar.tsx');
    assert.ok(navbarCode, 'Navbar.tsx could not be read');

    const usesDeprecatedSignedIn =
      navbarCode.includes('<SignedIn>') || navbarCode.includes('<SignedIn ');
    const usesDeprecatedSignedOut =
      navbarCode.includes('<SignedOut>') || navbarCode.includes('<SignedOut ');

    assert.ok(
      !usesDeprecatedSignedIn && !usesDeprecatedSignedOut,
      'Navbar.tsx must not use removed <SignedIn> or <SignedOut> (causes build/prerender crash in Clerk v7.9.7; use <Show when="signed-in"> and <Show when="signed-out"> instead)'
    );
  });

  harness.it('T2.Clerk.4: LoginPage must use modern fallbackRedirectUrl or forceRedirectUrl instead of afterSignInUrl', () => {
    const loginCode = readProjectFile('src/app/login/page.tsx');
    assert.ok(loginCode, 'login/page.tsx could not be read');

    assert.ok(
      !loginCode.includes('afterSignInUrl'),
      'login/page.tsx must not use deprecated afterSignInUrl'
    );
    assert.ok(
      loginCode.includes('fallbackRedirectUrl') || loginCode.includes('forceRedirectUrl'),
      'login/page.tsx must use modern fallbackRedirectUrl or forceRedirectUrl'
    );
  });

  harness.it('T2.Clerk.5: Dashboard pages must use useClerk signOut with redirectUrl options object', () => {
    const studentDash = readProjectFile('src/app/dashboard/page.tsx');
    const teacherDash = readProjectFile('src/app/teacher/dashboard/page.tsx');
    const adminDash = readProjectFile('src/app/admin/dashboard/page.tsx');

    for (const [name, code] of [
      ['Student Dashboard', studentDash],
      ['Teacher Dashboard', teacherDash],
      ['Admin Dashboard', adminDash],
    ]) {
      assert.ok(code.includes('useClerk'), `${name} must import useClerk`);
      assert.ok(
        code.includes('signOut({ redirectUrl:') || code.includes("signOut({ redirectUrl:"),
        `${name} must call signOut with redirectUrl option object`
      );
    }
  });

  harness.it('T2.Clerk.6: Admin dashboard must not block Clerk admin users with legacy-only localStorage check', () => {
    const adminDash = readProjectFile('src/app/admin/dashboard/page.tsx');
    // If admin dashboard checks localStorage without checking Clerk user/session metadata, Clerk-authenticated admins are locked out
    const hasClerkUserCheck =
      adminDash.includes('useUser') ||
      adminDash.includes('user?.publicMetadata') ||
      !adminDash.includes('localStorage.getItem("user_role")');

    assert.ok(
      hasClerkUserCheck,
      'Admin dashboard should authenticate admin role using Clerk session/useUser rather than solely relying on legacy localStorage.getItem("user_role")'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('clerk-client-contracts.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
