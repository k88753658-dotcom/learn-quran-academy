# Handoff Report: Explorer Survey 3 (Auth & Client Data Fetching)

**Agent**: Explorer 3 (`teamwork_preview_explorer`)  
**Working Directory**: `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\`  
**Milestone**: Explorer Survey 3 Complete  
**Handoff Type**: Hard  

---

## 1. Observation

1. **Client Components and Direct Supabase Usage**:
   - Executed pattern match for `createClient` and `@supabase` in `src/components/` and `src/app/` (excluding `api/`):
     - `grep_search(Query: "@supabase", SearchPath: "src/components")` returned 0 results.
     - `grep_search(Includes: ["!**/api/**"], Query: "supabase", SearchPath: "src/app")` returned 0 results.
   - `src/utils/supabase/client.ts` defines `createClient()` using `createBrowserClient`, but `grep_search(Query: "@/utils/supabase/client", SearchPath: "src")` returned 0 results. No component or page in the application uses it.
   - Every client component and page performing data operations uses native HTTP `fetch('/api/...')`. Examples:
     - `src/components/TeachersSection.tsx:12`: `const res = await fetch("/api/public-teachers");`
     - `src/app/teacher/dashboard/page.tsx:31`: `const res = await fetch('/api/teacher-dashboard');`
     - `src/app/dashboard/page.tsx:24`: `const res = await fetch('/api/student-dashboard');`
     - `src/app/admin/dashboard/page.tsx:87`: `const res = await fetch('/api/admin-stats');`
     - `src/app/register/page.tsx:33`: `const res = await fetch("/api/courses");`
     - `src/app/register/page.tsx:73`: `const response = await fetch("/api/register", { method: "POST", ... });`
     - `src/app/login/page.tsx:30`: `const response = await fetch("/api/login", { method: "POST", ... });`

2. **Current Authentication and Session Mechanism**:
   - `src/app/login/page.tsx:39-41`:
     ```ts
     localStorage.setItem("academy_user", JSON.stringify(data.user));
     localStorage.setItem("user_role", data.role);
     document.cookie = `user_role=${data.role}; path=/; max-age=86400`;
     ```
   - `src/components/Navbar.tsx:22-27`:
     ```ts
     const user = localStorage.getItem("academy_user");
     const role = localStorage.getItem("user_role");
     if (user && role) {
       setIsLoggedIn(true);
       setUserRole(role);
     }
     ```
   - `src/app/admin/dashboard/page.tsx:70-74`:
     ```ts
     const role = localStorage.getItem("user_role");
     if (role !== "admin") {
       router.push("/login");
       return;
     }
     ```
   - `src/app/admin/dashboard/page.tsx:312`, `src/app/teacher/dashboard/page.tsx:92`, and `src/app/dashboard/page.tsx:75`:
     Logout is implemented as `localStorage.clear(); router.push('/login');` without server-side token revocation.

3. **Current Middleware State**:
   - `src/proxy.ts:1-60`: Contains Next.js proxy/middleware logic attempting to intercept `/admin/:path*`, `/teacher/:path*`, `/dashboard/:path*` via `@supabase/ssr` `createServerClient`. Standard Next.js middleware file `src/middleware.ts` does not exist yet.

4. **Installed Packages (`package.json`)**:
   - `"@clerk/nextjs": "^7.9.7"` is already installed in `dependencies` (Line 12).
   - `"@prisma/client": "^6.19.3"` and `"prisma": "^6.19.3"` are installed (Lines 13, 41).
   - `"next": "16.2.6"`, `"react": "19.2.4"`.

5. **Prisma Schema Discrepancy (`prisma/schema.prisma` vs `supabase_schema.sql`)**:
   - `prisma/schema.prisma:40`: `model Profile { id String @id // We will use Clerk's user ID here ... }`
   - `supabase_schema.sql` and API routes (`src/app/api/approve-teacher-application/route.ts:80-90`, `src/app/api/teacher-application/route.ts:35-62`) reveal that:
     - The `teacher_applications` table exists in Supabase and is actively queried, but is **missing** from `prisma/schema.prisma`.
     - `profiles` in Supabase contains `whatsapp`, `bio`, `specializations`, `qualification`, `experience_years`, `is_profile_complete`, and `last_active`, but these are **missing** from the current `Profile` model in `prisma/schema.prisma`.

---

## 2. Logic Chain

1. **Client-side data fetching scope**:
   - *Observation 1* establishes that zero `.tsx` files in `src/app/` and `src/components/` invoke Supabase directly.
   - *Inference*: UI components and pages do not require database query rewrites. Only the API Route Handlers in `src/app/api/` need database refactoring from Supabase to Prisma.

2. **Authentication migration scope**:
   - *Observation 2 & 3* show that auth is currently managed via a combination of `/api/login`, `localStorage`, cookie manipulation, and an unstandardized `src/proxy.ts`.
   - *Observation 4* shows `@clerk/nextjs` v7.9.7 is already installed.
   - *Inference*:
     - Root layout `src/app/layout.tsx` must be wrapped in `<ClerkProvider>`.
     - Standard `src/middleware.ts` must replace `src/proxy.ts` and `src/utils/supabase/middleware.ts`, using Clerk's `clerkMiddleware` and `createRouteMatcher`.
     - `Navbar.tsx` must be updated with Clerk's `<SignedIn>`, `<SignedOut>`, and `<UserButton />`.
     - Sidebar sign-out buttons in all 3 dashboards must call `useClerk().signOut()` to ensure session revocation.
     - Login page `src/app/login/page.tsx` can embed Clerk's `<SignIn />` component or use `useSignIn()`.
     - Student registration `src/app/register/page.tsx` should retain its custom rich-field form, submitting to `/api/register` which uses `clerkClient().users.createUser()` and Prisma `$transaction`.

3. **Data model mapping & schema integrity**:
   - *Observation 5* shows `Profile.id` is designated for Clerk `userId`, but `TeacherApplication` and extra `Profile` fields are missing in Prisma.
   - *Inference*: Before refactoring API routes, `prisma/schema.prisma` must be updated with `model TeacherApplication` and the missing `Profile` fields, followed by `npx prisma db push`.

---

## 3. Caveats

- Environment variables in `.env.local` could not be read directly due to IDE permission timeout restrictions. It is assumed that `DATABASE_URL` (Neon DB) and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` are or will be present in `.env.local`.
- If Clerk JWT session tokens are not configured in the Clerk dashboard to include `metadata.role`, middleware can fall back to database queries or route handlers can perform role validation on the server using Prisma `prisma.profile.findUnique({ where: { id: userId } })`.

---

## 4. Conclusion

The application is in an ideal state for a clean migration:
1. **Client layer is completely decoupled from Supabase**: No direct Supabase client calls exist in UI components; all data flow is mediated by `/api/...`.
2. **Clerk and Prisma are already installed**: No additional package installations are needed.
3. **Clear identity mapping exists**: `Profile.id` maps 1:1 with Clerk `userId`.
4. **Concrete roadmap established**:
   - Update `prisma/schema.prisma` (add `TeacherApplication` and missing `Profile` columns).
   - Create singleton Prisma client at `src/lib/db/prisma.ts`.
   - Wrap `src/app/layout.tsx` with `<ClerkProvider>`.
   - Deploy `src/middleware.ts` using `clerkMiddleware`.
   - Refactor `/api/register`, `/api/add-teacher`, and `/api/approve-teacher-application` to use `clerkClient().users.createUser()`.
   - Update `Navbar.tsx` and dashboard logout handlers to use Clerk hooks/components.
   - Full migration report with all file paths and exact code patterns is documented in `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\report.md`.

---

## 5. Verification Method

To independently verify all findings in this report:

1. **Verify No Direct Supabase Calls in UI Components**:
   ```powershell
   # In PowerShell inside project root:
   rg "@supabase" src/components/
   rg "@supabase" src/app/ --glob "!src/app/api/**"
   ```
   *Expected result*: 0 matches.

2. **Verify Installed Clerk & Prisma Versions**:
   ```powershell
   node -p "require('./package.json').dependencies['@clerk/nextjs']"
   node -p "require('./package.json').dependencies['@prisma/client']"
   ```
   *Expected result*: `^7.9.7` and `^6.19.3`.

3. **Inspect Detailed Survey Report**:
   Inspect `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_3\report.md` for complete code snippets, route tables, and architecture plans.
