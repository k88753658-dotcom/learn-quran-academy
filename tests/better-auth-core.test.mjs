#!/usr/bin/env node
/**
 * Better Auth Core Infrastructure & Middleware Verification Test
 * Authoritative Requirements:
 * - PROJECT.md § Architecture, § Milestones (M2), § Interface Contracts
 * - Server configuration in src/lib/auth.ts
 * - Client configuration in src/lib/auth-client.ts
 * - Centralized session helper in src/lib/session.ts
 * - Auth catch-all API handler in src/app/api/auth/[...all]/route.ts
 * - Edge route protection middleware in src/middleware.ts
 */
import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists } from './helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('R2 & R4: Better Auth Core Infrastructure Contracts', () => {
  harness.it('Core.1: src/lib/auth.ts must initialize Better Auth with prismaAdapter and email/password', () => {
    assert.ok(projectFileExists('src/lib/auth.ts'), 'src/lib/auth.ts does not exist');
    const content = readProjectFile('src/lib/auth.ts');

    assert.ok(
      content.includes('betterAuth'),
      'src/lib/auth.ts must import and call betterAuth'
    );
    assert.ok(
      content.includes('prismaAdapter'),
      'src/lib/auth.ts must configure prismaAdapter'
    );
    assert.ok(
      /prismaAdapter\s*\(\s*prisma\s*,\s*\{\s*provider:\s*["']postgresql["']\s*\}\s*\)/.test(content) ||
      (content.includes('prismaAdapter(prisma') && content.includes('postgresql')),
      'src/lib/auth.ts must pass prisma singleton and postgresql provider to prismaAdapter'
    );
    assert.ok(
      /emailAndPassword\s*:\s*\{\s*enabled\s*:\s*true\s*\}/.test(content) || content.includes('emailAndPassword'),
      'src/lib/auth.ts must enable emailAndPassword provider'
    );
    assert.ok(
      /export\s+(const|var|let)\s+auth\b/.test(content),
      'src/lib/auth.ts must export const auth'
    );
    assert.ok(
      !/@clerk\b/i.test(content),
      'src/lib/auth.ts must not contain any Clerk references'
    );
  });

  harness.it('Core.2: src/lib/auth-client.ts must initialize and export createAuthClient hooks', () => {
    assert.ok(projectFileExists('src/lib/auth-client.ts'), 'src/lib/auth-client.ts does not exist');
    const content = readProjectFile('src/lib/auth-client.ts');

    assert.ok(
      content.includes('createAuthClient'),
      'src/lib/auth-client.ts must import and call createAuthClient'
    );
    assert.ok(
      /export\s+(const|var|let)\s+authClient\b/.test(content),
      'src/lib/auth-client.ts must export authClient'
    );
    assert.ok(
      content.includes('signIn') && content.includes('signOut'),
      'src/lib/auth-client.ts must export signIn and signOut hooks'
    );
    assert.ok(
      content.includes('useSession'),
      'src/lib/auth-client.ts must export useSession hook'
    );
    assert.ok(
      !/@clerk\b/i.test(content),
      'src/lib/auth-client.ts must not contain Clerk references'
    );
  });

  harness.it('Core.3: src/lib/session.ts must export getServerSession using auth.api.getSession', () => {
    assert.ok(projectFileExists('src/lib/session.ts'), 'src/lib/session.ts does not exist');
    const content = readProjectFile('src/lib/session.ts');

    assert.ok(
      /export\s+async\s+function\s+getServerSession\b/.test(content) ||
      /export\s+const\s+getServerSession\s*=/.test(content),
      'src/lib/session.ts must export async function getServerSession'
    );
    assert.ok(
      content.includes('auth.api.getSession'),
      'getServerSession must call auth.api.getSession'
    );
    assert.ok(
      content.includes('headers'),
      'getServerSession must pass async Next.js headers to auth.api.getSession'
    );
    assert.ok(
      !/@clerk\b/i.test(content),
      'src/lib/session.ts must not contain Clerk references'
    );
  });

  harness.it('Core.4: src/app/api/auth/[...all]/route.ts must handle Better Auth routes via toNextJsHandler', () => {
    const routePath = 'src/app/api/auth/[...all]/route.ts';
    assert.ok(projectFileExists(routePath), `${routePath} does not exist`);
    const content = readProjectFile(routePath);

    assert.ok(
      content.includes('toNextJsHandler'),
      'Auth catch-all route must import toNextJsHandler from better-auth/next-js'
    );
    assert.ok(
      /export\s+const\s+\{\s*GET\s*,\s*POST\s*\}\s*=\s*toNextJsHandler/.test(content) ||
      (content.includes('export const GET') && content.includes('export const POST')),
      'Auth catch-all route must export GET and POST handlers'
    );
    assert.ok(
      !/@clerk\b/i.test(content),
      'Auth catch-all route must not contain Clerk references'
    );
  });

  harness.it('Core.5: src/middleware.ts must protect routes using Better Auth session tokens', () => {
    assert.ok(projectFileExists('src/middleware.ts'), 'src/middleware.ts does not exist');
    const content = readProjectFile('src/middleware.ts');

    // Must not use Clerk
    assert.ok(
      !content.includes('@clerk'),
      'src/middleware.ts must not import from @clerk'
    );
    assert.ok(
      !content.includes('clerkMiddleware'),
      'src/middleware.ts must not use clerkMiddleware'
    );

    // Must check better-auth session cookie
    assert.ok(
      content.includes('better-auth.session_token') || content.includes('session_token'),
      'src/middleware.ts must check for better-auth session token cookie'
    );

    // Must whitelist public auth routes
    assert.ok(
      content.includes('/api/auth') || content.includes('api/auth'),
      'src/middleware.ts must whitelist /api/auth routes from interception'
    );

    // Must whitelist public pages
    assert.ok(
      content.includes('/login') && content.includes('/register'),
      'src/middleware.ts must allow unauthenticated access to /login and /register'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('better-auth-core.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
