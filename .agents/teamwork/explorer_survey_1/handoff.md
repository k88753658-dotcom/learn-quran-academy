# Handoff Report — Explorer 1 (Codebase Structural Survey & Supabase Inventory)

**Agent:** Explorer 1 (`teamwork_preview_explorer`)  
**Working Directory:** `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_1\`  
**Target Milestone:** Milestone 1 — Architectural Survey & API Analysis  
**Detailed Report:** `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_1\report.md`  

---

## 1. Observation

1. **Package Configuration (`package.json`)**:
   - Lines 12-16:
     ```json
     "@clerk/nextjs": "^7.9.7",
     "@prisma/client": "^6.19.3",
     "@stripe/stripe-js": "^9.7.0",
     "@supabase/ssr": "^0.12.0",
     "@supabase/supabase-js": "^2.108.1",
     ```
   - Lines 22-23:
     ```json
     "mongodb": "^7.2.0",
     "mongoose": "^9.6.3",
     ```
   - Lines 41-43:
     ```json
     "prisma": "^6.19.3",
     "tailwindcss": "^4",
     "typescript": "^5"
     ```
   - Observed that `@clerk/nextjs` (v7.9.7) and `@prisma/client` / `prisma` (v6.19.3) are already in `package.json`.
   - `mongodb` and `mongoose` are completely unreferenced in `src/` (0 grep hits).

2. **Supabase Call Sites**:
   - Ripper-grep query for `supabase` across repo located 48 distinct files referencing Supabase.
   - Identified 35 API routes in `src/app/api/` that import `@/utils/supabase/server` or `@supabase/supabase-js`.
   - 3 API routes do NOT reference Supabase: `src/app/api/chat/route.ts` (Google Gemini AI), `src/app/api/checkout/route.ts` (redirect builder), and `src/app/api/contact/route.ts` (Resend email). Total API routes: exactly 38.
   - 4 utility/SDK files: `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`, `src/utils/supabase/middleware.ts`, `src/utils/supabase/database.types.ts`.
   - 1 route proxy helper: `src/proxy.ts` (uses `@supabase/ssr` to verify session and protect `/admin/*`, `/teacher/*`, `/dashboard/*`).
   - 5 root scripts: `check-admin.mjs`, `create-admin.mjs`, `fix-admin.mjs`, `list-users.mjs`, `register-admin.mjs`.
   - 1 SQL schema: `supabase_schema.sql`.

3. **Database Schema Parity Discrepancies**:
   - `prisma/schema.prisma` already exists (122 lines), but:
     - `model Profile` lacks: `whatsapp` (String?), `bio` (String?), `qualification` (String?), `specializations` (String[]), `experienceYears` (Int?), `isProfileComplete` (Boolean @default(false)), `profilePhotoUrl` (String?), `lastActive` (DateTime?). All of these are actively read/written in `src/app/api/approve-teacher-application`, `src/app/api/get-teachers`, `src/app/api/update-teacher-profile`, and `src/app/api/public-teachers`.
     - `model Attendance` lacks `markedBy String?`. In `src/app/api/attendance/route.ts:51,59`, `marked_by: user.id` is saved.
     - `enum BillingStatus` lacks `Reviewing`. In `src/app/api/verify-manual-payment/route.ts:39`, `status: 'Reviewing'` is stored.
     - `enum AttendanceStatus` lacks `Excused`. In `src/app/api/attendance/route.ts:5`, `VALID_STATUSES` includes `"Excused"`.
     - `teacher_applications` table is used in 3 routes (`teacher-application`, `get-teacher-applications`, `approve-teacher-application`), but has **no model** in `prisma/schema.prisma`.

4. **Environment Variables**:
   - Supabase vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - Non-Supabase active vars: `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `AI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
   - Required for target stack: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`.

5. **Frontend API Consumption**:
   - No frontend pages or components directly import Supabase. All data fetching occurs exclusively through HTTP `fetch()` requests against `/api/*` endpoints.

---

## 2. Logic Chain

1. **Dependencies**: Because `@clerk/nextjs` and `@prisma/client` / `prisma` are already installed in `package.json`, no package installations are blocking setup. Removing `@supabase/ssr`, `@supabase/supabase-js`, `mongodb`, and `mongoose` will prune unnecessary dependencies.
2. **Schema Alignment**: Because routes like `approve-teacher-application` and `teacher-application` execute CRUD operations against `teacher_applications` and populate profile metadata (`whatsapp`, `bio`, `specializations`, `qualification`, `experience_years`), if `schema.prisma` is migrated without adding `model TeacherApplication` and the missing `Profile` fields, TypeScript build errors and runtime Prisma exceptions will occur.
3. **Route Refactoring Scope**: Because all 35 Supabase routes use either `const supabase = await createClient()` or `createAdminClient(...)`, replacing these calls with a singleton `prisma` client (`src/lib/db/prisma.ts`) and Clerk's `auth()` will systematically eliminate all Supabase code while preserving existing frontend response contracts.
4. **Middleware Protection**: Because `src/proxy.ts` performs role-based route gating using Supabase session cookies, replacing it with a standard Next.js `src/middleware.ts` running `clerkMiddleware()` will provide native Clerk route protection for `/admin`, `/teacher`, and `/dashboard`.

---

## 3. Caveats

- **`.env.local` Read Permission:** The direct inspection of `.env.local` timed out waiting for file permission. However, all active environment variable names were exhaustively identified by searching `process.env` references across every source and script file in the repository.
- **Clerk Auth Strategy:** The current `/login` page uses custom email/password input fields submitting to `/api/login`. When migrating to Clerk, the team can either:
  1. Replace `/login` and `/register` pages with Clerk's turnkey `<SignIn />` and `<SignUp />` components, or
  2. Implement Clerk's custom sign-in client hooks (`useSignIn`, `useSignUp`).
- **Data Migration:** As defined in `ORIGINAL_REQUEST.md` (Requirement R2), data migration is not required (fresh database start).

---

## 4. Conclusion

The application is well-structured and highly modular:
- 100% of data access is encapsulated in 38 API routes under `src/app/api/`.
- Exactly 35 routes require conversion from Supabase to Prisma + Clerk.
- 3 routes (`chat`, `checkout`, `contact`) are independent and require no database modifications.
- `prisma/schema.prisma` requires immediate extension to include `TeacherApplication`, missing `Profile` attributes, and enum values before route refactoring begins.
- Once `schema.prisma` is aligned, a singleton `prisma` client is initialized, and Next.js middleware is configured with Clerk, the 35 API routes can be cleanly refactored without breaking frontend contracts.

---

## 5. Verification Method

To independently verify these findings:
1. **Verify API Route Count:**
   - Run `find_by_name` for `route.*` in `src/app/api/`. Result: 38 files.
2. **Verify Supabase References:**
   - Search for `supabase` across `src/` using `grep_search`. Result: 35 routes + 4 utils + `src/proxy.ts`.
3. **Verify Schema Gaps:**
   - Inspect `src/app/api/teacher-application/route.ts:51` to see `teacher_applications` table usage.
   - Inspect `prisma/schema.prisma` to verify `TeacherApplication` is missing.
   - Inspect `src/app/api/update-teacher-profile/route.ts:25-31` to verify missing fields on `Profile`.
4. **Verify Frontend Route Gating:**
   - Inspect `src/proxy.ts:36-50` to observe current Supabase role redirection rules.
