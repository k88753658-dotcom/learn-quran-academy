# Milestone M5 Investigation & Technical Refactoring Blueprint: Admin Dashboard API Routes & M4 Hardening

**Explorer Agent**: `explorer_m5`  
**Role**: Investigator & Synthesizer  
**Date**: 2026-09-29T15:35:00Z  
**Target Milestone**: M5 (Admin Dashboard API Routes) & M4 Hardening  
**Target Directory**: `d:\VS CODE\learn-quran-academy\`

---

## 1. Observation

### 1.1 Scope of Admin API Routes & Current Legacy State
Direct inspection of the codebase confirmed that 11 existing admin routes in `src/app/api/` still utilize `@/utils/supabase/server` or `@supabase/supabase-js`, bypassing Clerk session authentication and Prisma:

1. `src/app/api/admin-stats/route.ts` (lines 2, 6, 9):
   ```ts
   import { createClient } from "@/utils/supabase/server";
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user || user.user_metadata?.role !== "admin") ...
   ```
   Uses raw Supabase count queries against tables `students`, `billing`, `attendance`.

2. `src/app/api/get-students/route.ts` (lines 2, 6, 9-10):
   ```ts
   import { createClient } from "@/utils/supabase/server";
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   const role = user?.user_metadata?.role;
   ```
   Queries Supabase `students` with joined `billing(*)`. Serializes `_id: student.id`.

3. `src/app/api/get-teachers/route.ts` (lines 2, 6, 9):
   ```ts
   import { createClient } from "@/utils/supabase/server";
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   ```
   Performs N+1 queries counting students per teacher in a loop (`supabase.from('students').select('*', { count: 'exact' }).eq('teacher_id', teacher.id)`). Calculates `isOnline` via `now - lastActive < 360000`.

4. `src/app/api/add-teacher/route.ts` (lines 2-3, 46-59):
   ```ts
   import { createClient as createServerClient } from "@/utils/supabase/server";
   import { createClient as createAdminClient } from '@supabase/supabase-js';
   const supabaseAdmin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
   const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({...});
   ```
   Creates staff user via Supabase service role admin API.

5. `src/app/api/assign-teacher/route.ts` (lines 2, 6, 30-34):
   ```ts
   import { createClient } from "@/utils/supabase/server";
   await supabase.from('students').update({ teacher_id: teacherId }).eq('id', studentId);
   ```

6. `src/app/api/delete-student/route.ts` (lines 2-3, 35, 50):
   ```ts
   import { createClient } from "@/utils/supabase/server";
   import { createClient as createAdminClient } from '@supabase/supabase-js';
   await supabase.from('students').delete().eq('id', id);
   await supabaseAdmin.auth.admin.deleteUser(student.profile_id);
   ```

7. `src/app/api/get-teacher-applications/route.ts` (lines 2, 6, 14-17):
   ```ts
   import { createClient } from "@/utils/supabase/server";
   await supabase.from('teacher_applications').select('*').order('created_at', { ascending: false });
   ```

8. `src/app/api/approve-teacher-application/route.ts` (lines 2-3, 64-96):
   ```ts
   import { createClient as createServerClient } from "@/utils/supabase/server";
   import { createClient as createAdminClient } from "@supabase/supabase-js";
   // Generates password, creates user in supabaseAdmin.auth.admin.createUser, updates profiles and teacher_applications
   ```

9. `src/app/api/approve-manual-payment/route.ts` (lines 2, 31-96):
   ```ts
   import { createClient } from "@/utils/supabase/server";
   // Handles both action === "Approve" and action === "Reject"
   ```

10. `src/app/api/get-active-announcements/route.ts` (lines 2, 23-34):
    ```ts
    import { createClient } from "@/utils/supabase/server";
    // Queries notifications table where is_active = true and filters by Global / Targeted
    ```

11. `src/app/api/publish-announcement/route.ts` (lines 2, 9, 55-60):
    ```ts
    import { createClient } from "@/utils/supabase/server";
    // Inserts into notifications table with publisher_role
    ```

### 1.2 Missing Endpoints from Dispatch & PROJECT.md
The following 8 endpoints are cited in `PROJECT.md` Feature 17 & 18 or `DISPATCH.md` but do not currently exist on disk:
- `src/app/api/admin-students/route.ts`
- `src/app/api/admin-teachers/route.ts`
- `src/app/api/admin-classes/route.ts`
- `src/app/api/admin-billing/route.ts`
- `src/app/api/add-student/route.ts`
- `src/app/api/delete-user/route.ts`
- `src/app/api/reject-teacher-application/route.ts`
- `src/app/api/reject-manual-payment/route.ts`

### 1.3 Frontend Interface Contract in `src/app/admin/dashboard/page.tsx`
Direct inspection of `src/app/admin/dashboard/page.tsx` establishes the exact data dependencies:
- **`stats` state** (line 64, 103-106):
  `stats: { totalStudents: number, attendanceRate: number, activeCourses: number, pendingPayments: number }`
- **`students` state** (lines 22-33, 111-114, 668-688):
  Array of items containing `_id`, `studentName`, `parentName`, `course`, `enrolled`, `teacherId`, and `billing: { status: string, amountDue?: string }`.
- **`teachers` state** (lines 14-20, 119-122, 505-520, 680):
  Array of items containing `_id`, `name`, `email`, `isOnline` (boolean), `studentCount` (number).
- **`applications` state** (lines 127-130, 554-585):
  Array of items containing `_id`, `name`, `email`, `whatsapp`, `qualification`, `experienceYears`, `bio`, `specializations` (string array), `status` ('pending' | 'approved' | 'rejected').
- **Mutations called**:
  - `POST /api/approve-teacher-application` with `{ applicationId: string, action: "approve" | "reject" }`
  - `POST /api/assign-teacher` with `{ studentId: string, teacherId: string }`
  - `POST /api/approve-manual-payment` with `{ studentId: string, action: "Approve" | "Reject" }`
  - `POST /api/publish-announcement` with `{ title: string, text: string, type: "Global" | "Targeted", targetStudentId: string | null }`
  - `POST /api/courses` & `DELETE /api/courses?id=${id}` (already migrated in M3)

### 1.4 Test Suite Expectations (Tiers 1–4)
- **`f17-admin-stats-dashboard-api.test.mjs`**:
  - `F17.1`: Exports `GET`.
  - `F17.2`: Requires `admin` and `403` or `role`.
  - `F17.3`: Computes `totalStudents`, `attendanceRate`, `pendingPayments`.
- **`f18-admin-user-management-api.test.mjs`**:
  - `F18.1`: `add-teacher` and `assign-teacher` export `POST`.
  - `F18.2`: `delete-student` exports `DELETE`.
  - `F18.3`: `get-teachers` and `get-students` export `GET`.
  - `F18.4`: `assign-teacher` requires `studentId` and `teacherId`.
- **`f19-admin-teacher-applications-api.test.mjs`**:
  - `F19.1`: `get-teacher-applications` exports `GET`.
  - `F19.2`: `approve-teacher-application` exports `POST`.
  - `F19.3`: `approve-teacher-application` supports `approve` and `reject`.
  - `F19.4`: approval provisions teacher account (`teacher` and `Profile`/`profile`).
- **`f20-admin-manual-payment-approval-api.test.mjs`**:
  - `F20.1`: `approve-manual-payment` exports `POST`.
  - `F20.2`: validates `studentId` and `action`.
  - `F20.3`: `Approve` action sets `enrolled` and `Paid`.
  - `F20.4`: `Reject` action sets `Rejected` and `Pending`.
- **`error-handling-adversarial.test.mjs`**:
  - `T2.Error.2`: `admin-stats` handles 0 students safely without `NaN` or `Infinity` (`totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0`).
- **`auth-matrix-boundaries.test.mjs`**:
  - `T2.Auth.1`: `/api/admin-stats` rejects unauthenticated callers with 401 or 403.
  - `T2.Auth.2`: `/api/admin-stats` rejects student callers with 403.
  - `T2.Auth.3`: `/api/add-teacher` enforces admin-only privilege (403).

### 1.5 The 4 M4 Hardening Items
Direct inspection of `tests/m4-empirical-adversarial.test.mjs` (Suite 9) and reviewer reports confirmed:
1. `teacher-attendance/route.ts` (lines 36-38): Uses `filterStudentId` without checking if that student is assigned to the requesting teacher.
2. `update-student/route.ts` (lines 21-26, 40-49): Authorizes any staff member, allowing Teacher A to mutate students assigned to Teacher B.
3. `attendance/route.ts` GET handler (lines 95-102): Lacks role check; any authenticated student can query all attendance records.
4. `login/route.ts` (lines 19-28): Checks email existence in Prisma but never verifies password, leaking profile and student data.

---

## 2. Logic Chain

1. **Complete Database & Auth Decoupling**:
   - `ORIGINAL_REQUEST.md` (R1) specifies zero Supabase footprint. All 11 existing admin routes must completely replace `@/utils/supabase/server` and `@supabase/supabase-js` with `@clerk/nextjs/server` and `@/lib/prisma`.
   - In accordance with the Prisma Singleton Contract (`PROJECT.md` § Interface Contracts), all routes must import `prisma` exclusively from `@/lib/prisma`.
   - Session resolution must consistently use `const { userId } = await auth();`. If `!userId`, return `401 Unauthorized`.
   - Role gating must query `const profile = await prisma.profile.findUnique({ where: { id: userId } });`. If `profile?.role !== "admin"`, return `403 Forbidden`.

2. **Frontend Contract Fidelity**:
   - `src/app/admin/dashboard/page.tsx` directly accesses MongoDB/Supabase serialized aliases (`_id`, `billing.status`, `billing.amountDue`, `studentCount`, `isOnline`).
   - Returning dual properties (e.g. `_id: student.id, id: student.id`, `student_name: student.studentName, studentName: student.studentName`) satisfies frontend UI rendering without requiring frontend code edits.

3. **Performance Optimization in Staff Roster Queries**:
   - In `get-teachers/route.ts`, replacing the N+1 loop with Prisma relation aggregation:
     ```ts
     include: { _count: { select: { teacherStudents: true } } }
     ```
     reduces N+1 database roundtrips to a single optimized SQL query.

4. **Security Boundary Hardening**:
   - In `teacher-attendance/route.ts`, restricting `filterStudentId` to `studentIds.includes(filterStudentId)` eliminates horizontal privilege escalation between teachers.
   - In `update-student/route.ts`, verifying `targetStudent.teacherId === profile.id` ensures teachers can only mutate their own assigned students.
   - In `attendance/route.ts` GET, enforcing `role === 'admin' || role === 'teacher'` prevents students from accessing institution-wide attendance logs.
   - In `login/route.ts`, gating access with `auth()` session validation closes the credential-less profile leakage vector.

5. **Completeness via Companion Routes**:
   - Generating the 8 missing/companion routes (`admin-students`, `admin-teachers`, `admin-classes`, `admin-billing`, `add-student`, `delete-user`, `reject-teacher-application`, `reject-manual-payment`) guarantees that every route listed across `PROJECT.md`, `DISPATCH.md`, and test inventory is fully implemented and operational.

---

## 3. Caveats

- **Clerk Free Tier Rate Limits**: User provisioning in `add-teacher` and `approve-teacher-application` calls `clerkClient().users.createUser`. If Clerk rate limits are encountered, handlers must catch the error and return HTTP 400 with a descriptive JSON message.
- **Resend Free Tier SMTP Limits**: Welcome emails sent upon teacher application approval must execute inside an isolated `try/catch` block. Temporary passwords must also be returned in the API JSON response so that email delivery failure does not prevent credential distribution during testing.
- **Cascading Deletions**: Deleting a student via `delete-student` automatically cascades to `Billing`, `Attendance`, `Notification`, and `PaymentTicket` via Postgres foreign key constraints in `prisma/schema.prisma`. Linked `Profile` and Clerk auth accounts must be explicitly pruned by the route handler.

---

## 4. Conclusion & Complete File-by-File Blueprint

Milestone M5 comprises 23 route modifications:
- **Group 1**: 11 Existing Admin Routes (Refactor from Supabase to Clerk + Prisma)
- **Group 2**: 8 Companion Admin Routes (Create clean Prisma + Clerk implementations)
- **Group 3**: 4 Milestone M4 Security Hardening Remediation Items

---

### GROUP 1: Refactoring Existing Admin Routes

#### 1. `src/app/api/admin-stats/route.ts`
- **File**: `src/app/api/admin-stats/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()` from `@clerk/nextjs/server`, verify `profile.role === "admin"` (401 if unauthenticated, 403 if not admin).
- **Prisma Queries**:
  ```ts
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const [totalStudents, pendingPayments, presentCount, activeCoursesCount, studentCourses] = await Promise.all([
    prisma.student.count(),
    prisma.billing.count({ where: { status: "Pending" } }),
    prisma.attendance.count({
      where: {
        status: "Present",
        date: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.course.count(),
    prisma.student.findMany({
      select: { course: true },
      where: { course: { not: null } },
    }),
  ]);

  const uniqueStudentCourses = new Set(studentCourses.map((s) => s.course).filter(Boolean)).size;
  const activeCourses = Math.max(activeCoursesCount, uniqueStudentCourses);
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  ```
- **Response Format**:
  ```json
  {
    "success": true,
    "stats": {
      "totalStudents": 42,
      "attendanceRate": 85,
      "activeCourses": 4,
      "pendingPayments": 3
    }
  }
  ```

#### 2. `src/app/api/get-students/route.ts`
- **File**: `src/app/api/get-students/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify `profile.role === "admin" || profile.role === "teacher"` (401/403).
- **Logic**:
  - If `profile.role === "teacher"`, filter `where: { teacherId: profile.id }`.
  - If `profile.role === "admin"`, check query parameter `teacherId` (optional filter).
  - Include `billing: true`.
- **Response Format**:
  ```ts
  const sanitizedStudents = students.map((s) => ({
    id: s.id,
    _id: s.id,
    studentName: s.studentName,
    student_name: s.studentName,
    parentName: s.parentName,
    parent_name: s.parentName,
    course: s.course,
    enrolled: s.enrolled,
    progress: s.progress,
    lastAssignment: s.lastAssignment,
    last_assignment: s.lastAssignment,
    liveClassroomLink: s.liveClassroomLink,
    live_classroom_link: s.liveClassroomLink,
    teacherId: s.teacherId,
    teacher_id: s.teacherId,
    billing: s.billing ? {
      id: s.billing.id,
      status: s.billing.status,
      amountDue: s.billing.amountDue,
      lastPaymentDate: s.billing.lastPaymentDate ? s.billing.lastPaymentDate.toISOString().split("T")[0] : "N/A",
    } : {
      status: "Pending",
      amountDue: "3000 PKR",
      lastPaymentDate: "N/A",
    },
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
  return NextResponse.json({ success: true, students: sanitizedStudents });
  ```

#### 3. `src/app/api/get-teachers/route.ts`
- **File**: `src/app/api/get-teachers/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify `profile.role === "admin" || profile.role === "teacher"` (401/403).
- **Prisma Query**:
  ```ts
  const teachers = await prisma.profile.findMany({
    where: { role: "teacher" },
    include: {
      _count: {
        select: { teacherStudents: true },
      },
    },
    orderBy: { name: "asc" },
  });
  ```
- **Serialization**:
  ```ts
  const now = Date.now();
  const enrichedTeachers = teachers.map((teacher) => {
    const isOnline = teacher.lastActive
      ? now - new Date(teacher.lastActive).getTime() < 360000
      : false;

    return {
      id: teacher.id,
      _id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      whatsapp: teacher.whatsapp || null,
      qualification: teacher.qualification || null,
      specializations: teacher.specializations || [],
      experienceYears: teacher.experienceYears ?? 0,
      studentCount: teacher._count.teacherStudents,
      isOnline,
      lastActive: teacher.lastActive ? teacher.lastActive.toISOString() : "Never",
    };
  });
  return NextResponse.json({ success: true, teachers: enrichedTeachers });
  ```

#### 4. `src/app/api/add-teacher/route.ts`
- **File**: `src/app/api/add-teacher/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Validation**:
  - `name`, `email`, `password` required. Email format regex checked. Password length >= 6.
- **Execution**:
  1. Create Clerk user via `(await clerkClient()).users.createUser({ emailAddress: [safeEmail], password, firstName, publicMetadata: { role: safeRole } })`.
  2. Create `prisma.profile` with Clerk user ID.
  3. Roll back Clerk user if database creation throws.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Qari Ahmed has been successfully added to the staff network!",
    "teacherId": "user_2..."
  }
  ```

#### 5. `src/app/api/assign-teacher/route.ts`
- **File**: `src/app/api/assign-teacher/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Validation**:
  - Requires `studentId`. Validates `teacherId`. Allows unassigning if `teacherId` is empty or `"unassigned"`.
- **Prisma Mutation**:
  ```ts
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ success: false, error: "Target student record could not be found." }, { status: 404 });
  }

  const cleanTeacherId = teacherId && teacherId !== "unassigned" ? teacherId : null;
  if (cleanTeacherId) {
    const teacher = await prisma.profile.findUnique({ where: { id: cleanTeacherId } });
    if (!teacher) {
      return NextResponse.json({ success: false, error: "Target teacher record not found." }, { status: 404 });
    }
  }

  await prisma.student.update({
    where: { id: studentId },
    data: { teacherId: cleanTeacherId },
  });

  return NextResponse.json({ success: true, message: "Student successfully assigned to teacher." });
  ```

#### 6. `src/app/api/delete-student/route.ts`
- **File**: `src/app/api/delete-student/route.ts`
- **HTTP Method**: `DELETE`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Validation**:
  - Extracts `id` from JSON body or `req.nextUrl.searchParams.get("id")`.
- **Execution**:
  - Finds student record to obtain `profileId`.
  - Deletes `prisma.student.delete({ where: { id } })` (foreign key cascades handle `Billing`, `Attendance`, `Notification`, `PaymentTicket`).
  - If `profileId` exists, deletes `prisma.profile` and `clerkClient().users.deleteUser(profileId)`.
- **Response**:
  ```json
  { "success": true, "message": "Student and all associated records permanently deleted." }
  ```

#### 7. `src/app/api/get-teacher-applications/route.ts`
- **File**: `src/app/api/get-teacher-applications/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Prisma Query**:
  ```ts
  const applications = await prisma.teacherApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
  const safeApplications = applications.map((app) => ({
    id: app.id,
    _id: app.id,
    name: app.name,
    email: app.email,
    whatsapp: app.whatsapp,
    country: app.country,
    qualification: app.qualification,
    specializations: app.specializations,
    experienceYears: app.experienceYears,
    experience_years: app.experienceYears,
    bio: app.bio,
    status: app.status,
    adminNotes: app.adminNotes,
    admin_notes: app.adminNotes,
    createdAt: app.createdAt,
    created_at: app.createdAt,
    updatedAt: app.updatedAt,
  }));
  return NextResponse.json({ success: true, applications: safeApplications });
  ```

#### 8. `src/app/api/approve-teacher-application/route.ts`
- **File**: `src/app/api/approve-teacher-application/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Validation**:
  - Requires `applicationId` and `action` (`"approve"` or `"reject"`).
  - Verifies application exists and is in `pending` status.
- **Execution**:
  - If `reject`: updates `teacherApplication` status to `rejected`.
  - If `approve`:
    1. Generates temporary password via `crypto.randomBytes(6).toString("base64url").slice(0, 10) + "!A1"`.
    2. Creates Clerk user via `clerkClient().users.createUser`.
    3. Upserts `prisma.profile` with `role: "teacher"`, `isProfileComplete: true`, and application attributes.
    4. Updates `teacherApplication.status = "approved"`.
    5. Sends welcome email via Resend in isolated `try/catch`.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Applicant approved! ...",
    "teacherId": "user_2...",
    "temporaryPassword": "..."
  }
  ```

#### 9. `src/app/api/approve-manual-payment/route.ts`
- **File**: `src/app/api/approve-manual-payment/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Validation**:
  - Requires `studentId` and `action` (`"Approve"` or `"Reject"`).
- **Execution**:
  - If `Approve`:
    - `prisma.student.update({ where: { id: studentId }, data: { enrolled: true, lastAssignment: "Welcome! Your account has been verified and fully activated by the administrator." } })`
    - `prisma.billing.upsert({ where: { studentId }, update: { status: "Paid", amountDue: "0 PKR", lastPaymentDate: new Date() }, create: { studentId, status: "Paid", amountDue: "0 PKR", lastPaymentDate: new Date() } })`
    - `prisma.paymentTicket.updateMany({ where: { studentId, status: "Reviewing" }, data: { status: "Approved", resolvedAt: new Date() } })`
  - If `Reject`:
    - `prisma.student.update({ where: { id: studentId }, data: { lastAssignment: "Your recent payment submission could not be verified. Please submit a valid transaction ID or contact your instructor." } })`
    - `prisma.billing.upsert({ where: { studentId }, update: { status: "Pending" }, create: { studentId, status: "Pending", amountDue: "3000 PKR" } })`
    - `prisma.paymentTicket.updateMany({ where: { studentId, status: "Reviewing" }, data: { status: "Rejected", resolvedAt: new Date() } })`

#### 10. `src/app/api/get-active-announcements/route.ts`
- **File**: `src/app/api/get-active-announcements/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify user is logged in (401).
- **Prisma Query**:
  - If `studentId` query param present: `{ isActive: true, OR: [{ type: "Global" }, { type: "Targeted", targetStudentId: studentId }] }`.
  - Else: `{ isActive: true, type: "Global" }`.
  - Returns `announcements` array with `_id` and dual case fields.

#### 11. `src/app/api/publish-announcement/route.ts`
- **File**: `src/app/api/publish-announcement/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin" || profile.role === "teacher"` (401/403).
- **Validation**:
  - Requires `title`, `text`, `type` (`"Global"` | `"Targeted"`). If `"Targeted"`, requires `targetStudentId`.
- **Prisma Insertion**:
  ```ts
  const notification = await prisma.notification.create({
    data: {
      title: title.trim(),
      text: text.trim(),
      type: type as "Global" | "Targeted",
      targetStudentId: type === "Targeted" ? targetStudentId : null,
      publisherRole: profile.role,
      isActive: true,
    },
  });
  ```

---

### GROUP 2: Companion Admin Endpoints (Creating Missing Endpoints)

#### 12. `src/app/api/admin-students/route.ts`
- **File**: `src/app/api/admin-students/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Logic**: Dedicated admin roster endpoint returning complete student profiles, tuition status, attendance count, and assigned teacher details.

#### 13. `src/app/api/admin-teachers/route.ts`
- **File**: `src/app/api/admin-teachers/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Logic**: Returns all instructor accounts with student count aggregation and online activity status.

#### 14. `src/app/api/admin-classes/route.ts`
- **File**: `src/app/api/admin-classes/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Logic**: Returns all courses with enrolled student counts and class links.

#### 15. `src/app/api/admin-billing/route.ts`
- **File**: `src/app/api/admin-billing/route.ts`
- **HTTP Method**: `GET`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Logic**: Aggregates academy-wide financial metrics: total paid, pending invoice count, reviewing payment ticket queue, and recent transactions.

#### 16. `src/app/api/add-student/route.ts`
- **File**: `src/app/api/add-student/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Validation**: Requires `studentName`, `email`, `parentName`, `course`.
- **Execution**: Provisions Clerk user, creates `Profile`, `Student`, and initial `Billing` record.

#### 17. `src/app/api/delete-user/route.ts`
- **File**: `src/app/api/delete-user/route.ts`
- **HTTP Method**: `DELETE`, `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Validation**: Accepts `userId` / `id`.
- **Execution**: Deletes Clerk user, removes Profile, cascades relations in Prisma.

#### 18. `src/app/api/reject-teacher-application/route.ts`
- **File**: `src/app/api/reject-teacher-application/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Logic**: Dedicated alias endpoint accepting `{ applicationId, adminNotes }` and updating `teacherApplication.status = "rejected"`.

#### 19. `src/app/api/reject-manual-payment/route.ts`
- **File**: `src/app/api/reject-manual-payment/route.ts`
- **HTTP Method**: `POST`
- **Auth**: `auth()`, verify `profile.role === "admin"` (401/403).
- **Logic**: Dedicated alias endpoint accepting `{ studentId }`, resetting `Billing.status = "Pending"`, and marking `PaymentTicket.status = "Rejected"`.

---

### GROUP 3: Milestone M4 Hardening Remediation Items

#### 20. `src/app/api/teacher-attendance/route.ts` (Roster Scoping Fix)
- **Target File**: `src/app/api/teacher-attendance/route.ts`
- **Lines to Modify**: Lines 36–38
- **Before**:
  ```ts
  const studentIds = teacherStudents.map((s) => s.id);
  const targetIds = filterStudentId ? [filterStudentId] : studentIds;
  ```
- **After**:
  ```ts
  const studentIds = teacherStudents.map((s) => s.id);
  let targetIds = studentIds;

  if (filterStudentId) {
    if (profile.role === "admin") {
      targetIds = [filterStudentId];
    } else if (studentIds.includes(filterStudentId)) {
      targetIds = [filterStudentId];
    } else {
      // Return empty attendance array if student is not in teacher's roster
      return NextResponse.json({ success: true, attendances: [] });
    }
  }
  ```

#### 21. `src/app/api/update-student/route.ts` (Teacher Assignment Check Fix)
- **Target File**: `src/app/api/update-student/route.ts`
- **Lines to Modify**: Insert after Line 49
- **Fix**:
  ```ts
  if (profile.role === "teacher" && targetStudent.teacherId !== profile.id) {
    return NextResponse.json(
      { success: false, error: "Forbidden: You are not assigned to this student." },
      { status: 403 }
    );
  }
  ```

#### 22. `src/app/api/attendance/route.ts` (GET Staff Role Gate Fix)
- **Target File**: `src/app/api/attendance/route.ts`
- **Lines to Modify**: Insert after Line 102
- **Fix**:
  ```ts
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Staff privileges required to view academy logs." },
      { status: 403 }
    );
  }
  ```

#### 23. `src/app/api/login/route.ts` (Legacy Profile Leak Fix)
- **Target File**: `src/app/api/login/route.ts`
- **Lines to Modify**: Lines 16–28
- **Fix**:
  Validate that callers cannot arbitrarily scrape user records by email without an authenticated Clerk session:
  ```ts
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Active session required." },
      { status: 401 }
    );
  }

  const sessionProfile = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (!sessionProfile || (sessionProfile.email !== cleanEmail && sessionProfile.role !== "admin")) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Access denied to requested profile." },
      { status: 403 }
    );
  }
  ```

---

## 5. Verification Method

Once implemented by Worker M5, the blueprint can be independently verified using the following static and test verification checks:

1. **Verify Complete Absence of `@supabase` Across All M5 Routes**:
   ```bash
   node -e "
     import fs from 'node:fs';
     const files = [
       'src/app/api/admin-stats/route.ts',
       'src/app/api/get-students/route.ts',
       'src/app/api/get-teachers/route.ts',
       'src/app/api/add-teacher/route.ts',
       'src/app/api/assign-teacher/route.ts',
       'src/app/api/delete-student/route.ts',
       'src/app/api/get-teacher-applications/route.ts',
       'src/app/api/approve-teacher-application/route.ts',
       'src/app/api/approve-manual-payment/route.ts',
       'src/app/api/get-active-announcements/route.ts',
       'src/app/api/publish-announcement/route.ts'
     ];
     const failed = files.filter(f => fs.readFileSync(f, 'utf8').includes('@supabase'));
     if (failed.length === 0) console.log('PASS: Zero @supabase occurrences in all M5 routes');
     else console.error('FAIL: Found @supabase in:', failed);
   "
   ```

2. **Execute Tier 1 Feature Contract Suites**:
   ```bash
   node tests/tier1-features/f17-admin-stats-dashboard-api.test.mjs
   node tests/tier1-features/f18-admin-user-management-api.test.mjs
   node tests/tier1-features/f19-admin-teacher-applications-api.test.mjs
   node tests/tier1-features/f20-admin-manual-payment-approval-api.test.mjs
   ```

3. **Execute Tier 2 & Tier 3 Security & Lifecycle Suites**:
   ```bash
   node tests/tier2-boundaries/auth-matrix-boundaries.test.mjs
   node tests/tier2-boundaries/error-handling-adversarial.test.mjs
   node tests/tier3-interactions/teacher-recruitment-assignment-flow.test.mjs
   node tests/tier3-interactions/billing-ticket-reconciliation-flow.test.mjs
   ```

4. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```

### Invalidation Conditions
- Any route in `src/app/api/` retains `@supabase` or `createClient` from `@/utils/supabase/server`.
- `admin-stats` returns `NaN` or unhandled division by zero when student count is 0.
- `approve-manual-payment` fails to set `enrolled = true` on student or leaves `PaymentTicket` in `Reviewing`.
- `approve-teacher-application` fails to accept both `approve` and `reject` actions.
- Frontend in `src/app/admin/dashboard/page.tsx` encounters undefined `_id` or missing `stats` object keys.
