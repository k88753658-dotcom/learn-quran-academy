#!/usr/bin/env node
/**
 * Better Auth UI Components & Navigation Verification Test
 * Authoritative Requirements:
 * - ORIGINAL_REQUEST.md: "Since Clerk's pre-built UI is being removed, implement custom Login and Register pages (using Tailwind CSS) that interface with Better Auth's client-side hooks (signIn, signUp). Update the Navbar to show the user's state and a sign-out button."
 * - PROJECT.md § Architecture, § Milestones (M3), § Code Layout
 */
import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from './helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('R3: Authentication UI & Navigation Components', () => {
  harness.it('UI.1: src/app/layout.tsx root layout must be completely free of ClerkProvider', () => {
    assert.ok(projectFileExists('src/app/layout.tsx'), 'src/app/layout.tsx does not exist');
    const content = readProjectFile('src/app/layout.tsx');

    assert.ok(
      !content.includes('ClerkProvider'),
      'src/app/layout.tsx must not contain <ClerkProvider>'
    );
    assert.ok(
      !content.includes('@clerk'),
      'src/app/layout.tsx must not import from @clerk/nextjs'
    );
  });

  harness.it('UI.2: src/app/login/page.tsx must implement custom Tailwind login form interfacing with authClient', () => {
    assert.ok(projectFileExists('src/app/login/page.tsx'), 'src/app/login/page.tsx does not exist');
    const content = readProjectFile('src/app/login/page.tsx');

    // Must not use Clerk prebuilt widget
    assert.ok(
      !content.includes('@clerk'),
      'src/app/login/page.tsx must not import from @clerk/nextjs'
    );
    assert.ok(
      !content.includes('<SignIn'),
      'src/app/login/page.tsx must not render Clerk <SignIn /> widget'
    );

    // Must use Better Auth client
    assert.ok(
      content.includes('authClient') || content.includes('signIn'),
      'src/app/login/page.tsx must interface with Better Auth authClient / signIn'
    );

    // Must contain standard form fields
    assert.ok(
      /type=["']email["']|name=["']email["']|id=["']email["']/.test(content),
      'src/app/login/page.tsx must contain an email input field'
    );
    assert.ok(
      /type=["']password["']|name=["']password["']|id=["']password["']/.test(content),
      'src/app/login/page.tsx must contain a password input field'
    );
    assert.ok(
      /type=["']submit["']|<button/i.test(content),
      'src/app/login/page.tsx must contain a submit button'
    );

    // Must link to register
    assert.ok(
      content.includes('/register'),
      'src/app/login/page.tsx must provide navigation link to /register'
    );
  });

  harness.it('UI.3: src/app/register/page.tsx must implement custom Tailwind registration form', () => {
    assert.ok(projectFileExists('src/app/register/page.tsx'), 'src/app/register/page.tsx does not exist');
    const content = readProjectFile('src/app/register/page.tsx');

    // Must not use Clerk prebuilt widget
    assert.ok(
      !content.includes('@clerk'),
      'src/app/register/page.tsx must not import from @clerk/nextjs'
    );
    assert.ok(
      !content.includes('<SignUp'),
      'src/app/register/page.tsx must not render Clerk <SignUp /> widget'
    );

    // Must contain input fields for registration
    assert.ok(
      /email/i.test(content) && /password/i.test(content),
      'src/app/register/page.tsx must contain email and password fields'
    );

    // Must link to login
    assert.ok(
      content.includes('/login'),
      'src/app/register/page.tsx must provide navigation link to /login'
    );
  });

  harness.it('UI.4: src/components/Navbar.tsx must display session state and sign-out button using Better Auth', () => {
    assert.ok(projectFileExists('src/components/Navbar.tsx'), 'src/components/Navbar.tsx does not exist');
    const content = readProjectFile('src/components/Navbar.tsx');

    // No Clerk
    assert.ok(
      !content.includes('@clerk'),
      'src/components/Navbar.tsx must not import from @clerk/nextjs'
    );
    assert.ok(
      !content.includes('UserButton'),
      'src/components/Navbar.tsx must not render <UserButton>'
    );
    assert.ok(
      !content.includes('useUser'),
      'src/components/Navbar.tsx must not use Clerk useUser hook'
    );

    // Better Auth integration
    assert.ok(
      content.includes('useSession') || content.includes('authClient'),
      'src/components/Navbar.tsx must use Better Auth useSession or authClient'
    );
    assert.ok(
      content.includes('signOut'),
      'src/components/Navbar.tsx must provide sign-out functionality via Better Auth signOut'
    );
  });

  harness.it('UI.5: Student, Teacher, and Admin dashboards must wire sign-out to Better Auth', () => {
    const dashboards = [
      { name: 'Student Dashboard', path: 'src/app/dashboard/page.tsx' },
      { name: 'Teacher Dashboard', path: 'src/app/teacher/dashboard/page.tsx' },
      { name: 'Admin Dashboard', path: 'src/app/admin/dashboard/page.tsx' },
    ];

    for (const dash of dashboards) {
      if (projectFileExists(dash.path)) {
        const content = readProjectFile(dash.path);
        assert.ok(
          !content.includes('useClerk'),
          `${dash.name} (${dash.path}) must not use Clerk useClerk`
        );
        assert.ok(
          content.includes('signOut'),
          `${dash.name} (${dash.path}) must wire sign-out handler`
        );
        assert.ok(
          content.includes('authClient') || content.includes('@/lib/auth-client') || content.includes('signOut'),
          `${dash.name} (${dash.path}) must trigger Better Auth signOut`
        );
      }
    }
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('better-auth-ui.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
