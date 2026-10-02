#!/usr/bin/env node
/**
 * Learn Quran Academy — Master E2E & Requirement-Driven Test Suite Runner
 * 
 * Usage:
 *   node tests/run-all.mjs               # Runs all tiers (Tier 1 - 4)
 *   node tests/run-all.mjs --tier=1      # Runs Tier 1 (Features 1-23)
 *   node tests/run-all.mjs --tier=2      # Runs Tier 2 (Boundaries & Adversarial)
 *   node tests/run-all.mjs --tier=3      # Runs Tier 3 (Cross-feature flows)
 *   node tests/run-all.mjs --tier=4      # Runs Tier 4 (Real-world journeys)
 *   node tests/run-all.mjs --feature=12  # Runs specific feature test
 */

// Tier 1 Imports
import { runTest as runF01 } from './tier1-features/f01-prisma-schema.test.mjs';
import { runTest as runF02 } from './tier1-features/f02-prisma-client.test.mjs';
import { runTest as runF03 } from './tier1-features/f03-neon-script.test.mjs';
import { runTest as runF04 } from './tier1-features/f04-clerk-layout.test.mjs';
import { runTest as runF05 } from './tier1-features/f05-clerk-middleware.test.mjs';
import { runTest as runF06 } from './tier1-features/f06-navbar-auth-state.test.mjs';
import { runTest as runF07 } from './tier1-features/f07-login-register-pages.test.mjs';
import { runTest as runF08 } from './tier1-features/f08-public-courses-api.test.mjs';
import { runTest as runF09 } from './tier1-features/f09-public-teachers-teach-api.test.mjs';
import { runTest as runF10 } from './tier1-features/f10-notifications-tickets-api.test.mjs';
import { runTest as runF11 } from './tier1-features/f11-student-self-attendance-api.test.mjs';
import { runTest as runF12 } from './tier1-features/f12-student-dashboard-api.test.mjs';
import { runTest as runF13 } from './tier1-features/f13-teacher-dashboard-api.test.mjs';
import { runTest as runF14 } from './tier1-features/f14-attendance-management-api.test.mjs';
import { runTest as runF15 } from './tier1-features/f15-manual-payment-verification-api.test.mjs';
import { runTest as runF16 } from './tier1-features/f16-auth-api-handlers.test.mjs';
import { runTest as runF17 } from './tier1-features/f17-admin-stats-dashboard-api.test.mjs';
import { runTest as runF18 } from './tier1-features/f18-admin-user-management-api.test.mjs';
import { runTest as runF19 } from './tier1-features/f19-admin-teacher-applications-api.test.mjs';
import { runTest as runF20 } from './tier1-features/f20-admin-manual-payment-approval-api.test.mjs';
import { runTest as runF21 } from './tier1-features/f21-clean-legacy-supabase.test.mjs';
import { runTest as runF22 } from './tier1-features/f22-build-type-safety.test.mjs';
import { runTest as runF23 } from './tier1-features/f23-e2e-db-verification.test.mjs';

// Tier 2 Imports
import { runTest as runT2Auth } from './tier2-boundaries/auth-matrix-boundaries.test.mjs';
import { runTest as runT2Input } from './tier2-boundaries/input-validation-boundaries.test.mjs';
import { runTest as runT2Schema } from './tier2-boundaries/schema-constraints-boundaries.test.mjs';
import { runTest as runT2Error } from './tier2-boundaries/error-handling-adversarial.test.mjs';
import { runTest as runM3Stress } from './m3-empirical-adversarial.test.mjs';

// Tier 3 Imports
import { runTest as runT3Onboarding } from './tier3-interactions/student-onboarding-payment-flow.test.mjs';
import { runTest as runT3Teacher } from './tier3-interactions/teacher-recruitment-assignment-flow.test.mjs';
import { runTest as runT3Attendance } from './tier3-interactions/attendance-logging-aggregation-flow.test.mjs';
import { runTest as runT3Reconciliation } from './tier3-interactions/billing-ticket-reconciliation-flow.test.mjs';

// Tier 4 Imports
import { runTest as runT4Term } from './tier4-workflows/full-academic-term-journey.test.mjs';
import { runTest as runT4RBAC } from './tier4-workflows/multi-role-access-control-matrix.test.mjs';
import { runTest as runT4Recovery } from './tier4-workflows/disaster-recovery-edge-cases.test.mjs';

const TIER_1_MAP = {
  1: { name: 'F01: Complete Prisma Schema', runner: runF01 },
  2: { name: 'F02: Prisma Singleton Client', runner: runF02 },
  3: { name: 'F03: Neon DB Verification Script', runner: runF03 },
  4: { name: 'F04: Clerk Provider Root Layout', runner: runF04 },
  5: { name: 'F05: Clerk Route Protection Middleware', runner: runF05 },
  6: { name: 'F06: Navbar & Client Auth State', runner: runF06 },
  7: { name: 'F07: Login & Register Pages', runner: runF07 },
  8: { name: 'F08: Public Courses API', runner: runF08 },
  9: { name: 'F09: Public Teachers & Teach API', runner: runF09 },
  10: { name: 'F10: Notifications & Tickets API', runner: runF10 },
  11: { name: 'F11: Student Self-Attendance API', runner: runF11 },
  12: { name: 'F12: Student Dashboard API Routes', runner: runF12 },
  13: { name: 'F13: Teacher Dashboard API Routes', runner: runF13 },
  14: { name: 'F14: Attendance Management API', runner: runF14 },
  15: { name: 'F15: Manual Payment Verification API', runner: runF15 },
  16: { name: 'F16: Auth API Handlers', runner: runF16 },
  17: { name: 'F17: Admin Stats & Dashboards API', runner: runF17 },
  18: { name: 'F18: Admin User Management API', runner: runF18 },
  19: { name: 'F19: Admin Teacher Applications API', runner: runF19 },
  20: { name: 'F20: Admin Manual Payment Approval API', runner: runF20 },
  21: { name: 'F21: Clean Legacy Supabase & Unused Deps', runner: runF21 },
  22: { name: 'F22: Build Compilation & Type Safety', runner: runF22 },
  23: { name: 'F23: E2E DB Verification Execution', runner: runF23 },
};

const TIER_2_LIST = [
  { name: 'T2.Auth: Auth Matrix Boundaries', runner: runT2Auth },
  { name: 'T2.Input: Input Validation & Adversarial', runner: runT2Input },
  { name: 'T2.Schema: Schema Constraints & Integrity', runner: runT2Schema },
  { name: 'T2.Error: Error Handling & Resiliency', runner: runT2Error },
  { name: 'T2.M3Stress: Milestone 3 Empirical Adversarial Suite', runner: runM3Stress },
];

const TIER_3_LIST = [
  { name: 'T3.Onboarding: Student Onboarding Flow', runner: runT3Onboarding },
  { name: 'T3.Teacher: Teacher Recruitment Flow', runner: runT3Teacher },
  { name: 'T3.Attendance: Attendance Aggregation Flow', runner: runT3Attendance },
  { name: 'T3.Reconciliation: Billing Reconciliation Flow', runner: runT3Reconciliation },
];

const TIER_4_LIST = [
  { name: 'T4.Term: Full Academic Term Journey', runner: runT4Term },
  { name: 'T4.RBAC: Multi-Role Access Control Matrix', runner: runT4RBAC },
  { name: 'T4.Recovery: Disaster Recovery & Cascade Integrity', runner: runT4Recovery },
];

async function main() {
  const args = process.argv.slice(2);
  const tierArg = args.find((a) => a.startsWith('--tier='));
  const featureArg = args.find((a) => a.startsWith('--feature='));

  const selectedTier = tierArg ? tierArg.split('=')[1] : null;
  const selectedFeature = featureArg ? parseInt(featureArg.split('=')[1], 10) : null;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     LEARN QURAN ACADEMY — E2E TEST SUITE RUNNER            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Execution Mode: ${selectedFeature ? `Feature ${selectedFeature}` : selectedTier ? `Tier ${selectedTier}` : 'All Tiers (1 to 4)'}`);
  console.log(`Started At: ${new Date().toISOString()}\n`);

  let totalPassed = 0;
  let totalFailed = 0;
  let totalPending = 0;
  let totalTests = 0;
  const tierStats = [];

  const runTierGroup = async (tierName, testList) => {
    let tPassed = 0;
    let tFailed = 0;
    let tPending = 0;
    let tTotal = 0;

    console.log(`\n>>> STARTING ${tierName} <<<`);
    for (const testItem of testList) {
      try {
        const result = await testItem.runner();
        tPassed += result.passed;
        tFailed += result.failed;
        tPending += result.pending;
        tTotal += result.total;
      } catch (err) {
        console.error(`Unexpected suite error in ${testItem.name}:`, err);
        tFailed++;
        tTotal++;
      }
    }

    tierStats.push({ tier: tierName, passed: tPassed, failed: tFailed, pending: tPending, total: tTotal });
    totalPassed += tPassed;
    totalFailed += tFailed;
    totalPending += tPending;
    totalTests += tTotal;
  };

  if (selectedFeature) {
    const feat = TIER_1_MAP[selectedFeature];
    if (!feat) {
      console.error(`Invalid feature number: ${selectedFeature}. Must be 1 to 23.`);
      process.exit(1);
    }
    await runTierGroup(`Feature ${selectedFeature}: ${feat.name}`, [feat]);
  } else if (selectedTier) {
    if (selectedTier === '1') {
      await runTierGroup('TIER 1: Feature Coverage (F01 - F23)', Object.values(TIER_1_MAP));
    } else if (selectedTier === '2') {
      await runTierGroup('TIER 2: Boundaries & Error Conditions', TIER_2_LIST);
    } else if (selectedTier === '3') {
      await runTierGroup('TIER 3: Cross-Feature Interactions', TIER_3_LIST);
    } else if (selectedTier === '4') {
      await runTierGroup('TIER 4: Real-World Workflows', TIER_4_LIST);
    } else {
      console.error(`Invalid tier: ${selectedTier}. Supported: 1, 2, 3, 4.`);
      process.exit(1);
    }
  } else {
    // Run all
    await runTierGroup('TIER 1: Feature Coverage (F01 - F23)', Object.values(TIER_1_MAP));
    await runTierGroup('TIER 2: Boundaries & Error Conditions', TIER_2_LIST);
    await runTierGroup('TIER 3: Cross-Feature Interactions', TIER_3_LIST);
    await runTierGroup('TIER 4: Real-World Workflows', TIER_4_LIST);
  }

  // Print Executive Summary Table
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                      E2E TEST SUITE EXECUTION SUMMARY                      ║');
  console.log('╠════════════════════════════════════════════════════════════════════════════╣');
  for (const s of tierStats) {
    const line = `║ ${s.tier.padEnd(42)} | Pass: ${String(s.passed).padStart(3)} | Fail: ${String(s.failed).padStart(3)} | Total: ${String(s.total).padStart(3)} ║`;
    console.log(line);
  }
  console.log('╠════════════════════════════════════════════════════════════════════════════╣');
  const totalLine = `║ OVERALL TOTAL                            | Pass: ${String(totalPassed).padStart(3)} | Fail: ${String(totalFailed).padStart(3)} | Total: ${String(totalTests).padStart(3)} ║`;
  console.log(totalLine);
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  if (totalFailed > 0) {
    console.log(`\n❌ Status: FAILED (${totalFailed} failed assertions)`);
    process.exit(1);
  } else {
    console.log(`\n✅ Status: PASSED (All ${totalPassed} test assertions passed successfully)`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
