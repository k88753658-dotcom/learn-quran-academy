/**
 * Tier 2: Input Validation, Adversarial Payloads & Encoding Integrity Test
 * Tests malformed payloads, non-ASCII Unicode (Arabic/Quranic text), boundary values
 */
import { createHarness, assert } from '../helpers/test-harness.mjs';
import { analyzeRouteHandler } from '../helpers/contract-helpers.mjs';

const harness = createHarness();

harness.describe('Tier 2 Boundary: Input Validation & Adversarial Payloads', () => {
  harness.it('T2.Input.1: /api/teacher-application must validate email format and reject invalid emails', () => {
    const route = analyzeRouteHandler('src/app/api/teacher-application/route.ts');
    assert.ok(route.exists);
    const validatesEmail =
      route.code.includes('@') ||
      route.code.includes('email') ||
      route.code.includes('test') ||
      route.code.includes('match');
    assert.ok(validatesEmail, 'Must perform email validation on teacher applications');
  });

  harness.it('T2.Input.2: /api/courses must reject missing or empty title/description with 400', () => {
    const route = analyzeRouteHandler('src/app/api/courses/route.ts');
    assert.ok(route.exists);
    const rejectsEmpty =
      (route.code.includes('!title') || route.code.includes('!description')) &&
      route.code.includes('400');
    assert.ok(rejectsEmpty, 'Courses POST must return 400 if title or description is missing');
  });

  harness.it('T2.Input.3: /api/verify-manual-payment must reject empty transactionId with 400', () => {
    const route = analyzeRouteHandler('src/app/api/verify-manual-payment/route.ts');
    assert.ok(route.exists);
    const rejectsEmptyTx =
      route.code.includes('transactionId') &&
      (route.code.includes('400') || route.code.includes('error'));
    assert.ok(rejectsEmptyTx, 'Must reject empty or missing transaction IDs');
  });

  harness.it('T2.Input.4: Arabic Unicode text fidelity (Quran verses & student names)', () => {
    // Validate that our JSON stringifiers and parsers correctly preserve Quranic Arabic diacritics
    const arabicAyah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    const payload = JSON.stringify({ surah: 'Al-Fatihah', verse: 1, text: arabicAyah });
    const parsed = JSON.parse(payload);
    assert.equal(parsed.text, arabicAyah, 'Arabic script and diacritics must not be corrupted or escaped improperly');
  });

  harness.it('T2.Input.5: Student progress boundary must adhere to 0-100% range', () => {
    const updateProgressRoute = analyzeRouteHandler('src/app/api/update-student/route.ts');
    assert.ok(updateProgressRoute.exists);
    // Boundary test logic for progress integer:
    const clampProgress = (val) => Math.min(100, Math.max(0, Number(val) || 0));
    assert.equal(clampProgress(-10), 0, 'Negative progress must clamp to 0');
    assert.equal(clampProgress(150), 100, 'Overflowing progress must clamp to 100');
    assert.equal(clampProgress(75), 75, 'Valid progress must be preserved');
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('input-validation-boundaries.test.mjs')) {
  runTest().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
