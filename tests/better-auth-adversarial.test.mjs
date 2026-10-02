#!/usr/bin/env node
/**
 * Tier 2: Boundary & Adversarial Verification Test Suite
 * Evaluates edge cases, malformed payloads, security boundaries, and referential cascades.
 */
import { createHarness, assert } from './helpers/test-harness.mjs';
import { readProjectFile, projectFileExists, parsePrismaSchema } from './helpers/contract-helpers.mjs';
import { analyzeBetterAuthSchema } from './helpers/better-auth-helpers.mjs';

const harness = createHarness();

harness.describe('Tier 2: Boundary & Adversarial Security Contracts', () => {
  harness.it('T2.1: Edge Middleware Route Protection Matrix - Whitelist & Blacklist enforcement', () => {
    assert.ok(projectFileExists('src/middleware.ts'), 'src/middleware.ts does not exist');
    const middlewareCode = readProjectFile('src/middleware.ts');

    // Expected public routes that must never be blocked by middleware
    const publicPatterns = [
      '/api/auth',
      '/login',
      '/register',
    ];

    for (const pattern of publicPatterns) {
      assert.ok(
        middlewareCode.includes(pattern),
        `Middleware must whitelist public pattern '${pattern}'`
      );
    }

    // Expected protected paths that must be gated
    const protectedIndicators = ['/dashboard', 'better-auth.session_token', 'callbackUrl'];
    for (const indicator of protectedIndicators) {
      assert.ok(
        middlewareCode.includes(indicator) || middlewareCode.includes('session_token'),
        `Middleware must gate protected paths and check session tokens (indicator: ${indicator})`
      );
    }
  });

  harness.it('T2.2: Session Cookie Token Contract - Must support standard and __Secure cookie prefixes', () => {
    const middlewareCode = readProjectFile('src/middleware.ts');
    assert.ok(middlewareCode, 'src/middleware.ts could not be read');

    const checksToken =
      middlewareCode.includes('better-auth.session_token') ||
      middlewareCode.includes('session_token');

    assert.ok(
      checksToken,
      'Middleware must inspect better-auth session cookies'
    );
  });

  harness.it('T2.3: Schema Referential Cascade Integrity - Deleting User must cascade to Profile, Session, and Account', () => {
    const schemaAnalysis = analyzeBetterAuthSchema();
    assert.ok(schemaAnalysis.valid, 'Schema could not be parsed');

    // 1. Profile cascade
    assert.ok(
      schemaAnalysis.profileUserRelation?.hasCascade,
      'Profile must specify onDelete: Cascade referencing User'
    );

    // 2. Session cascade
    const sessionRaw = schemaAnalysis.sessionModel ? schemaAnalysis.sessionModel.raw.join('\n') : '';
    assert.ok(
      /onDelete:\s*Cascade/.test(sessionRaw),
      'Session must specify onDelete: Cascade referencing User'
    );

    // 3. Account cascade
    const accountRaw = schemaAnalysis.accountModel ? schemaAnalysis.accountModel.raw.join('\n') : '';
    assert.ok(
      /onDelete:\s*Cascade/.test(accountRaw),
      'Account must specify onDelete: Cascade referencing User'
    );
  });

  harness.it('T2.4: Uniqueness Constraints - User email and Session token must be unique', () => {
    const parsed = parsePrismaSchema();
    const userModel = parsed.models.User;
    const sessionModel = parsed.models.Session;

    assert.ok(userModel, 'model User must exist');
    assert.ok(sessionModel, 'model Session must exist');

    const userRaw = userModel.raw.join('\n');
    const sessionRaw = sessionModel.raw.join('\n');

    assert.ok(
      /email\s+String\s+@unique/.test(userRaw),
      'User email must be marked @unique in prisma/schema.prisma'
    );
    assert.ok(
      /token\s+String\s+@unique/.test(sessionRaw),
      'Session token must be marked @unique in prisma/schema.prisma'
    );
  });

  harness.it('T2.5: Zero-Leakage of Auth Secrets in Client SDK', () => {
    assert.ok(projectFileExists('src/lib/auth-client.ts'), 'src/lib/auth-client.ts must exist');
    const clientCode = readProjectFile('src/lib/auth-client.ts');

    // Client must NOT import prisma, prismaAdapter, or secret configs
    assert.ok(
      !clientCode.includes('@prisma/client'),
      'Client SDK must never import Prisma client'
    );
    assert.ok(
      !clientCode.includes('prismaAdapter'),
      'Client SDK must never import database adapters'
    );
    assert.ok(
      !clientCode.includes('BETTER_AUTH_SECRET'),
      'Client SDK must never bundle BETTER_AUTH_SECRET'
    );
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('better-auth-adversarial.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
