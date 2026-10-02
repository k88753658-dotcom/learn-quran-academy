/**
 * Milestone 2 Empirical Adversarial & Route Protection Challenge Test Suite
 * Conducted by Challenger M2-1 (teamwork_preview_challenger)
 *
 * Verifies Clerk middleware routing in `src/middleware.ts` across:
 * 1. Public Marketing Routes
 * 2. Public API Routes
 * 3. Protected Portal Routes & RBAC Authorization Matrix
 * 4. Static Asset Exclusions (config.matcher regex)
 * 5. Adversarial URL Bypass Vectors (wildcard pollution, traversal, prefix collision, case sensitivity)
 */

import { createHarness, assert } from './helpers/test-harness.mjs';
import { createMockNextRequest, createMockClerkAuth } from './helpers/mock-context.mjs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createRouteMatcher } = require('@clerk/nextjs/server');

const harness = createHarness();

// Reconstruct exact route matchers from src/middleware.ts
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/courses(.*)",
  "/pricing(.*)",
  "/teach(.*)",
  "/kids(.*)",
  "/countries(.*)",
  "/blog(.*)",
  "/teachers(.*)",
  "/payment-terminal(.*)",
  "/student-portal(.*)",
  "/api/public-teachers(.*)",
  "/api/courses(.*)",
  "/api/contact(.*)",
  "/api/register(.*)",
  "/api/teacher-application(.*)",
  "/api/student-profile(.*)",
  "/api/live-session(.*)",
  "/api/student-self-attendance(.*)",
  "/api/verify-manual-payment(.*)",
  "/api/webhooks(.*)",
  "/api/chat(.*)",
  "/api/cron(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

// Helper simulating middleware execution logic from src/middleware.ts
async function simulateMiddleware(path, authContext) {
  const request = createMockNextRequest(path);
  
  if (isPublicRoute(request)) {
    return { action: 'next', status: 200, location: null, public: true };
  }

  const { userId, sessionClaims } = authContext;

  if (!userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", request.url);
    return {
      action: 'redirect',
      status: 307,
      location: loginUrl.toString(),
      targetPath: loginUrl.pathname,
      redirectParam: loginUrl.searchParams.get("redirect_url"),
      public: false,
    };
  }

  const role = sessionClaims?.metadata?.role || "student";

  // Enforce role-based access control
  if (isAdminRoute(request) && role !== "admin") {
    const target = new URL("/dashboard", request.url);
    return { action: 'redirect', status: 307, location: target.toString(), targetPath: '/dashboard', public: false };
  }

  if (isTeacherRoute(request) && role !== "teacher" && role !== "admin") {
    const target = new URL("/dashboard", request.url);
    return { action: 'redirect', status: 307, location: target.toString(), targetPath: '/dashboard', public: false };
  }

  if (isDashboardRoute(request) && role !== "student" && role !== "teacher" && role !== "admin") {
    const target = new URL("/login", request.url);
    return { action: 'redirect', status: 307, location: target.toString(), targetPath: '/login', public: false };
  }

  return { action: 'next', status: 200, location: null, public: false };
}

// Config.matcher regex test from src/middleware.ts
const configMatcherRegex = [
  new RegExp("^/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)$"),
  new RegExp("^/(api|trpc)(.*)$"),
];

function isMiddlewareInvoked(pathname) {
  return configMatcherRegex.some((rx) => rx.test(pathname));
}

// =========================================================================
// SUITE 1: Public Marketing Routes Coverage
// =========================================================================
harness.describe('Suite 1: Public Marketing Routes Matching', () => {
  const publicRoutes = [
    '/',
    '/login',
    '/login/sso-callback',
    '/register',
    '/about',
    '/about/mission',
    '/contact',
    '/courses',
    '/courses/quran-reading',
    '/pricing',
    '/teach',
    '/kids',
    '/countries',
    '/blog',
    '/blog/learn-tajweed',
    '/teachers',
    '/payment-terminal',
    '/student-portal',
  ];

  for (const path of publicRoutes) {
    harness.it(`1.1: Public marketing route '${path}' should match isPublicRoute`, () => {
      const req = createMockNextRequest(path);
      assert.equal(isPublicRoute(req), true, `Route ${path} must be recognized as public`);
    });

    harness.it(`1.2: Public marketing route '${path}' should allow unauthenticated access`, async () => {
      const unauth = createMockClerkAuth(null);
      const res = await simulateMiddleware(path, unauth);
      assert.equal(res.action, 'next', `Route ${path} should return next() for unauthenticated callers`);
    });
  }
});

// =========================================================================
// SUITE 2: Public API Routes Coverage
// =========================================================================
harness.describe('Suite 2: Public API Routes Matching', () => {
  const publicApiRoutes = [
    '/api/public-teachers',
    '/api/courses',
    '/api/contact',
    '/api/register',
    '/api/teacher-application',
    '/api/student-profile',
    '/api/live-session',
    '/api/student-self-attendance',
    '/api/verify-manual-payment',
    '/api/webhooks',
    '/api/webhooks/clerk',
    '/api/chat',
    '/api/cron',
  ];

  for (const apiPath of publicApiRoutes) {
    harness.it(`2.1: Public API route '${apiPath}' should match isPublicRoute`, () => {
      const req = createMockNextRequest(apiPath);
      assert.equal(isPublicRoute(req), true, `API route ${apiPath} must match isPublicRoute`);
    });

    harness.it(`2.2: Public API route '${apiPath}' should pass through without auth redirect`, async () => {
      const unauth = createMockClerkAuth(null);
      const res = await simulateMiddleware(apiPath, unauth);
      assert.equal(res.action, 'next', `API route ${apiPath} must not be blocked with 307 redirect`);
    });
  }
});

// =========================================================================
// SUITE 3: Protected Routes & RBAC Authorization Matrix
// =========================================================================
harness.describe('Suite 3: Protected Portal Routes & RBAC Matrix', () => {
  // --- Admin Routes ---
  harness.it('3.1: /admin must be recognized as an admin route', () => {
    const req = createMockNextRequest('/admin');
    assert.equal(isAdminRoute(req), true);
  });

  harness.it('3.2: /admin/dashboard must be recognized as an admin route', () => {
    const req = createMockNextRequest('/admin/dashboard');
    assert.equal(isAdminRoute(req), true);
  });

  harness.it('3.3: /admin should redirect unauthenticated request to /login', async () => {
    const unauth = createMockClerkAuth(null);
    const res = await simulateMiddleware('/admin/dashboard', unauth);
    assert.equal(res.action, 'redirect');
    assert.equal(res.targetPath, '/login');
    assert.ok(res.redirectParam.includes('/admin/dashboard'));
  });

  harness.it('3.4: /admin should redirect student role to /dashboard', async () => {
    const student = createMockClerkAuth('user_student_1', 'student');
    const res = await simulateMiddleware('/admin/dashboard', student);
    assert.equal(res.action, 'redirect');
    assert.equal(res.targetPath, '/dashboard');
  });

  harness.it('3.5: /admin should redirect teacher role to /dashboard', async () => {
    const teacher = createMockClerkAuth('user_teacher_1', 'teacher');
    const res = await simulateMiddleware('/admin/dashboard', teacher);
    assert.equal(res.action, 'redirect');
    assert.equal(res.targetPath, '/dashboard');
  });

  harness.it('3.6: /admin should allow admin role to proceed', async () => {
    const admin = createMockClerkAuth('user_admin_1', 'admin');
    const res = await simulateMiddleware('/admin/dashboard', admin);
    assert.equal(res.action, 'next');
  });

  // --- Dashboard (Student) Routes ---
  harness.it('3.7: /dashboard must be recognized as dashboard route', () => {
    const req = createMockNextRequest('/dashboard');
    assert.equal(isDashboardRoute(req), true);
  });

  harness.it('3.8: /dashboard should redirect unauthenticated request to /login', async () => {
    const unauth = createMockClerkAuth(null);
    const res = await simulateMiddleware('/dashboard', unauth);
    assert.equal(res.action, 'redirect');
    assert.equal(res.targetPath, '/login');
  });

  harness.it('3.9: /dashboard should allow student role', async () => {
    const student = createMockClerkAuth('user_student_1', 'student');
    const res = await simulateMiddleware('/dashboard', student);
    assert.equal(res.action, 'next');
  });

  harness.it('3.10: /dashboard should allow teacher role', async () => {
    const teacher = createMockClerkAuth('user_teacher_1', 'teacher');
    const res = await simulateMiddleware('/dashboard', teacher);
    assert.equal(res.action, 'next');
  });

  harness.it('3.11: /dashboard should allow admin role', async () => {
    const admin = createMockClerkAuth('user_admin_1', 'admin');
    const res = await simulateMiddleware('/dashboard', admin);
    assert.equal(res.action, 'next');
  });

  // --- Teacher Portal Routes (CRITICAL CHALLENGE) ---
  harness.it('3.12: isTeacherRoute should match /teacher/dashboard', () => {
    const req = createMockNextRequest('/teacher/dashboard');
    assert.equal(isTeacherRoute(req), true);
  });

  harness.it('3.13: /teacher/dashboard MUST NOT be classified as public', () => {
    const req = createMockNextRequest('/teacher/dashboard');
    const isPublic = isPublicRoute(req);
    // VULNERABILITY CHECK: If '/teach(.*)' greedily matches '/teacher/dashboard', this will FAIL
    assert.equal(isPublic, false, "CRITICAL DEFECT: /teacher/dashboard is erroneously classified as isPublicRoute due to '/teach(.*)' pattern collision!");
  });

  harness.it('3.14: /teacher/dashboard MUST redirect unauthenticated requests to /login', async () => {
    const unauth = createMockClerkAuth(null);
    const res = await simulateMiddleware('/teacher/dashboard', unauth);
    assert.equal(res.action, 'redirect', "CRITICAL DEFECT: Unauthenticated request to /teacher/dashboard was NOT redirected!");
    assert.equal(res.targetPath, '/login');
  });

  harness.it('3.15: /teacher/dashboard MUST forbid/redirect student role to /dashboard', async () => {
    const student = createMockClerkAuth('user_student_1', 'student');
    const res = await simulateMiddleware('/teacher/dashboard', student);
    assert.equal(res.action, 'redirect', "CRITICAL DEFECT: Student role accessed /teacher/dashboard without redirect!");
    assert.equal(res.targetPath, '/dashboard');
  });

  harness.it('3.16: /teacher/dashboard should allow teacher role', async () => {
    const teacher = createMockClerkAuth('user_teacher_1', 'teacher');
    const res = await simulateMiddleware('/teacher/dashboard', teacher);
    assert.equal(res.action, 'next');
  });

  harness.it('3.17: /teacher/dashboard should allow admin role', async () => {
    const admin = createMockClerkAuth('user_admin_1', 'admin');
    const res = await simulateMiddleware('/teacher/dashboard', admin);
    assert.equal(res.action, 'next');
  });
});

// =========================================================================
// SUITE 4: Static Asset Exclusions (config.matcher)
// =========================================================================
harness.describe('Suite 4: Static Asset Exclusions (config.matcher)', () => {
  const excludedAssets = [
    '/_next/static/chunks/main.js',
    '/_next/static/css/app.css',
    '/favicon.ico',
    '/logo.png',
    '/hero.jpg',
    '/banner.webp',
    '/illustration.svg',
    '/font.woff2',
    '/font.ttf',
    '/styles.css',
    '/site.webmanifest',
    '/document.pdf', // Wait, is pdf excluded? Let's check regex!
  ];

  for (const asset of excludedAssets) {
    if (asset.endsWith('.pdf')) {
      // PDF is not in the regex extension list: (?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)
      harness.it(`4.1: Asset '${asset}' behavior according to config.matcher`, () => {
        const matched = isMiddlewareInvoked(asset);
        // Note: pdf is not in the exclusion list, so it will invoke middleware
        assert.equal(typeof matched, 'boolean');
      });
      continue;
    }
    harness.it(`4.2: Static asset '${asset}' should be EXCLUDED from middleware`, () => {
      const matched = isMiddlewareInvoked(asset);
      assert.equal(matched, false, `Static asset ${asset} must NOT invoke middleware`);
    });
  }

  const includedEndpoints = [
    '/',
    '/admin/dashboard',
    '/teacher/dashboard',
    '/dashboard',
    '/api/courses',
    '/api/admin-stats',
    '/api/teacher-dashboard',
    '/trpc/example',
  ];

  for (const endpoint of includedEndpoints) {
    harness.it(`4.3: App route '${endpoint}' MUST be processed by middleware`, () => {
      const matched = isMiddlewareInvoked(endpoint);
      assert.equal(matched, true, `Route ${endpoint} MUST be intercepted by middleware`);
    });
  }
});

// =========================================================================
// SUITE 5: Adversarial Attacks & URL Bypass Scenarios
// =========================================================================
harness.describe('Suite 5: Adversarial Attacks & URL Bypass Scenarios', () => {
  // Test 5.1: Greedy Wildcard Collisions
  harness.it('5.1: Path prefix collision: /teachers vs /teacher', () => {
    // Both /teachers and /teacher exist in project
    // /teachers is public, /teacher is protected
    const reqTeachers = createMockNextRequest('/teachers');
    const reqTeacher = createMockNextRequest('/teacher');
    const reqTeacherDash = createMockNextRequest('/teacher/dashboard');
    
    assert.equal(isPublicRoute(reqTeachers), true, '/teachers must be public');
    assert.equal(isPublicRoute(reqTeacher), false, "VULNERABILITY: /teacher matched as public due to '/teach(.*)'!");
    assert.equal(isPublicRoute(reqTeacherDash), false, "VULNERABILITY: /teacher/dashboard matched as public due to '/teach(.*)'!");
  });

  harness.it('5.2: Path prefix collision: /teach vs /teacher-dashboard', () => {
    const req = createMockNextRequest('/teacher-dashboard');
    assert.equal(isPublicRoute(req), false, "VULNERABILITY: /teacher-dashboard matched as public due to '/teach(.*)'!");
  });

  harness.it('5.3: Path prefix collision: /teach vs /teaching', () => {
    const req = createMockNextRequest('/teaching');
    // If /teaching is an unassigned route, should it be public?
    // With '/teach(.*)', ANY path starting with /teach is made public
    const matches = isPublicRoute(req);
    // Document whether greedy wildcard unintentionally leaks /teaching
    assert.equal(matches, false, "Greedy '/teach(.*)' erroneously matched /teaching");
  });

  harness.it('5.4: Trailing slash variations: /admin/ vs /admin', async () => {
    const unauth = createMockClerkAuth(null);
    const resSlash = await simulateMiddleware('/admin/', unauth);
    const resNoSlash = await simulateMiddleware('/admin', unauth);
    assert.equal(resSlash.action, 'redirect');
    assert.equal(resNoSlash.action, 'redirect');
  });

  harness.it('5.5: Double slash path bypass attempt: /admin//dashboard', () => {
    // Clerk's normalizePath collapses consecutive slashes in pathname
    const req = createMockNextRequest('/admin//dashboard');
    assert.equal(isAdminRoute(req), true, 'Consecutive slashes in path must still match isAdminRoute');
  });

  harness.it('5.6: Case sensitivity attack: /Admin/dashboard and /ADMIN', () => {
    // Notice: URL paths in HTTP can be case-sensitive or insensitive depending on host/router
    const reqLower = createMockNextRequest('/admin/dashboard');
    const reqUpper = createMockNextRequest('/Admin/dashboard');
    const matchesLower = isAdminRoute(reqLower);
    const matchesUpper = isAdminRoute(reqUpper);
    
    // In Clerk path-to-regexp, regex is case-sensitive by default unless (?i) or options set
    // Check whether /Admin matches isAdminRoute
    console.log(`    [Observation] isAdminRoute('/admin/dashboard'): ${matchesLower}, isAdminRoute('/Admin/dashboard'): ${matchesUpper}`);
  });

  harness.it('5.7: Session claims mismatch: publicMetadata vs metadata (Admin Lockout)', async () => {
    // Navbar.tsx reads user.publicMetadata.role. If Clerk JWT passes publicMetadata, middleware must recognize it.
    const adminWithPublicMetadata = {
      userId: 'user_admin_pm',
      sessionClaims: {
        sub: 'user_admin_pm',
        publicMetadata: { role: 'admin' }, // Notice: publicMetadata, not metadata!
      },
    };

    // Simulate current middleware logic
    const currentMiddlewareRole = adminWithPublicMetadata.sessionClaims?.metadata?.role || "student";
    // Observe: current middleware resolves this to 'student'!
    assert.equal(currentMiddlewareRole, 'student', "DEFECT CONFIRMED: Current middleware ignores publicMetadata.role and falls back to 'student'");

    // If role resolves to 'student', admin is locked out and redirected to /dashboard:
    const res = await simulateMiddleware('/admin/dashboard', adminWithPublicMetadata);
    assert.equal(res.targetPath, '/dashboard', "DEFECT CONFIRMED: Admin with publicMetadata.role is redirected to /dashboard instead of accessing /admin");
  });

  harness.it('5.8: Proposed pattern fix verification: /teach vs /teacher/dashboard isolation', () => {
    // Verify that safe, boundary-delimited patterns fix the vulnerability
    const safePublicMatcher = createRouteMatcher([
      "/",
      "/login(.*)",
      "/register(.*)",
      "/about(.*)",
      "/contact(.*)",
      "/courses(.*)",
      "/pricing(.*)",
      "/teach",          // Exact match
      "/teach/(.*)",     // Subpaths under /teach/
      "/kids(.*)",
      "/countries(.*)",
      "/blog(.*)",
      "/teachers",       // Exact match
      "/teachers/(.*)",  // Subpaths under /teachers/
      "/payment-terminal(.*)",
      "/student-portal(.*)",
      "/api/public-teachers(.*)",
      "/api/courses(.*)",
      "/api/contact(.*)",
      "/api/register(.*)",
      "/api/teacher-application(.*)",
      "/api/student-profile(.*)",
      "/api/live-session(.*)",
      "/api/student-self-attendance(.*)",
      "/api/verify-manual-payment(.*)",
      "/api/webhooks(.*)",
      "/api/chat(.*)",
      "/api/cron(.*)",
    ]);

    const reqTeach = createMockNextRequest('/teach');
    const reqTeachApply = createMockNextRequest('/teach/apply');
    const reqTeachers = createMockNextRequest('/teachers');
    const reqTeachersList = createMockNextRequest('/teachers/all');
    const reqTeacher = createMockNextRequest('/teacher');
    const reqTeacherDash = createMockNextRequest('/teacher/dashboard');
    const reqTeacherStudents = createMockNextRequest('/teacher/students');

    // Safe matcher permits public marketing pages:
    assert.equal(safePublicMatcher(reqTeach), true, '/teach must be public');
    assert.equal(safePublicMatcher(reqTeachApply), true, '/teach/apply must be public');
    assert.equal(safePublicMatcher(reqTeachers), true, '/teachers must be public');
    assert.equal(safePublicMatcher(reqTeachersList), true, '/teachers/all must be public');

    // Safe matcher PREVENTS teacher portal bypass:
    assert.equal(safePublicMatcher(reqTeacher), false, '/teacher must NOT match public matcher');
    assert.equal(safePublicMatcher(reqTeacherDash), false, '/teacher/dashboard must NOT match public matcher');
    assert.equal(safePublicMatcher(reqTeacherStudents), false, '/teacher/students must NOT match public matcher');
  });

  harness.it('5.9: Protected API route unauthenticated access: /api/admin-stats', async () => {
    const unauth = createMockClerkAuth(null);
    const res = await simulateMiddleware('/api/admin-stats', unauth);
    assert.equal(res.action, 'redirect', 'Unauthenticated call to /api/admin-stats should be blocked or redirected');
  });

  harness.it('5.10: Protected API route role escalation: student calling /api/admin-stats', async () => {
    const student = createMockClerkAuth('user_student_1', 'student');
    const res = await simulateMiddleware('/api/admin-stats', student);
    console.log(`    [Observation] Student access to /api/admin-stats in middleware: action=${res.action}`);
  });
});

export async function runTest() {
  return await harness.run();
}

if (process.argv[1]?.endsWith('m2-middleware-adversarial.test.mjs')) {
  runTest().then((res) => {
    console.log(`\nAdversarial Test Suite Finished. Total Passed: ${res.passed}, Total Failed: ${res.failed}`);
    // We don't exit(1) immediately here so caller can inspect full empirical output
  });
}
