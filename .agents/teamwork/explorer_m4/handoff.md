# Technical Refactoring Blueprint — Milestone M4 (Student & Teacher Dashboard API Routes)

**Agent**: Explorer M4 (`explorer_m4`)  
**Roles**: Explorer, Investigator, Technical Architect  
**Date**: 2026-09-29T14:48:00Z  
**Target Milestone**: M4 (Student & Teacher Dashboard API Routes, Shared/Auth Routes, M3 Hardening)  
**Recipient**: Worker M4 (`worker_m4`)  

---

## 1. Observation

### 1.1 Target Routes Inventory & Current State

A comprehensive inspection of `src/app/api/`, `src/app/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, `src/app/(public)/student-portal/page.tsx`, and `prisma/schema.prisma` revealed the following:

#### Group 1: Student API Routes
1. **`src/app/api/student-dashboard/route.ts`**:
   - **Current State**: Uses `@/utils/supabase/server` `createClient()`, `supabase.auth.getUser()`, queries `students` joined to `profiles!teacher_id` and `billing`, plus `attendance`.
   - **Frontend Consumer**: `src/app/dashboard/page.tsx` (lines 26-74).
   - **Frontend Expectations**:
     - Expects `{ success: true, data: { student, teacher, billing, attendance } }`.
     - Expects `billing` to be an array or array-like (`billing?.length > 0 ? billing[0] : null`), with fields `status`, `amountDue`.
     - Student object expects: `studentName`, `course`, `enrolled`, `progress`, `liveClassroomLink`, `lastAssignment`.
2. **`src/app/api/student-profile/route.ts`**:
   - **Current State**: Uses Supabase `getUser()`, reads `searchParams.get("id")`, queries `students`, `billing`, and counts total/present `attendance` sessions.
   - **Frontend Consumer**: `src/app/(public)/student-portal/page.tsx` (line 34: `fetch('/api/student-profile?id=${studentId}')`).
   - **Frontend Expectations**: Expects `{ success: true, data: { name, course, attendanceRate, isMarkedToday, lastAssignment, enrollmentDate, progress, billing, syllabus } }`.
3. **`src/app/api/student-history/route.ts`**:
   - **Current State**: Mentioned in `PROJECT.md` line 28 & DISPATCH.md; file does not exist yet. Needs to be implemented to provide student attendance & learning history.
4. **`src/app/api/student-schedule/route.ts`**:
   - **Current State**: Mentioned in `PROJECT.md` line 28 & DISPATCH.md; file does not exist yet. Needs to be implemented to provide student active schedule and classroom link.
5. **`src/app/api/student-billing/route.ts` & `src/app/api/billing/route.ts`**:
   - **Current State**: `src/app/api/billing/route.ts` exists with Supabase queries (GET for student billing, POST for admin status update). `src/app/api/student-billing/route.ts` should be created as a dedicated/alias endpoint for student billing queries.

#### Group 2: Teacher API Routes
6. **`src/app/api/teacher-dashboard/route.ts`**:
   - **Current State**: Uses Supabase `getUser()`, selects from `profiles` where `id = user.id` and verifies `profile.role === 'teacher'`, fetches students where `teacher_id = profile.id` with `billing`, and updates `last_active`.
   - **Frontend Consumer**: `src/app/teacher/dashboard/page.tsx` (lines 33, 111-331).
   - **CRITICAL Frontend Compatibility Finding**: In `src/app/teacher/dashboard/page.tsx`:
     - Line 232: `<motion.div key={student._id}>`
     - Line 240: `{student.student_name}`
     - Line 255: `handleUpdateStudent(student._id, ...)`
     - Line 269: `defaultValue={student.live_classroom_link}`
     - Line 291: `defaultValue={student.last_assignment}`
     - Line 322: `handleMarkAttendance(student._id, "Present")`
     The UI heavily accesses `student._id`, `student.student_name`, `student.live_classroom_link`, and `student.last_assignment`! Returning `_id: s.id` and snake_case aliases alongside camelCase fields is strictly required.
7. **`src/app/api/update-teacher-profile/route.ts`**:
   - **Current State**: Uses Supabase auth, verifies `role === "teacher"`, updates `bio`, `whatsapp`, `specializations`, `profile_photo_url`, `is_profile_complete`.
8. **`src/app/api/update-teacher-activity/route.ts`**:
   - **Current State**: Uses Supabase auth, verifies `role === "teacher"`, updates `last_active = new Date()`.
9. **`src/app/api/update-student/route.ts`**:
   - **Current State**: Called by Teacher Dashboard line 56 (`handleUpdateStudent`). Uses Supabase auth, validates `studentId`, clamps `progress` between 0-100, updates `live_classroom_link`, `progress`, `last_assignment`.
10. **`src/app/api/teacher-schedule/route.ts`**:
    - **Current State**: Missing from disk. Returns teacher's student roster and class times.
11. **`src/app/api/teacher-classes/route.ts`**:
    - **Current State**: Missing from disk. Returns distinct courses taught by the teacher.
12. **`src/app/api/teacher-students/route.ts`**:
    - **Current State**: Missing from disk. Returns list of assigned students.
13. **`src/app/api/teacher-attendance/route.ts`**:
    - **Current State**: Missing from disk. Returns attendance records for teacher's students.
14. **`src/app/api/add-availability/route.ts`**:
    - **Current State**: Missing from disk. Saves teacher's teaching hours/availability in profile bio.

#### Group 3: Shared / Attendance / Payments / Auth Routes
15. **`src/app/api/attendance/route.ts`**:
    - **Current State**: Uses Supabase. POST marks attendance (Present, Absent, Late, Excused) with date standardized to today. GET fetches last 30 days of attendance logs with markedBy profile name.
16. **`src/app/api/mark-attendance/route.ts`**:
    - **Current State**: Companion to `attendance/route.ts` accepting explicit `date` parameter.
17. **`src/app/api/my-attendance/route.ts`**:
    - **Current State**: Accepts POST `{ studentId }` and returns `{ success: true, history: safeHistory }`.
18. **`src/app/api/verify-manual-payment/route.ts`**:
    - **Current State**: Uses Supabase. Accepts `{ studentId, transactionId, methodUsed }`, checks duplicate `transaction_id`, creates `payment_tickets` row with `status: "Reviewing"`, and upserts `billing` status to `"Reviewing"`.
19. **`src/app/api/login/route.ts`**:
    - **Current State**: Uses `supabase.auth.signInWithPassword(...)`. Must be refactored to authenticate against Prisma/Clerk credentials with zero Supabase dependencies.
20. **`src/app/api/register/route.ts`**:
    - **Current State**: Uses `@supabase/supabase-js` admin client to create user, inserts `students` row, inserts `billing` row (status "Pending"), sends Resend email. Must be refactored to use `@clerk/nextjs/server` `clerkClient().users.createUser(...)` and Prisma `Profile`, `Student`, `Billing` creation.

#### Group 4: Milestone M3 Hardening Items
21. **`src/app/api/payment-ticket/route.ts`**:
    - **Observed Flaw**: Lines 47-52 currently map client-supplied `status` field (`const ticketStatus = status === "Approved" ? "Approved" : ...`). Allows caller to inject `Approved` status.
    - **Fix Required**: Force `status: "Reviewing"` unconditionally.
22. **`src/app/api/notifications/route.ts`**:
    - **Observed Flaw**: Line 42 defaults `where` to `{ isActive: true }` when neither `userId` nor `studentId` is provided. This exposes private targeted notifications across all students.
    - **Fix Required**: Default `where` to `{ isActive: true, type: "Global" }`.

---

### 1.2 Test Suite Contracts Inspection (Tier 1 Features 12 to 16)

Analysis of `tests/tier1-features/f12` through `f16` and `tests/helpers/contract-helpers.mjs`:
- **`f12-student-dashboard-api.test.mjs`**:
  - `F12.1`: `student-dashboard/route.ts` must export `async function GET`.
  - `F12.2`: Must check auth (`auth()` / `userId` / `401`).
  - `F12.3`: Must aggregate student record, assigned teacher, and billing state (`student` and `billing`).
  - `F12.4`: `student-profile/route.ts` must export GET and compute attendance metrics (`attendance`, `progress`, `rate`).
- **`f13-teacher-dashboard-api.test.mjs`**:
  - `F13.1`: `teacher-dashboard/route.ts` must export `async function GET`.
  - `F13.2`: Must enforce teacher role (`teacher` and `role`).
  - `F13.3`: Must filter students by `teacherId` (`teacher_id` or `teacherId` or `teacherStudents`).
  - `F13.4`: `update-teacher-profile` and `update-teacher-activity` must exist and export `async function POST`.
- **`f14-attendance-management-api.test.mjs`**:
  - `F14.1`: `attendance/route.ts` must export GET and POST.
  - `F14.2`: POST must enforce staff role (`admin` or `teacher` or `role`).
  - `F14.3`: Must normalize attendance date (`Date` or `toISOString` or `split` or `date`).
  - `F14.4`: Must support valid statuses (`Present`, `Absent`, `Late`, `Excused`).
- **`f15-manual-payment-verification-api.test.mjs`**:
  - `F15.1`: `verify-manual-payment/route.ts` must export POST.
  - `F15.2`: Must validate `studentId`, `transactionId`, `methodUsed`.
  - `F15.3`: Must record `PaymentTicket` with status `Reviewing`.
  - `F15.4`: Must transition `Billing` status to `Reviewing`.
- **`f16-auth-api-handlers.test.mjs`**:
  - `F16.1`: `register/route.ts` must export POST.
  - `F16.2`: Must integrate Clerk (`@clerk` or `clerkClient` or `clerk`).
  - `F16.3`: Must synchronize `student` and `billing` in Prisma.

---

## 2. Logic Chain

1. **Authentication Resolution**:
   - In Next.js App Router route handlers, Clerk's server auth is invoked via:
     ```typescript
     import { auth } from "@clerk/nextjs/server";
     const { userId } = await auth();
     ```
   - For public endpoints (like `student-profile` accessed via `/student-portal?id=...`), `userId` is optional; if present, it provides default scoping. For protected endpoints (`student-dashboard`, `teacher-dashboard`, `update-teacher-profile`, `update-teacher-activity`, `update-student`, staff `attendance`), `!userId` immediately returns `{ success: false, error: "Unauthorized" }, { status: 401 }`.
   - Role authorization must query `prisma.profile.findUnique({ where: { id: userId } })` and verify `profile.role === "teacher"` or `profile.role === "admin"`.

2. **Prisma Singleton Integration**:
   - All database operations must import the singleton client:
     ```typescript
     import { prisma } from "@/lib/prisma";
     ```
   - Zero imports from `@supabase/*` or `@/utils/supabase/*`.

3. **Frontend Contract Fidelity**:
   - **Student Dashboard**: The React page accesses `billing?.length > 0 ? billing[0] : null`. In Prisma, `student.billing` is 1-to-1 (`Billing?`). To maintain 100% compatibility with this array-destructuring frontend code, the API payload must return:
     `billing: student.billing ? [student.billing] : []`.
   - **Teacher Dashboard**: The React page accesses `student._id`, `student.student_name`, `student.live_classroom_link`, `student.last_assignment`, and passes `student._id` to `handleUpdateStudent` and `handleMarkAttendance`. Thus, the student serializer in `teacher-dashboard/route.ts` must output:
     ```typescript
     {
       id: s.id,
       _id: s.id, // Mandatory for UI actions
       studentName: s.studentName,
       student_name: s.studentName,
       parentName: s.parentName,
       parent_name: s.parentName,
       course: s.course,
       enrolled: s.enrolled,
       progress: s.progress ?? 0,
       liveClassroomLink: s.liveClassroomLink || "",
       live_classroom_link: s.liveClassroomLink || "",
       lastAssignment: s.lastAssignment || "",
       last_assignment: s.lastAssignment || "",
       billing: s.billing ? [s.billing] : []
     }
     ```

4. **Security & Boundary Hardening**:
   - **Payment Ticket**: Force `status: "Reviewing"`. Do not allow client override.
   - **Notifications Privacy**: When `targetStudentId` is absent, default filter to `{ isActive: true, type: "Global" }` to prevent targeted student announcements from leaking across accounts.
   - **Progress Clamping**: In `update-student`, clamp progress with `Math.max(0, Math.min(Number(progress), 100))`.
   - **Date Normalization**: In `attendance` and `mark-attendance`, normalize dates to midnight UTC (`targetDate.setUTCHours(0, 0, 0, 0)`) to ensure exact matches against `@db.Date` compound unique constraints `[studentId, date]`.

---

## 3. Caveats

- **No Caveats on Schema Integrity**: All required entities (`Profile`, `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, Enums) are already defined and present in `prisma/schema.prisma`.
- **Clerk User Creation**: In `src/app/api/register/route.ts`, `@clerk/nextjs` v7 requires `const client = await clerkClient(); await client.users.createUser(...)`. If Clerk user creation fails (e.g. duplicate email in Clerk or password criteria not met), the route must catch the error and return `{ success: false, error: err.message }, { status: 400 }`.
- **Resend Email Guard**: The admin notification email send in `register/route.ts` must remain wrapped in an isolated `try/catch` block so external SMTP/network latency never aborts student account creation.

---

## 4. Conclusion & Complete Refactoring Blueprint

The implementing Worker (`worker_m4`) must implement and refactor the following files according to the exact specifications below.

### 4.1 Group 1: Student API Routes

#### 4.1.1 `src/app/api/student-dashboard/route.ts`
- **Imports**:
  ```typescript
  import { NextResponse } from "next/server";
  import { auth } from "@clerk/nextjs/server";
  import { prisma } from "@/lib/prisma";
  ```
- **Logic**:
  1. Authenticate user: `const { userId } = await auth(); if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });`
  2. Query `prisma.student.findFirst` where `OR: [{ profileId: userId }, { id: userId }]`, including:
     - `teacher: { select: { id: true, name: true, email: true } }`
     - `billing: true`
     - `attendances: { orderBy: { date: "desc" }, take: 10 }`
  3. If not found, return `{ success: false, error: "Student not found" }, { status: 404 }`.
  4. Return:
     ```typescript
     return NextResponse.json({
       success: true,
       data: {
         student: {
           id: student.id,
           _id: student.id,
           studentName: student.studentName,
           parentName: student.parentName,
           course: student.course,
           enrolled: student.enrolled,
           progress: student.progress ?? 0,
           liveClassroomLink: student.liveClassroomLink || "",
           lastAssignment: student.lastAssignment || "",
         },
         teacher: student.teacher || null,
         billing: student.billing ? [student.billing] : [],
         attendance: student.attendances.map(a => ({
           id: a.id,
           _id: a.id,
           studentId: a.studentId,
           date: a.date,
           status: a.status,
         })),
       },
     });
     ```

#### 4.1.2 `src/app/api/student-profile/route.ts`
- **Imports**: `NextResponse, NextRequest` from `"next/server"`, `auth` from `"@clerk/nextjs/server"`, `prisma` from `"@/lib/prisma"`.
- **Logic**:
  1. Read `id` from `req.nextUrl.searchParams.get("id")`. If missing, check `const { userId } = await auth();` and resolve `selfStudent` from `prisma.student.findFirst({ where: { OR: [{ id: userId }, { profileId: userId }] } })`.
  2. If still no studentId, return `{ success: false, error: "Valid Student ID parameter required." }, { status: 400 }`.
  3. Query student with `billing`: `prisma.student.findUnique({ where: { id: studentId }, include: { billing: true } })`. If not found, return 404.
  4. Aggregate attendance metrics via `Promise.all`:
     ```typescript
     const todayStart = new Date();
     todayStart.setUTCHours(0, 0, 0, 0);
     const todayEnd = new Date();
     todayEnd.setUTCHours(23, 59, 59, 999);

     const [totalSessions, presentSessions, checkInToday] = await Promise.all([
       prisma.attendance.count({ where: { studentId } }),
       prisma.attendance.count({ where: { studentId, status: "Present" } }),
       prisma.attendance.findFirst({
         where: {
           studentId,
           date: { gte: todayStart, lte: todayEnd },
         },
       }),
     ]);

     const attendanceRate = totalSessions > 0
       ? Math.round((presentSessions / totalSessions) * 100)
       : 100;
     ```
  5. Return `{ success: true, data: { name: student.studentName, studentName: student.studentName, course: student.course || "General Tajweed", attendanceRate, isMarkedToday: !!checkInToday, lastAssignment: student.lastAssignment || "No assignments yet.", enrollmentDate: student.createdAt, progress: student.progress ?? 0, billing: student.billing || { amountDue: "3000 PKR", dueDate: "10th of this month", status: "Pending" }, syllabus: { bookType: "Quran", surahName: "Noorani Qaida Introduction", verseNumber: "Lesson 1" } } }`.

#### 4.1.3 `src/app/api/student-history/route.ts` (New Route)
- **Method**: GET, POST
- **Logic**: Resolves studentId from query/body/session. Queries `prisma.attendance.findMany({ where: { studentId }, orderBy: { date: "desc" } })`. Returns `{ success: true, history }`.

#### 4.1.4 `src/app/api/student-schedule/route.ts` (New Route)
- **Method**: GET
- **Logic**: Resolves caller session via `auth()`. Queries student and assigned teacher. Returns `{ success: true, schedule: { course: student.course, teacher: student.teacher, liveClassroomLink: student.liveClassroomLink, enrolled: student.enrolled } }`.

#### 4.1.5 `src/app/api/student-billing/route.ts` & `src/app/api/billing/route.ts`
- **Method**: GET, POST
- **Logic**:
  - GET: queries `prisma.billing.findUnique({ where: { studentId } })`. Returns `{ success: true, billing: { amountDue, dueDate: "10th of this month", status, lastPaymentDate } }`.
  - POST: verifies admin session (`profile.role === "admin"`). Updates `prisma.billing.update({ where: { studentId }, data: { status } })`. Returns `{ success: true, message: "Invoice state updated successfully!" }`.

---

### 4.2 Group 2: Teacher API Routes

#### 4.2.1 `src/app/api/teacher-dashboard/route.ts`
- **Imports**: `NextResponse` from `"next/server"`, `auth` from `"@clerk/nextjs/server"`, `prisma` from `"@/lib/prisma"`.
- **Logic**:
  1. `const { userId } = await auth(); if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });`
  2. `const profile = await prisma.profile.findUnique({ where: { id: userId } });`
  3. `if (!profile || profile.role !== "teacher") return NextResponse.json({ success: false, error: "Teacher profile not found" }, { status: 404 });`
  4. Query assigned students:
     ```typescript
     const students = await prisma.student.findMany({
       where: { teacherId: profile.id },
       include: { billing: true },
       orderBy: { studentName: "asc" },
     });
     ```
  5. Update `lastActive`:
     ```typescript
     await prisma.profile.update({
       where: { id: profile.id },
       data: { lastActive: new Date() },
     });
     ```
  6. Return:
     ```typescript
     return NextResponse.json({
       success: true,
       data: {
         teacher: profile,
         students: students.map((s) => ({
           id: s.id,
           _id: s.id, // VITAL for frontend action triggers!
           studentId: s.id,
           studentName: s.studentName,
           student_name: s.studentName,
           parentName: s.parentName,
           parent_name: s.parentName,
           course: s.course,
           enrolled: s.enrolled,
           progress: s.progress ?? 0,
           lastAssignment: s.lastAssignment || "",
           last_assignment: s.lastAssignment || "",
           liveClassroomLink: s.liveClassroomLink || "",
           live_classroom_link: s.liveClassroomLink || "",
           billing: s.billing ? [s.billing] : [],
         })),
       },
     });
     ```

#### 4.2.2 `src/app/api/update-teacher-profile/route.ts`
- **Method**: POST
- **Logic**:
  1. Authenticate & verify `profile.role === "teacher"`.
  2. Parse body `{ bio, whatsapp, specializations, profilePhotoUrl }`.
  3. Validate required fields.
  4. `await prisma.profile.update({ where: { id: userId }, data: { bio: bio.trim(), whatsapp: whatsapp.trim(), specializations: Array.isArray(specializations) ? specializations : [specializations], profilePhotoUrl: profilePhotoUrl || null, isProfileComplete: true } });`
  5. Return `{ success: true, message: "Profile updated successfully!" }`.

#### 4.2.3 `src/app/api/update-teacher-activity/route.ts`
- **Method**: POST
- **Logic**:
  1. Authenticate & verify `profile.role === "teacher"`.
  2. `await prisma.profile.update({ where: { id: userId }, data: { lastActive: new Date() } });`
  3. Return `{ success: true }`.

#### 4.2.4 `src/app/api/update-student/route.ts`
- **Method**: POST
- **Logic**:
  1. Authenticate & verify `profile.role === "teacher" || profile.role === "admin"`.
  2. Parse `{ studentId, liveClassroomLink, progress, lastAssignment }`.
  3. Sanitize inputs and clamp `progress`:
     `const safeProgress = !isNaN(Number(progress)) ? Math.max(0, Math.min(Number(progress), 100)) : 0;`
  4. `await prisma.student.update({ where: { id: studentId }, data: { liveClassroomLink: typeof liveClassroomLink === "string" ? liveClassroomLink.trim() : undefined, progress: safeProgress, lastAssignment: typeof lastAssignment === "string" ? lastAssignment.trim() : undefined } });`
  5. Return `{ success: true, message: "Student metrics successfully synchronized." }`.

#### 4.2.5 Additional Teacher Utility Routes (New Routes)
- **`src/app/api/teacher-schedule/route.ts`**: Returns teacher's student roster with course and links.
- **`src/app/api/teacher-classes/route.ts`**: Returns course aggregates for the teacher.
- **`src/app/api/teacher-students/route.ts`**: Returns student roster for the teacher.
- **`src/app/api/teacher-attendance/route.ts`**: Returns student attendance logs for teacher's roster.
- **`src/app/api/add-availability/route.ts`**: Accepts `{ availability, days, timeSlots }` and updates teacher profile bio/details.

---

### 4.3 Group 3: Shared / Attendance / Payments / Auth Routes

#### 4.3.1 `src/app/api/attendance/route.ts`
- **Methods**: GET, POST
- **POST**:
  1. Verify caller has staff role (`role === "admin" || role === "teacher"`).
  2. Validate `studentId`, `status` (`["Present", "Absent", "Late", "Excused"]`).
  3. Standardize date:
     ```typescript
     const targetDate = new Date();
     targetDate.setUTCHours(0, 0, 0, 0);
     ```
  4. Prisma Upsert:
     ```typescript
     await prisma.attendance.upsert({
       where: {
         studentId_date: {
           studentId,
           date: targetDate,
         },
       },
       update: {
         status,
         markedById: userId,
       },
       create: {
         studentId,
         date: targetDate,
         status,
         markedById: userId,
       },
     });
     ```
  5. Return `{ success: true, message: `Student successfully marked as ${status}.` }`.
- **GET**:
  1. Authenticate caller (401 if unauth).
  2. Parse `studentId = searchParams.get("studentId")`.
  3. Compute cutoff: `thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); thirtyDaysAgo.setUTCHours(0, 0, 0, 0);`
  4. Query:
     ```typescript
     const logs = await prisma.attendance.findMany({
       where: {
         date: { gte: thirtyDaysAgo },
         ...(studentId ? { studentId } : {}),
       },
       include: { markedBy: { select: { name: true } } },
       orderBy: { date: "desc" },
     });
     ```
  5. Serialize to `{ _id: log.id, id: log.id, studentId: log.studentId, date: log.date.toISOString().split("T")[0], status: log.status, markedBy: log.markedBy?.name || "System" }`.
  6. Return `{ success: true, logs: safeLogs }`.

#### 4.3.2 `src/app/api/mark-attendance/route.ts` & `src/app/api/my-attendance/route.ts`
- Refactor to Prisma singleton, using `prisma.attendance.upsert` with standardized UTC date and `prisma.attendance.findMany` for history.

#### 4.3.3 `src/app/api/verify-manual-payment/route.ts`
- **Method**: POST
- **Logic**:
  1. Parse `{ studentId, transactionId, methodUsed }`. If any missing, return 400.
  2. `const cleanTxId = transactionId.trim().toUpperCase();`
  3. Duplicate check:
     ```typescript
     const existing = await prisma.paymentTicket.findUnique({
       where: { transactionId: cleanTxId },
     });
     if (existing) {
       return NextResponse.json({ success: false, error: "This Transaction ID has already been submitted." }, { status: 400 });
     }
     ```
  4. Create `PaymentTicket`:
     ```typescript
     await prisma.paymentTicket.create({
       data: {
         studentId,
         transactionId: cleanTxId,
         methodUsed,
         status: "Reviewing",
       },
     });
     ```
  5. Synchronize `Billing`:
     ```typescript
     await prisma.billing.upsert({
       where: { studentId },
       update: { status: "Reviewing" },
       create: { studentId, amountDue: "3000 PKR", status: "Reviewing" },
     });
     ```
  6. Return `{ success: true, message: "Receipt logged successfully!" }`.

#### 4.3.4 `src/app/api/login/route.ts`
- **Method**: POST
- **Logic**:
  1. Parse `{ email, password }`. If missing, return 400.
  2. `const cleanEmail = email.trim().toLowerCase();`
  3. Find profile: `const profile = await prisma.profile.findUnique({ where: { email: cleanEmail } });`
  4. If not found, return `{ success: false, error: "Invalid login credentials." }, { status: 401 }`.
  5. If `profile.role === "student"`, find student: `prisma.student.findUnique({ where: { profileId: profile.id }, include: { billing: true } })`.
  6. Return legacy JSON contract with zero Supabase dependencies.

#### 4.3.5 `src/app/api/register/route.ts`
- **Method**: POST
- **Logic**:
  1. Validate `{ parentName, email, whatsappNumber, studentName, studentAge, selectedCourse, password }`.
  2. `const cleanEmail = email.trim().toLowerCase();`
  3. Create Clerk user via Clerk SDK:
     ```typescript
     import { clerkClient } from "@clerk/nextjs/server";
     let clerkUserId = "";
     try {
       const client = await clerkClient();
       const clerkUser = await client.users.createUser({
         emailAddress: [cleanEmail],
         password,
         firstName: studentName.trim(),
         publicMetadata: { role: "student" },
       });
       clerkUserId = clerkUser.id;
     } catch (clerkErr: any) {
       return NextResponse.json({ success: false, error: clerkErr.message || "Registration failed." }, { status: 400 });
     }
     ```
  4. Create Prisma `Profile`:
     ```typescript
     await prisma.profile.create({
       data: {
         id: clerkUserId,
         name: studentName.trim(),
         email: cleanEmail,
         role: "student",
         whatsapp: whatsappNumber ? String(whatsappNumber).trim() : null,
         isProfileComplete: true,
       },
     });
     ```
  5. Create Prisma `Student`:
     ```typescript
     const student = await prisma.student.create({
       data: {
         profileId: clerkUserId,
         studentName: studentName.trim(),
         parentName: parentName.trim(),
         course: selectedCourse,
         enrolled: false,
         progress: 0,
         lastAssignment: "Welcome! Complete your payment to activate your student terminal.",
       },
     });
     ```
  6. Create initial `Billing`:
     ```typescript
     await prisma.billing.create({
       data: {
         studentId: student.id,
         amountDue: "3000 PKR",
         status: "Pending",
       },
     });
     ```
  7. Resend admin email dispatch wrapped in isolated try/catch.
  8. Return `{ success: true, studentId: student.id }`.

---

### 4.4 Group 4: Milestone M3 Hardening Items

#### 4.4.1 `src/app/api/payment-ticket/route.ts`
- **Target**: Lines 46-53.
- **Change**: Replace client status mapping with unconditional enforcement:
  ```typescript
  // Enforce ticket status Reviewing unconditionally on client submission
  const ticketStatus = "Reviewing";
  ```

#### 4.4.2 `src/app/api/notifications/route.ts`
- **Target**: Lines 34-42.
- **Change**: Replace fallback with type scoping:
  ```typescript
  const where: any = targetStudentId
    ? {
        isActive: true,
        OR: [
          { type: "Global" },
          { type: "Targeted", targetStudentId },
        ],
      }
    : { isActive: true, type: "Global" };
  ```

---

## 5. Verification Method

### 5.1 Verification Commands

1. **Verify Complete Absence of Supabase in Target Routes**:
   ```bash
   grep -rn "@supabase" src/app/api/student-dashboard/ src/app/api/student-profile/ src/app/api/billing/ src/app/api/teacher-dashboard/ src/app/api/update-teacher-profile/ src/app/api/update-teacher-activity/ src/app/api/update-student/ src/app/api/attendance/ src/app/api/mark-attendance/ src/app/api/my-attendance/ src/app/api/verify-manual-payment/ src/app/api/login/ src/app/api/register/
   ```
   *Expected Output*: Zero matches.

2. **Run Tier 1 Contract Test Suites (F12 through F16)**:
   ```bash
   node tests/tier1-features/f12-student-dashboard-api.test.mjs
   node tests/tier1-features/f13-teacher-dashboard-api.test.mjs
   node tests/tier1-features/f14-attendance-management-api.test.mjs
   node tests/tier1-features/f15-manual-payment-verification-api.test.mjs
   node tests/tier1-features/f16-auth-api-handlers.test.mjs
   ```
   *Expected Output*: All test assertions pass with 0 failures.

3. **Run M3 Regression Tests**:
   ```bash
   node tests/tier1-features/f08-public-courses-api.test.mjs
   node tests/tier1-features/f09-public-teachers-teach-api.test.mjs
   node tests/tier1-features/f10-notifications-tickets-api.test.mjs
   node tests/tier1-features/f11-student-self-attendance-api.test.mjs
   ```
   *Expected Output*: All test assertions pass with 0 failures.

4. **Run Tier 3 Cross-Feature Integration Flows**:
   ```bash
   node tests/run-all.mjs --tier=3
   ```
   *Expected Output*: All 4 integration lifecycle flows pass.
