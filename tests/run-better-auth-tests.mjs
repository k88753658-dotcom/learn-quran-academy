#!/usr/bin/env node
/**
 * Learn Quran Academy — Better Auth Migration Test Suite CLI Runner
 * 
 * Usage:
 *   node tests/run-better-auth-tests.mjs               # Runs all tiers (Tier 1 - 4)
 *   node tests/run-better-auth-tests.mjs --tier=1      # Runs Tier 1 (Feature Contracts)
 *   node tests/run-better-auth-tests.mjs --tier=2      # Runs Tier 2 (Boundaries & Adversarial)
 *   node tests/run-better-auth-tests.mjs --tier=3      # Runs Tier 3 (Cross-feature Flows)
 *   node tests/run-better-auth-tests.mjs --tier=4      # Runs Tier 4 (Workflows & RBAC Matrix)
 *   node tests/run-better-auth-tests.mjs --suite=zero  # Runs Clerk Zero Audit
 */

import { runTest as runClerkZero } from './e2e-clerk-zero.test.mjs';
import { runTest as runSchema } from './better-auth-schema.test.mjs';
import { runTest as runCore } from './better-auth-core.test.mjs';
import { runTest as runUi } from './better-auth-ui.test.mjs';
import { runTest as runApiRoutes } from './better-auth-api-routes.test.mjs';
import { runTest as runAdversarial } from './better-auth-adversarial.test.mjs';
import { runTest as runWorkflows } from './better-auth-workflows.test.mjs';

const ALL_SUITES = [
  { id: 'zero', name: 'Tier 1: Clerk Zero Footprint Audit', runner: runClerkZero, tier: 1 },
  { id: 'schema', name: 'Tier 1: Better Auth Schema Models', runner: runSchema, tier: 1 },
  { id: 'core', name: 'Tier 1: Better Auth Core Infrastructure', runner: runCore, tier: 1 },
  { id: 'ui', name: 'Tier 1: Better Auth UI Components & Navbar', runner: runUi, tier: 1 },
  { id: 'api', name: 'Tier 1: Protected API Routes & Lifecycles', runner: runApiRoutes, tier: 1 },
  { id: 'adversarial', name: 'Tier 2: Boundary & Adversarial Resilience', runner: runAdversarial, tier: 2 },
  { id: 'workflows', name: 'Tier 3 & 4: Cross-Feature Flows & RBAC Matrix', runner: runWorkflows, tier: 4 },
];

async function main() {
  const args = process.argv.slice(2);
  let suitesToRun = ALL_SUITES;

  const tierArg = args.find((a) => a.startsWith('--tier='));
  const suiteArg = args.find((a) => a.startsWith('--suite='));

  if (tierArg) {
    const tierNum = parseInt(tierArg.split('=')[1], 10);
    if (tierNum === 3 || tierNum === 4) {
      suitesToRun = ALL_SUITES.filter((s) => s.tier === 3 || s.tier === 4);
    } else {
      suitesToRun = ALL_SUITES.filter((s) => s.tier === tierNum);
    }
  } else if (suiteArg) {
    const suiteId = suiteArg.split('=')[1].toLowerCase();
    suitesToRun = ALL_SUITES.filter((s) => s.id === suiteId);
  }

  console.log(`\nStarting Better Auth Migration Test Suite execution (${suitesToRun.length} suites selected)...`);

  let totalPassed = 0;
  let totalFailed = 0;
  let totalPending = 0;

  for (const suite of suitesToRun) {
    const res = await suite.runner();
    totalPassed += res.passed;
    totalFailed += res.failed;
    totalPending += res.pending;
  }

  console.log(`\n======================================================`);
  console.log(`Final Summary: ${totalPassed} passed, ${totalFailed} failed, ${totalPending} pending`);
  console.log(`======================================================\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
