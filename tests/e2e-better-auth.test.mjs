#!/usr/bin/env node
/**
 * Master E2E Better Auth Migration Test Suite
 * 
 * Executes all test tiers for the Better Auth migration:
 * - Tier 1: Feature Contracts (R1: Clerk Zero, R2: Schema & Core, R3: UI & Navbar, R4: API Routes)
 * - Tier 2: Boundary & Adversarial Resilience (Tokens, Cookies, Schema Cascades, Whitelists)
 * - Tier 3: Cross-Feature Interactions (Student Lifecycle, Teacher Approval, Deletion Cascade)
 * - Tier 4: Real-World Workflows & Journeys (RBAC Truth Table, Forensic Audit)
 * 
 * Usage:
 *   node tests/e2e-better-auth.test.mjs
 */

import { runTest as runClerkZero } from './e2e-clerk-zero.test.mjs';
import { runTest as runSchema } from './better-auth-schema.test.mjs';
import { runTest as runCore } from './better-auth-core.test.mjs';
import { runTest as runUi } from './better-auth-ui.test.mjs';
import { runTest as runApiRoutes } from './better-auth-api-routes.test.mjs';
import { runTest as runAdversarial } from './better-auth-adversarial.test.mjs';
import { runTest as runWorkflows } from './better-auth-workflows.test.mjs';

const SUITES = [
  { name: 'Tier 1 [R1 & Acceptance]: Clerk Zero Audit', runner: runClerkZero, tier: 1 },
  { name: 'Tier 1 [R2]: Better Auth Schema & Models', runner: runSchema, tier: 1 },
  { name: 'Tier 1 [R2 & R4]: Core Auth & Middleware', runner: runCore, tier: 1 },
  { name: 'Tier 1 [R3]: Authentication UI & Navbar', runner: runUi, tier: 1 },
  { name: 'Tier 1 [R4]: Protected API Routes & Lifecycles', runner: runApiRoutes, tier: 1 },
  { name: 'Tier 2: Boundary & Adversarial Resilience', runner: runAdversarial, tier: 2 },
  { name: 'Tier 3 & 4: Flows, Workflows & RBAC Matrix', runner: runWorkflows, tier: 4 },
];

export async function runAllSuites() {
  console.log(`\n========================================================================`);
  console.log(`       LEARN QURAN ACADEMY — BETTER AUTH E2E MASTER TEST RUNNER        `);
  console.log(`========================================================================\n`);

  let totalPassed = 0;
  let totalFailed = 0;
  let totalPending = 0;
  let totalTests = 0;
  const suiteResults = [];
  const allErrors = [];

  for (const suite of SUITES) {
    try {
      const res = await suite.runner();
      totalPassed += res.passed;
      totalFailed += res.failed;
      totalPending += res.pending;
      totalTests += res.total;
      suiteResults.push({
        name: suite.name,
        tier: suite.tier,
        passed: res.passed,
        failed: res.failed,
        pending: res.pending,
        total: res.total,
        status: res.failed === 0 ? 'PASS' : 'FAIL',
      });
      if (res.errors && res.errors.length > 0) {
        allErrors.push(...res.errors);
      }
    } catch (err) {
      totalFailed++;
      suiteResults.push({
        name: suite.name,
        tier: suite.tier,
        passed: 0,
        failed: 1,
        pending: 0,
        total: 1,
        status: 'CRASH',
      });
      allErrors.push({ test: suite.name, error: err });
    }
  }

  // Print Executive Summary
  console.log(`\n========================================================================`);
  console.log(`                       EXECUTIVE TEST SUMMARY                           `);
  console.log(`========================================================================`);
  console.log(`Suite Name                                      | Status | Pass | Fail `);
  console.log(`------------------------------------------------+--------+------+------`);
  for (const r of suiteResults) {
    const padName = r.name.padEnd(47, ' ');
    const padStatus = r.status.padEnd(6, ' ');
    const padPass = String(r.passed).padStart(4, ' ');
    const padFail = String(r.failed).padStart(4, ' ');
    console.log(`${padName} | ${padStatus} | ${padPass} | ${padFail}`);
  }
  console.log(`========================================================================`);
  console.log(`TOTAL: ${totalTests} tests | ${totalPassed} PASSED | ${totalFailed} FAILED | ${totalPending} PENDING`);
  console.log(`========================================================================\n`);

  if (allErrors.length > 0) {
    console.log(`FAILURE DETAILS (${allErrors.length} failures):`);
    allErrors.forEach((e, idx) => {
      console.log(`\n[${idx + 1}] ${e.test}`);
      console.log(`    ${e.error.message || e.error}`);
    });
    console.log(`\n`);
  }

  return {
    passed: totalPassed,
    failed: totalFailed,
    pending: totalPending,
    total: totalTests,
    suites: suiteResults,
    errors: allErrors,
  };
}

if (process.argv[1]?.endsWith('e2e-better-auth.test.mjs')) {
  runAllSuites().then((res) => {
    if (res.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}
