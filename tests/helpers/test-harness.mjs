/**
 * Test Harness Utility for Learn Quran Academy Test Suite
 * Zero-dependency, compatible with standard Node.js (18, 20, 22+)
 */
import assert from 'node:assert/strict';

export { assert };

class TestSuiteHarness {
  constructor() {
    this.tests = [];
    this.currentSuite = 'Default Suite';
    this.passed = 0;
    this.failed = 0;
    this.pending = 0;
    this.errors = [];
  }

  describe(name, fn) {
    const prevSuite = this.currentSuite;
    this.currentSuite = name;
    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  it(name, fn, options = {}) {
    this.tests.push({
      suite: this.currentSuite,
      name,
      fn,
      options,
    });
  }

  pendingTest(name, reason = 'Milestone not yet implemented') {
    this.tests.push({
      suite: this.currentSuite,
      name,
      fn: null,
      options: { pending: true, reason },
    });
  }

  async run() {
    console.log(`\n======================================================`);
    console.log(`  Executing: ${this.currentSuite}`);
    console.log(`======================================================\n`);

    for (const test of this.tests) {
      const fullTestName = `[${test.suite}] -> ${test.name}`;
      if (test.options.pending || !test.fn) {
        this.pending++;
        console.log(`  [-] PENDING: ${fullTestName} (${test.options.reason || 'Pending implementation'})`);
        continue;
      }

      try {
        await test.fn();
        this.passed++;
        console.log(`  [✓] PASS: ${fullTestName}`);
      } catch (err) {
        this.failed++;
        console.error(`  [✗] FAIL: ${fullTestName}`);
        console.error(`      Error: ${err.message}`);
        this.errors.push({ test: fullTestName, error: err });
      }
    }

    console.log(`\n------------------------------------------------------`);
    console.log(`Results: ${this.passed} passed, ${this.failed} failed, ${this.pending} pending (Total: ${this.tests.length})`);
    console.log(`------------------------------------------------------\n`);

    return {
      passed: this.passed,
      failed: this.failed,
      pending: this.pending,
      total: this.tests.length,
      errors: this.errors,
    };
  }
}

export function createHarness() {
  return new TestSuiteHarness();
}
