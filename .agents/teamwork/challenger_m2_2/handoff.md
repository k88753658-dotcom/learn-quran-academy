# Challenger M2-2 Empirical Review Report

## 1. Observation

1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Command: `npx tsc --noEmit`
   - Result: Exited with code `0`, 0 diagnostic errors.

2. **Tier 1 Feature Tests (`node tests/run-all.mjs --tier=1`)**:
   - Command: `node tests/run-all.mjs --tier=1`
   - Result: `87 passed, 1 failed, Total: 88`
   - Features 4, 5, 6, 7 (Milestone M2 scope) passed all 16 assertions:
     - Feature 4 (`f04-clerk-layout.test.mjs`): 4 passed, 0 failed.
     - Feature 5 (`f05-clerk-middleware.test.mjs`): 5 passed, 0 failed.
     - Feature 6 (`f06-navbar-auth-state.test.mjs`): 3 passed, 0 failed.
     - Feature 7 (`f07-login-register-pages.test.mjs`): 4 passed, 0 failed.
   - The single failure was in Feature 16 (`f16-auth-api-handlers.test.mjs` -> F16.2), which belongs to Milestone M4 (not M2).

3. **Production Build Failure (`npx next build`) [CRITICAL FINDING]**:
   - Command: `npx next build`
   - Exit code: `1`
   - Verbatim Output:
     ```
     ▲ Next.js 16.2.6 (Turbopack)
     - Environments: .env.local

     ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
       Creating an optimized production build ...
     ✓ Compiled successfully in 33.2s
       Running TypeScript ...
       Finished TypeScript in 22.5s ...
       Collecting page data using 7 workers ...
       Generating static pages using 7 workers (0/62) ...
       Generating static pages using 7 workers (15/62) 
     Error occurred prerendering page "/contact". Read more: https://nextjs.org/docs/messages/prerender-error
     Error: Clerk: <SignedOut> is not available in @clerk/nextjs Core 3. Learn more at https://clerk.com/err/signedout-is-not-available-in-clerk-nextjs.
         at k (D:\VS CODE\learn-quran-academy\.next\server\chunks\ssr\_0w6b48.._.js:1:335)
         at m (D:\VS CODE\learn-quran-academy\.next\server\chunks\ssr\_0w6b48.._.js:1:542) {
       digest: '3935603240'
     }
     Export encountered an error on /contact/page: /contact, exiting the build.
     ⨯ Next.js build worker exited with code: 1 and signal: null
     ```

4. **Clerk Core 3 (`@clerk/nextjs@7.9.7`) Removal of `<SignedIn>` and `<SignedOut>`**:
   - Inspection of `node_modules/@clerk/nextjs/dist/types/removedControlComponents.d.ts` (lines 6–52):
     ```ts
     /**
      * `<SignedIn>` was removed from `@clerk/nextjs` in Clerk Core 3 (released March 3, 2026) and replaced
      * by the `<Show>` component.
      * ...
      * @deprecated Removed in Clerk Core 3 (`@clerk/nextjs@7.0.0`). Rendering `<SignedIn>` throws an error. Use `<Show when="signed-in">` instead.
      */
     export declare function SignedIn(_props: RemovedControlComponentProps): never;

     /**
      * `<SignedOut>` was removed from `@clerk/nextjs` in Clerk Core 3 (released March 3, 2026) and replaced
      * by the `<Show>` component.
      * ...
      * @deprecated Removed in Clerk Core 3 (`@clerk/nextjs@7.0.0`). Rendering `<SignedOut>` throws an error. Use `<Show when="signed-out">` instead.
      */
     export declare function SignedOut(_props: RemovedControlComponentProps): never;
     ```
   - Inspection of `node_modules/@clerk/nextjs/dist/esm/removedControlComponents.js`:
     ```js
     function throwRemovedControlComponentError(componentName, errorUrl) {
       throw new Error("Clerk: <" + componentName + "> is not available in @clerk/nextjs Core 3. Learn more at " + errorUrl + ".");
     }
     ```
   - Direct empirical execution via node:
     `node -e "const { SignedOut } = require('@clerk/nextjs'); SignedOut({});"`
     Result: Unconditionally throws `Error: Clerk: <SignedOut> is not available in @clerk/nextjs Core 3. Learn more at https://clerk.com/err/signedout-is-not-available-in-clerk-nextjs.`
   - In `src/components/Navbar.tsx`:
     - Line 7: `import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";`
     - Lines 102–111 & 180–193: Uses `<SignedOut>`
     - Lines 112–126 & 194–205: Uses `<SignedIn>`
     - When any page rendering `Navbar` (e.g. `/`, `/contact`, `/about`, `/courses`) is rendered during build or runtime, it crashes.

5. **Legacy localStorage Lockout on Admin Dashboard (`src/app/admin/dashboard/page.tsx`)**:
   - `src/app/admin/dashboard/page.tsx`, lines 82–87:
     ```ts
     useEffect(() => {
       const role = localStorage.getItem("user_role");
       if (role !== "admin") {
         router.push("/login");
         return;
       }
       refreshData();
     }, []);
     ```
   - Unlike `Navbar.tsx` (which inspects `user?.publicMetadata?.role`), `AdminDashboard` does not import `useUser` or check Clerk user metadata. An administrator who logs in cleanly via Clerk without legacy localStorage values is immediately redirected back to `/login`.

6. **Empirical Boundary Test Harness (`tests/tier2-boundaries/clerk-client-contracts.test.mjs`)**:
   - Created and executed: `node tests/tier2-boundaries/clerk-client-contracts.test.mjs`
   - Results:
     - `T2.Clerk.1: @clerk/nextjs v7.9.7 exports <Show> as modern replacement for control components` -> PASS
     - `T2.Clerk.2: Calling SignedIn or SignedOut in Clerk v7.9.7 throws runtime removal error` -> PASS
     - `T2.Clerk.3: Navbar.tsx must NOT render deprecated <SignedIn> or <SignedOut> components` -> FAIL
     - `T2.Clerk.4: LoginPage must use modern fallbackRedirectUrl or forceRedirectUrl instead of afterSignInUrl` -> PASS
     - `T2.Clerk.5: Dashboard pages must use useClerk signOut with redirectUrl options object` -> PASS
     - `T2.Clerk.6: Admin dashboard must not block Clerk admin users with legacy-only localStorage check` -> FAIL

---

## 2. Logic Chain

1. In `@clerk/nextjs` version 7.9.7 (released as part of Clerk Core 3 in March 2026), `<SignedIn>`, `<SignedOut>`, and `<Protect>` were formally deprecated and removed from runtime operation (Observation 4).
2. The TypeScript definitions in `@clerk/nextjs` declare `SignedIn` and `SignedOut` with return type `never` so that calling them in TSX compiles without type diagnostics, explaining why `npx tsc --noEmit` exited 0 (Observation 1 & 4).
3. At runtime (including Next.js SSR and SSG static prerendering), rendering `<SignedIn>` or `<SignedOut>` invokes `throwRemovedControlComponentError`, throwing an unhandled exception (Observation 4).
4. `src/components/Navbar.tsx` imports and renders both `<SignedIn>` and `<SignedOut>` (Observation 4).
5. Running `npx next build` crashes during page generation on `/contact` with `Error: Clerk: <SignedOut> is not available in @clerk/nextjs Core 3` (Observation 3). This directly violates the project's acceptance criteria in `ORIGINAL_REQUEST.md` line 21 ("Running npm run build completes successfully with zero TypeScript or build errors").
6. Clerk Core 3's official documented replacement is the `<Show>` component (`<Show when="signed-in">` and `<Show when="signed-out">`) exported directly from `@clerk/nextjs` (Observation 4 & 6).
7. In `src/app/admin/dashboard/page.tsx`, the client-side authentication gate checks exclusively `localStorage.getItem("user_role") !== "admin"` rather than Clerk's `user?.publicMetadata?.role` (Observation 5). Consequently, an admin user authenticated via Clerk will fail this check and be redirected to `/login`.

---

## 3. Caveats

- Milestone M4 routes (e.g. `/api/register`, `/api/login`) have not yet been migrated to Clerk SDK/Prisma. The failure in F16.2 during `--tier=1` is expected for Milestone M2 and does not constitute a defect in M2.
- The build was executed without live production Clerk credentials in `.env.local`. However, the crash on `/contact` is not caused by missing keys; it is caused directly by invoking the removed `<SignedOut>` component.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES**

Worker M2 correctly implemented `<ClerkProvider>` in `src/app/layout.tsx`, `<SignIn />` in `src/app/login/page.tsx`, `clerkMiddleware()` in `src/middleware.ts`, and `useClerk().signOut()` in all 3 dashboards.

However, the implementation contains a critical blocking defect and a secondary auth defect:
1. **CRITICAL DEFECT**: `src/components/Navbar.tsx` uses `<SignedIn>` and `<SignedOut>`, which are removed in `@clerk/nextjs` v7.9.7. This causes an immediate unhandled runtime exception and prevents `next build` from succeeding.
   - **Required Change**: In `src/components/Navbar.tsx`, replace `SignedIn` and `SignedOut` with `Show` from `@clerk/nextjs`:
     ```tsx
     import { Show, UserButton, useUser } from "@clerk/nextjs";
     // Replace <SignedOut>...</SignedOut> with:
     <Show when="signed-out">...</Show>
     // Replace <SignedIn>...</SignedIn> with:
     <Show when="signed-in">...</Show>
     ```
2. **MEDIUM DEFECT**: `src/app/admin/dashboard/page.tsx` line 83 gates access via `localStorage.getItem("user_role") !== "admin"` without checking Clerk's `useUser()` or metadata.
   - **Required Change**: Use Clerk's `useUser()` in `AdminDashboard` to check `user?.publicMetadata?.role === "admin"`, matching the pattern used in `Navbar.tsx`.

---

## 5. Verification Method

To independently reproduce the failures and verify fixes:

1. **Reproduce the Build Crash**:
   ```bash
   npx next build
   ```
   *Actual Result*: Fails with `Error: Clerk: <SignedOut> is not available in @clerk/nextjs Core 3.` during prerendering of `/contact`.

2. **Execute the Clerk Client Contracts Test**:
   ```bash
   node tests/tier2-boundaries/clerk-client-contracts.test.mjs
   ```
   *Actual Result*: Tests `T2.Clerk.3` (Navbar `<SignedIn>`/`<SignedOut>`) and `T2.Clerk.6` (Admin dashboard `localStorage`) fail.

3. **Verify Runtime Invalidation in Node**:
   ```bash
   node -e "const { SignedOut } = require('@clerk/nextjs'); SignedOut({});"
   ```
   *Actual Result*: Throws `Error: Clerk: <SignedOut> is not available in @clerk/nextjs Core 3.`
