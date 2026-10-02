# Milestone M2 Challenger Report: Clerk Middleware Routing Adversarial Verification

**Agent**: Challenger M2-1 (`teamwork_preview_challenger`)  
**Verdict**: ❌ **REQUEST_CHANGES**  
**Target File**: `src/middleware.ts`  
**Test Suite**: `tests/m2-middleware-adversarial.test.mjs` (109 assertions: 103 passed, 6 failed)

---

## 1. Observation

### 1.1 Direct Source Code Observations in `src/middleware.ts`
- **Lines 4–31 (`isPublicRoute`)**:
  ```ts
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
    ...
  ]);
  ```
- **Lines 33–35 (Protected Route Matchers)**:
  ```ts
  const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
  const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);
  const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
  ```
- **Lines 37–40 (Public Pass-Through Precedence)**:
  ```ts
  export default clerkMiddleware(async (auth, request) => {
    if (isPublicRoute(request)) {
      return NextResponse.next();
    }
  ```
- **Line 50 (Role Claim Extraction)**:
  ```ts
  const role = (sessionClaims?.metadata as any)?.role || "student";
  ```
- **Lines 44–47 (Unauthenticated Redirect for API Routes)**:
  ```ts
  if (!userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(loginUrl);
  }
  ```

### 1.2 Inconsistency with `src/components/Navbar.tsx`
- **Line 22 in `src/components/Navbar.tsx`**:
  ```ts
  const role = (user?.publicMetadata?.role as string) || (typeof window !== "undefined" ? localStorage.getItem("user_role") : null);
  ```
  Navbar extracts the role from `user.publicMetadata.role`, whereas `src/middleware.ts` checks only `sessionClaims?.metadata?.role`.

### 1.3 Verbatim Empirical Test Failures (`tests/m2-middleware-adversarial.test.mjs`)
Executing `node tests/m2-middleware-adversarial.test.mjs` resulted in:
```
  [✗] FAIL: [Suite 3: Protected Portal Routes & RBAC Matrix] -> 3.13: /teacher/dashboard MUST NOT be classified as public
      Error: CRITICAL DEFECT: /teacher/dashboard is erroneously classified as isPublicRoute due to '/teach(.*)' pattern collision!
      true !== false

  [✗] FAIL: [Suite 3: Protected Portal Routes & RBAC Matrix] -> 3.14: /teacher/dashboard MUST redirect unauthenticated requests to /login
      Error: CRITICAL DEFECT: Unauthenticated request to /teacher/dashboard was NOT redirected!
      + actual: 'next'
      - expected: 'redirect'

  [✗] FAIL: [Suite 3: Protected Portal Routes & RBAC Matrix] -> 3.15: /teacher/dashboard MUST forbid/redirect student role to /dashboard
      Error: CRITICAL DEFECT: Student role accessed /teacher/dashboard without redirect!
      + actual: 'next'
      - expected: 'redirect'

  [✗] FAIL: [Suite 5: Adversarial Attacks & URL Bypass Scenarios] -> 5.1: Path prefix collision: /teachers vs /teacher
      Error: VULNERABILITY: /teacher matched as public due to '/teach(.*)'!
      true !== false

  [✗] FAIL: [Suite 5: Adversarial Attacks & URL Bypass Scenarios] -> 5.2: Path prefix collision: /teach vs /teacher-dashboard
      Error: VULNERABILITY: /teacher-dashboard matched as public due to '/teach(.*)'!
      true !== false

  [✗] FAIL: [Suite 5: Adversarial Attacks & URL Bypass Scenarios] -> 5.3: Path prefix collision: /teach vs /teaching
      Error: Greedy '/teach(.*)' erroneously matched /teaching
      true !== false

Results: 103 passed, 6 failed, 0 pending (Total: 109)
```

---

## 2. Logic Chain

### 2.1 Critical Vulnerability: Complete Authentication Bypass of Teacher Portal
1. **Observation 1.1**: `isPublicRoute` includes the pattern `"/teach(.*)"`.
2. **Observation 1.1**: `createRouteMatcher` compiles string route patterns via `path-to-regexp`. A pattern of `"/teach(.*)"` translates to `^\/teach(.*)`.
3. Because there is no trailing delimiter or slash boundary between `/teach` and `(.*)`, the regex matches ANY path that begins with the character sequence `/teach`, including `/teacher`, `/teacher/dashboard`, `/teacher/students`, and `/teacher-dashboard`.
4. **Observation 1.1**: The middleware checks `if (isPublicRoute(request)) return NextResponse.next();` at line 38, BEFORE performing any session validation (`await auth()`).
5. **Observation 1.3**: When an unauthenticated visitor or a student role requests `http://localhost:3000/teacher/dashboard`:
   - `isPublicRoute(request)` evaluates to `true`.
   - The middleware returns `NextResponse.next()` immediately (Test 3.14: actual `'next'` vs expected `'redirect'`).
   - Line 42 (`await auth()`), line 44 (`if (!userId)`), and lines 57–59 (`if (isTeacherRoute(request) && role !== "teacher")`) are NEVER REACHED.
6. **Conclusion**: The entire teacher portal (`src/app/teacher/dashboard/page.tsx` and all teacher subpaths) is publicly accessible without login or role verification.

### 2.2 High Severity Defect: Admin Lockout from Session Claim Metadata Mismatch
1. **Observation 1.1**: Line 50 reads `const role = (sessionClaims?.metadata as any)?.role || "student";`.
2. **Observation 1.2**: Clerk standard user metadata is exposed in `user.publicMetadata` and default session tokens as `publicMetadata`. `Navbar.tsx` explicitly relies on `user?.publicMetadata?.role`.
3. If an administrator signs in and their role is stored under `publicMetadata.role`, `(sessionClaims?.metadata as any)?.role` evaluates to `undefined`.
4. The fallback assigns `role = "student"`.
5. At line 53, `if (isAdminRoute(request) && role !== "admin")`, the condition is met (`"student" !== "admin"`), and the admin is redirected to `/dashboard`.
6. **Conclusion**: Valid administrators are locked out of `/admin/dashboard` unless custom JWT templates explicitly duplicate `publicMetadata.role` into a custom claim named `metadata.role`.

### 2.3 Medium Severity Issue: Over-Capturing Prefix Patterns
1. `isAdminRoute = createRouteMatcher(["/admin(.*)"]);`
2. `isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);`
3. Because `(.*)` lacks path segment boundaries, any route beginning with `/admin` (such as a future marketing page `/admissions` or `/administrators`) is greedily categorized as an admin route, redirecting guests to login.
4. Correct pattern requires exact root and slash-delimited subpaths: `["/admin", "/admin/(.*)"]` and `["/dashboard", "/dashboard/(.*)"]`.

### 2.4 Medium Severity Issue: Unauthenticated API Requests Receive 307 Redirect Instead of 401
1. **Observation 1.1**: Lines 44–47 redirect all unauthenticated requests to `/login?redirect_url=...` with status 307.
2. In `PROJECT.md` line 74 (API Route Response Contract): `Error response: NextResponse.json({ error: string }, { status: number })`.
3. When non-public API endpoints (such as `/api/admin-stats` or `/api/teacher-dashboard`) are invoked by `fetch()`, receiving a 307 redirect to an HTML login page breaks programmatic API clients that expect a JSON response with status 401.

---

## 3. Caveats

- **No Caveats on Bug Reproduction**: The wildcard collision and authentication bypass are 100% reproducible via executable Node.js test harness against `@clerk/nextjs/server`'s `createRouteMatcher`.
- **Static Asset Exclusions (`config.matcher`)**: Confirmed robust. 18 of 18 test assertions passed, verifying that static assets (`_next`, `.css`, `.png`, `.jpg`, `.woff2`, `.svg`, `.ico`, `.webmanifest`) are properly bypassed, while `/api/*` and portal routes are properly intercepted.
- **Production Clerk API Keys**: Tests evaluate Edge middleware routing logic offline using standard Next.js / Clerk request mock structures. Production end-to-end cookies will need valid `CLERK_SECRET_KEY` in deployment.

---

## 4. Conclusion & Required Changes

Milestone M2 cannot be approved due to **Critical Security Defect 1** (public exposure of teacher portal) and **Defect 2** (admin lockout risk).

### Required Changes for Worker M2:

1. **Fix Route Wildcard Collision in `isPublicRoute` (`src/middleware.ts`)**:
   Replace:
   ```ts
   "/teach(.*)",
   "/teachers(.*)",
   ```
   With explicit path and slash-delimited subpath matchers:
   ```ts
   "/teach",
   "/teach/(.*)",
   "/teachers",
   "/teachers/(.*)",
   ```

2. **Add Slash Boundaries to Protected Route Matchers (`src/middleware.ts`)**:
   Replace:
   ```ts
   const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
   const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);
   const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
   ```
   With:
   ```ts
   const isAdminRoute = createRouteMatcher(["/admin", "/admin/(.*)"]);
   const isTeacherRoute = createRouteMatcher(["/teacher", "/teacher/(.*)", "/teacher-dashboard", "/teacher-dashboard/(.*)"]);
   const isDashboardRoute = createRouteMatcher(["/dashboard", "/dashboard/(.*)"]);
   ```

3. **Broaden Role Claim Resolution (`src/middleware.ts`)**:
   Replace line 50:
   ```ts
   const role = (sessionClaims?.metadata as any)?.role || "student";
   ```
   With:
   ```ts
   const role =
     (sessionClaims?.metadata as any)?.role ||
     (sessionClaims?.publicMetadata as any)?.role ||
     (sessionClaims as any)?.role ||
     "student";
   ```

4. **Differentiate API Unauthenticated Response (`src/middleware.ts`)**:
   Replace lines 44–48:
   ```ts
   if (!userId) {
     if (request.nextUrl.pathname.startsWith("/api/")) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }
     const loginUrl = new URL("/login", request.url);
     loginUrl.searchParams.set("redirect_url", request.url);
     return NextResponse.redirect(loginUrl);
   }
   ```

---

## 5. Verification Method

To independently verify the defects and validate fixes:

1. **Execute Challenger Adversarial Test Suite**:
   ```bash
   node tests/m2-middleware-adversarial.test.mjs
   ```
   - *Current state*: 103 passed, 6 failed (demonstrating `/teacher/dashboard` bypass).
   - *After proposed fix applied*: 109 passed, 0 failed.

2. **Run Feature 5 Contract Tests**:
   ```bash
   node tests/run-all.mjs --feature=5
   ```

3. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   - Must exit with code 0.
