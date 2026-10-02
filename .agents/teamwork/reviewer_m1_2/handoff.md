# Milestone 1 Independent Review Report — Database Schema & Neon Prisma Client

**Reviewer**: `reviewer_m1_2` (teamwork_preview_reviewer)  
**Roles**: Reviewer, Adversarial Critic  
**Date**: 2026-09-29  
**Review Target**: Worker M1 Deliverables (`worker_m1/handoff.md`)  
**Verdict**: **APPROVE**

---

## 1. Observation

### 1.1 Direct Inspection of `prisma/schema.prisma`
- **Models & Enums Defined**: 8 models (`Profile`, `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, `Course`, `TeacherApplication`) and 6 enums (`UserRole`, `BillingStatus`, `AttendanceStatus`, `NotificationType`, `TicketStatus`, `ApplicationStatus`).
- **BillingStatus Enum** (`prisma/schema.prisma`, lines 23–28):
  ```prisma
  enum BillingStatus {
    Pending
    Paid
    Overdue
    Reviewing
  }
  ```
  Contains `Reviewing` (absent from legacy `supabase_schema.sql` line 38 check constraint `('Pending', 'Paid', 'Overdue')`).
- **AttendanceStatus Enum** (`prisma/schema.prisma`, lines 30–35):
  ```prisma
  enum AttendanceStatus {
    Present
    Absent
    Late
    Excused
  }
  ```
  Contains `Excused` (absent from legacy `supabase_schema.sql` line 49 check constraint `('Present', 'Absent', 'Late')`).
- **Profile Fields** (`prisma/schema.prisma`, lines 58–81):
  ```prisma
  model Profile {
    id                 String    @id // Clerk user ID (e.g. user_2b...)
    name               String
    email              String    @unique
    role               UserRole  @default(student)
    whatsapp           String?
    bio                String?
    specializations    String[]  @default([])
    qualification      String?
    experienceYears    Int?      @default(0) @map("experience_years")
    isProfileComplete  Boolean   @default(false) @map("is_profile_complete")
    profilePhotoUrl    String?   @map("profile_photo_url")
    lastActive         DateTime? @map("last_active")
    createdAt          DateTime  @default(now()) @map("created_at")
    updatedAt          DateTime  @default(now()) @updatedAt @map("updated_at")
    ...
  }
  ```
  Models `whatsapp`, `bio`, `specializations` (`String[]`), `qualification`, `experienceYears` (`@map("experience_years")`), `isProfileComplete` (`@map("is_profile_complete")`), `profilePhotoUrl` (`@map("profile_photo_url")`), and `lastActive` (`@map("last_active")`).
- **TeacherApplication Model** (`prisma/schema.prisma`, lines 189–206):
  ```prisma
  model TeacherApplication {
    id              String            @id @default(uuid())
    name            String
    email           String            @unique
    whatsapp        String
    country         String?
    qualification   String
    specializations String[]          @default([])
    experienceYears Int               @default(0) @map("experience_years")
    bio             String?
    status          ApplicationStatus @default(pending)
    adminNotes      String?           @map("admin_notes")
    createdAt       DateTime          @default(now()) @map("created_at")
    updatedAt       DateTime          @default(now()) @updatedAt @map("updated_at")

    @@index([status])
    @@map("teacher_applications")
  }
  ```
  Fully models the table missing from legacy `supabase_schema.sql`.
- **Attendance Model & Relations** (`prisma/schema.prisma`, lines 125–140):
  ```prisma
  model Attendance {
    id          String           @id @default(uuid())
    studentId   String           @map("student_id")
    student     Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)
    date        DateTime         @default(now()) @db.Date
    status      AttendanceStatus
    markedById  String?          @map("marked_by")
    markedBy    Profile?         @relation("MarkedAttendances", fields: [markedById], references: [id], onDelete: SetNull)
    createdAt   DateTime         @default(now()) @map("created_at")
    updatedAt   DateTime         @default(now()) @updatedAt @map("updated_at")

    @@unique([studentId, date])
    @@index([studentId, date])
    @@index([date])
    @@map("attendance")
  }
  ```
  Includes `markedById` foreign key mapped to `marked_by` with `SetNull` cascade, resolving the unmodeled `marked_by` column from legacy SQL.

### 1.2 Cross-Reference with All 38 Route Handlers in `src/app/api/`
Cross-referencing verified every table, column, and enum value used in all 38 handlers:
1. `src/app/api/add-teacher/route.ts`: Admin creates user; expects `Profile` (`role`, `name`, `email`).
2. `src/app/api/admin-stats/route.ts`: Queries `students` (count, courses), `billing` (`status: 'Pending'`), `attendance` (`status: 'Present'`, date range). Matches `Student`, `Billing`, `Attendance`.
3. `src/app/api/approve-manual-payment/route.ts`: Updates `students` (`enrolled`, `last_assignment`), upserts `billing` (`status: 'Paid'`, `amount_due: '0 PKR'` or `status: 'Pending'`), updates `payment_tickets` (`status: 'Approved' | 'Rejected'`, `resolved_at`). Matches `BillingStatus`, `TicketStatus`, `Student`.
4. `src/app/api/approve-teacher-application/route.ts`: Queries `teacher_applications` (`id`, `status: 'pending'`), updates `teacher_applications` (`status: 'approved' | 'rejected'`, `admin_notes`), updates `profiles` (`whatsapp`, `bio`, `specializations`, `qualification`, `experience_years`, `is_profile_complete`). Matches `TeacherApplication`, `ApplicationStatus`, and `Profile`.
5. `src/app/api/assign-task/route.ts`: Updates `students.last_assignment`. Matches `Student.lastAssignment`.
6. `src/app/api/assign-teacher/route.ts`: Updates `students.teacher_id`. Matches `Student.teacherId`.
7. `src/app/api/attendance/route.ts`: Defines `VALID_STATUSES = ["Present", "Absent", "Late", "Excused"]`; upserts `attendance` (`student_id`, `date`, `status`, `marked_by`); queries `attendance` with `profiles(name)`. Matches `AttendanceStatus.Excused`, `Attendance.markedById`, and `Profile.markedAttendances`.
8. `src/app/api/billing/route.ts`: Queries and updates `billing` (`student_id`, `status`, `amount_due`). Matches `Billing`.
9. `src/app/api/chat/route.ts`: Google Gemini API endpoint; no DB query.
10. `src/app/api/checkout/route.ts`: Manual terminal redirect; no DB query.
11. `src/app/api/contact/route.ts`: Resend contact email; no DB query.
12. `src/app/api/courses/route.ts`: Reads, creates, and deletes from `courses` (`id`, `title`, `description`). Matches `Course`.
13. `src/app/api/cron/reset-roster/route.ts`: Deletes old logs from `attendance` (`date`). Matches `Attendance.date`.
14. `src/app/api/delete-student/route.ts`: Queries `students.profile_id`, deletes `students` by `id`. Confirmed `onDelete: Cascade` on `Billing`, `Attendance`, `Notification`, and `PaymentTicket`.
15. `src/app/api/get-active-announcements/route.ts`: Queries `notifications` (`is_active`, `type: 'Global' | 'Targeted'`, `target_student_id`). Matches `Notification` and `NotificationType`.
16. `src/app/api/get-students/route.ts`: Queries `students` with `billing(*)`, filters by `teacher_id`. Matches `Student` and relations.
17. `src/app/api/get-teacher-applications/route.ts`: Queries `teacher_applications` (`created_at`, `experience_years`, `admin_notes`). Matches `TeacherApplication`.
18. `src/app/api/get-teachers/route.ts`: Queries `profiles` (`role: 'teacher'`, `last_active`), counts `students` by `teacher_id`. Matches `Profile` and `Student`.
19. `src/app/api/live-session/route.ts`: Queries and updates `students.live_classroom_link`. Matches `Student.liveClassroomLink`.
20. `src/app/api/login/route.ts`: Queries `profiles` by `id`, queries `students` with `billing(*)`. Matches `Profile`, `Student`, `Billing`.
21. `src/app/api/make-admin/route.ts`: Updates `profiles.role = 'admin'` by `email`. Matches `Profile.role`.
22. `src/app/api/mark-attendance/route.ts`: Defines `VALID_STATUSES = ["Present", "Absent", "Late", "Excused"]`; upserts `attendance` (`student_id`, `date`, `status`, `marked_by`). Matches `AttendanceStatus.Excused` and `Attendance.markedById`.
23. `src/app/api/my-attendance/route.ts`: Queries `attendance` by `student_id`. Matches `Attendance`.
24. `src/app/api/public-teachers/route.ts`: Queries `profiles` (`id, name, qualification, specializations, role, is_profile_complete`). Matches `Profile`.
25. `src/app/api/publish-announcement/route.ts`: Inserts `notifications` (`title`, `text`, `type: 'Global' | 'Targeted'`, `target_student_id`, `publisher_role`, `is_active`). Matches `Notification` and `NotificationType`.
26. `src/app/api/register/route.ts`: Inserts `students` (`profile_id`, `student_name`, `parent_name`, `course`, `enrolled: false`, `progress: 0`, `last_assignment`), inserts `billing` (`student_id`, `amount_due: '3000 PKR'`, `status: 'Pending'`). Matches `Student` and `Billing`.
27. `src/app/api/student-dashboard/route.ts`: Queries `students` by `profile_id` with `teacher:profiles!teacher_id`, `billing(*)`, `attendance(*)`. Matches `Student` relations.
28. `src/app/api/student-profile/route.ts`: Queries `students` with `billing(*)`, counts `attendance` total and `status: 'Present'`, checks today's attendance. Matches `Student`, `Billing`, `Attendance`.
29. `src/app/api/student-self-attendance/route.ts`: Queries and inserts `attendance` (`student_id`, `date`, `status: 'Present'`, `marked_by`).
30. `src/app/api/teacher-application/route.ts`: Queries `teacher_applications` by `email`, inserts application (`name`, `email`, `whatsapp`, `country`, `qualification`, `specializations`, `experience_years`, `bio`, `status: 'pending'`). Matches `TeacherApplication`.
31. `src/app/api/teacher-dashboard/route.ts`: Queries `profiles` by `id`, queries `students` by `teacher_id` with `billing(*)`, updates `profiles.last_active`. Matches `Profile`, `Student`, `Billing`.
32. `src/app/api/test-db/route.ts`: Legacy test route.
33. `src/app/api/update-progress/route.ts`: Updates `students.last_assignment` by `id` and `teacher_id`. Matches `Student.lastAssignment`.
34. `src/app/api/update-student/route.ts`: Updates `students` (`live_classroom_link`, `progress`, `last_assignment`). Matches `Student`.
35. `src/app/api/update-teacher-activity/route.ts`: Updates `profiles.last_active`. Matches `Profile.lastActive`.
36. `src/app/api/update-teacher-profile/route.ts`: Updates `profiles` (`bio`, `whatsapp`, `specializations`, `profile_photo_url`, `is_profile_complete: true`). Matches `Profile`.
37. `src/app/api/verify-manual-payment/route.ts`: Queries and inserts `payment_tickets` (`student_id`, `transaction_id`, `method_used`, `status: 'Reviewing'`), upserts `billing` (`student_id`, `status: 'Reviewing'`). Matches `PaymentTicket`, `TicketStatus.Reviewing`, and `BillingStatus.Reviewing`.
38. `src/app/api/webhooks/stripe/route.ts`: Updates `students` (`course`, `enrolled: true`, `progress: 0`, `last_assignment`), updates `billing` (`status: 'Paid'`, `amount_due: '0 PKR'`). Matches `Student` and `Billing`.

### 1.3 Execution of Verification Commands
1. **`node test-db.mjs` Execution**:
   - Command: `node test-db.mjs`
   - Exit code: 0
   - Output verbatim:
     ```
     🔄 Connecting to Neon PostgreSQL via Prisma...
     ✅ Connection established successfully.
     📝 Inserting dummy record: "Test Course Verification 1790667869439"...
     ✅ Record inserted successfully: {
       id: '1640c954-d902-4591-aefb-533f2498675b',
       title: 'Test Course Verification 1790667869439',
       createdAt: 2026-09-29T07:44:29.445Z
     }
     🔍 Reading record back from database...
     ✅ Record read successfully matched: {
       id: '1640c954-d902-4591-aefb-533f2498675b',
       title: 'Test Course Verification 1790667869439',
       description: 'Temporary verification record created by test-db.mjs'
     }
     🧹 Cleaning up dummy test record...
     ✅ Test record removed and cleanup verified.
     🎉 Neon DB & Prisma verification succeeded in 3488ms!
     ```
2. **`npx prisma generate` Execution**:
   - Command: `npx prisma generate`
   - Exit code: 0
   - Output verbatim:
     ```
     Prisma schema loaded from prisma\schema.prisma

     ✔ Generated Prisma Client (v6.19.3) to .\node_modules\@prisma\client in 208ms
     ```
3. **`npx tsc --noEmit` Execution**:
   - Command: `npx tsc --noEmit`
   - Exit code: 0 (zero errors reported)

---

## 2. Logic Chain

1. **Schema Completeness & Contract Parity**:
   - Cross-referencing `prisma/schema.prisma` against all 38 Next.js API route handlers in `src/app/api/` and `supabase_schema.sql` demonstrated that all models, fields, enums, indices, and foreign key relations required by the entire application are accurately modeled.
   - Specific audit points confirmed:
     - `BillingStatus` contains `Reviewing` (required by `verify-manual-payment/route.ts`).
     - `AttendanceStatus` contains `Excused` (required by `attendance/route.ts` and `mark-attendance/route.ts`).
     - `TeacherApplication` table is fully modeled with all 13 attributes and `ApplicationStatus` enum.
     - `Profile` correctly models `whatsapp`, `bio`, `specializations` (`String[]`), `qualification`, and `experienceYears` (`experience_years`), plus `is_profile_complete`, `profile_photo_url`, and `last_active`.
2. **Postgres / Neon Table and Column Mapping**:
   - `@map` and `@@map` declarations maintain exact PostgreSQL snake_case conventions (`profiles`, `students`, `billing`, `attendance`, `notifications`, `payment_tickets`, `courses`, `teacher_applications`) while exposing idiomatic camelCase accessors for Prisma Client in TypeScript.
3. **Clerk User ID Compatibility**:
   - `Profile.id String @id` correctly omits `@default(uuid())`, allowing direct assignment of Clerk's prefixed alphanumeric identifiers (`user_2b...`).
4. **Prisma Client Singleton**:
   - `src/lib/prisma.ts` exports `prisma` as a global singleton attached to `globalThis`, preventing connection pool starvation during Next.js Hot Module Replacement (HMR).
5. **Authentic Verification & Integrity**:
   - Direct execution of `node test-db.mjs` against Neon verified authentic TCP connectivity, dynamic record insertion with timestamps, read validation, and deletion. No mocks, facades, or hardcoded values were used.

---

## 3. Caveats & Adversarial Findings

1. **Adversarial Finding — `marked_by` Foreign Key in `student-self-attendance/route.ts` (For Milestone 3)**:
   - In legacy Supabase code, `src/app/api/student-self-attendance/route.ts` line 31 passes `marked_by: "student"` as a string literal because legacy Postgres schema did not enforce a foreign key constraint on `marked_by`.
   - In `prisma/schema.prisma`, `Attendance.markedById` (`marked_by`) has a foreign key referencing `Profile(id)`.
   - *Action for M3 Worker*: When refactoring `/api/student-self-attendance` to Prisma & Clerk, do not pass `"student"`; pass the student's authenticated Clerk `profileId` (or `null`/omit), otherwise PostgreSQL will reject the write with a foreign key constraint violation (`Key (marked_by)=(student) is not present in table "profiles"`).
2. **Pooled Connection vs Advisory Locks**:
   - `DATABASE_URL` in `.env.local` points to Neon's PgBouncer pooler (`-pooler.c-6...`). `prisma db push` and `PrismaClient` queries work properly over pooled connections. However, if `prisma migrate dev` is ever executed, a `DIRECT_URL` pointing to the non-pooled endpoint will be required for Postgres advisory locks.

---

## 4. Conclusion

Worker M1's deliverables meet all acceptance criteria, functional requirements, and architecture specifications defined in `PROJECT.md` and `ORIGINAL_REQUEST.md`:
- `prisma/schema.prisma` is complete, fully aligned with all 38 API route handlers, and synchronized with the Neon database.
- `src/lib/prisma.ts` implements the required Next.js singleton pattern.
- `test-db.mjs` genuinely verifies database roundtrips on Neon.
- `npx prisma generate` and `npx tsc --noEmit` succeed without errors.
- No integrity violations, hardcoded shortcuts, or facade implementations exist.

**Final Verdict**: **APPROVE**

---

## 5. Verification Method

To independently reproduce this verification:

1. **Verify Prisma Client Generation**:
   ```bash
   npx prisma generate
   ```
   *Expected outcome*: Exits code 0 with `✔ Generated Prisma Client (v6.19.3)`.

2. **Verify Neon Database Connection**:
   ```bash
   node test-db.mjs
   ```
   *Expected outcome*: Exits code 0 with `🎉 Neon DB & Prisma verification succeeded in ~3500ms!`.

3. **Verify TypeScript Compilation**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected outcome*: Exits code 0 with 0 errors.

4. **Inspect Schema Integrity**:
   Verify models and enums in `prisma/schema.prisma`:
   - `Reviewing` in `BillingStatus` (line 27)
   - `Excused` in `AttendanceStatus` (line 34)
   - `TeacherApplication` model (lines 189–206)
   - `Profile` fields `whatsapp`, `bio`, `specializations`, `qualification`, `experienceYears` (lines 64–68)
