# Handoff Report — Explorer Survey 2: Database Schema & Data Model

**Agent ID**: `explorer_survey_2`  
**Parent ID**: `5151de75-150e-4241-94b2-4b7d5106459c`  
**Date**: 2026-09-29  
**Status**: Completed (Hard Handoff)  
**Detailed Report**: `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_2\report.md`

---

## 1. Observation

1. **Legacy SQL Schema (`supabase_schema.sql`)**:
   - Defined 7 tables: `profiles` (lines 10-16), `students` (lines 19-31), `billing` (lines 34-42), `attendance` (lines 45-52), `notifications` (lines 55-64), `payment_tickets` (lines 67-75), `courses` (lines 117-122).
   - `profiles.id` references `auth.users(id)`.
   - `billing.status` check constraint: `CHECK (status IN ('Pending', 'Paid', 'Overdue'))` (line 38).
   - `attendance.status` check constraint: `CHECK (status IN ('Present', 'Absent', 'Late'))` (line 49).

2. **TypeScript Database Definitions (`src/utils/supabase/database.types.ts`)**:
   - Lines 18 & 108: Added `whatsapp` to `profiles` and `marked_by` to `attendance`.

3. **Existing Prototype Schema (`prisma/schema.prisma`)**:
   - Contains 7 models (`Profile`, `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, `Course`).
   - Totally omitted `teacher_applications` table.
   - Omitted `whatsapp`, `bio`, `specializations`, `qualification`, `experience_years`, `is_profile_complete`, `profile_photo_url`, and `last_active` from `Profile`.
   - `BillingStatus` enum omitted `'Reviewing'`.
   - `AttendanceStatus` enum omitted `'Excused'`.
   - `Attendance` model omitted `marked_by` relation to `Profile`.

4. **Codebase Query Audit (38 API Routes)**:
   - `teacher_applications` table is queried in:
     - `src/app/api/teacher-application/route.ts` (lines 35, 51: insert and duplicate check)
     - `src/app/api/get-teacher-applications/route.ts` (line 15: select all)
     - `src/app/api/approve-teacher-application/route.ts` (lines 33, 51, 94: query, update status and admin_notes)
   - Profile columns queried:
     - `approve-teacher-application/route.ts` (lines 80-90): updates `whatsapp`, `bio`, `specializations` (`String[]`), `qualification`, `experience_years`, `is_profile_complete`.
     - `update-teacher-profile/route.ts` (lines 25-32): updates `bio`, `whatsapp`, `specializations`, `profile_photo_url`, `is_profile_complete`.
     - `update-teacher-activity/route.ts` (line 15) & `teacher-dashboard/route.ts` (line 37): updates `last_active`.
   - Billing status values:
     - `verify-manual-payment/route.ts` (lines 37-40): writes `status: 'Reviewing'`.
     - `approve-manual-payment/route.ts` (line 49): writes `status: 'Paid'`.
   - Attendance statuses & relations:
     - `attendance/route.ts` (line 5): `const VALID_STATUSES = ["Present", "Absent", "Late", "Excused"];`
     - `attendance/route.ts` (line 104): `.select('*, profiles(name)')` using `marked_by` attribution.

5. **Project Acceptance Criteria (`ORIGINAL_REQUEST.md`)**:
   - Fresh start (no data migration from Supabase).
   - `npm run build` succeeds with zero TypeScript / build errors.
   - Test script `test-db.mjs` created and runnable to insert and read a dummy record from the Neon database.

---

## 2. Logic Chain

1. **Entity Identification**: From Observation 1, 2, and 4, the application requires 8 tables. The existing `prisma/schema.prisma` omitted `TeacherApplication` entirely, which would break the instructor onboarding flow (`/teach`, admin applications tab). Therefore, `TeacherApplication` must be added to `schema.prisma`.
2. **Profile Completeness**: Observation 4 demonstrates that routes for instructor management and admin dashboard fail at runtime/build-time if `Profile` lacks `whatsapp`, `bio`, `specializations` (`String[]`), `qualification`, `experienceYears`, `isProfileComplete`, `profilePhotoUrl`, and `lastActive`. Therefore, all 8 fields must be modeled on `Profile`.
3. **Clerk ID Integration**: Under Clerk, user IDs are strings (`user_2b...`). The primary key of `Profile` must be `id String @id` without `@default(uuid())`, allowing direct storage of Clerk IDs.
4. **Enum Alignment**:
   - Observation 4 shows `/api/verify-manual-payment` sets `status: 'Reviewing'` on `billing`. The `BillingStatus` enum must include `Reviewing`.
   - Observation 4 shows `/api/attendance` accepts `Excused`. The `AttendanceStatus` enum must include `Excused`.
5. **PostgreSQL Relational Conventions**: Mapping model names and fields to Postgres snake_case using `@@map` and `@map` allows Prisma Client to use idiomatic TypeScript camelCase while preserving clean relational database schema standards.
6. **Neon Connection Topology**: Neon provides pooled connections (via PgBouncer) for application runtime, and direct connections for schema migrations (since PgBouncer does not support session advisory locks). In `schema.prisma`, defining `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")` ensures optimal performance and reliable migration execution.
7. **Connection Singleton & Test Script**: In Next.js, Fast Refresh requires a global singleton (`src/lib/prisma.ts`) to avoid connection exhaustion. The acceptance criteria test script (`test-db.mjs`) must verify connection, insert a dummy `Course` record, read it back, and remove it.

---

## 3. Caveats

1. **Environment Access**: Direct inspection of `.env.local` timed out waiting for user permission. Default environment variable naming standards (`DATABASE_URL`, `DIRECT_URL`) were assumed.
2. **PostgreSQL Scalar Lists**: The field `specializations` is modeled as `String[]` (native PostgreSQL scalar array), which is fully supported by Prisma on PostgreSQL/Neon.
3. **Attendance Marker Fallback**: In `student-self-attendance/route.ts`, legacy code wrote `"student"` into `marked_by`. In the refactored Prisma setup, `markedById` should either reference the student's `Profile.id` or be left null.

---

## 4. Conclusion

The comprehensive database schema investigation is complete. All 8 database entities have been identified, fully enumerated, and mapped to a complete `schema.prisma` file ready for Neon DB and Prisma ORM.

Key deliverables completed:
1. **Full Investigation Report**: `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_2\report.md`
2. **Complete Proposed `schema.prisma`**: Documented in Section 5 of `report.md`.
3. **Connection Architecture Specification**: Pooled vs Direct URLs detailed in Section 6 of `report.md`.
4. **Connection Utility Design (`src/lib/prisma.ts`)**: Specified in Section 7 of `report.md`.
5. **Test Script Design (`test-db.mjs`)**: Complete executable Node.js code provided in Section 8 of `report.md`.
6. **API Migration Matrix**: Quick-reference table for 38 routes in Section 9 of `report.md`.

---

## 5. Verification Method

To verify the findings and proposed schema:
1. **Inspect Report**:
   - Open and review `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_2\report.md`.
2. **Verify Table Coverage**:
   - Confirm all 8 models (`Profile`, `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, `Course`, `TeacherApplication`) correspond to table usage in `src/app/api/`.
3. **Verify Discovered Fields**:
   - Check `src/app/api/approve-teacher-application/route.ts:80-90` against `Profile` model fields.
   - Check `src/app/api/verify-manual-payment/route.ts:39` against `BillingStatus` enum (`Reviewing`).
   - Check `src/app/api/attendance/route.ts:5` against `AttendanceStatus` enum (`Excused`).
4. **Post-Implementation Verification**:
   - Run `npx prisma validate` once `prisma/schema.prisma` is updated.
   - Run `node test-db.mjs` once database credentials are configured in `.env`.
   - Run `npm run build` to verify end-to-end TypeScript compilation.
