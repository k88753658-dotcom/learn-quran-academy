# Comprehensive Database Schema & Data Model Report
**Explorer Survey 2** — Learn Quran Academy Migration (Supabase → Neon DB & Prisma)
**Date**: September 29, 2026
**Target Architecture**: Neon DB (PostgreSQL) + Prisma ORM + Clerk Authentication

---

## 1. Executive Summary

This report delivers a full database schema and data model investigation of the Learn Quran Academy Next.js codebase. The investigation surveyed:
- Legacy SQL files (`supabase_schema.sql`)
- Existing TypeScript type definitions (`src/utils/supabase/database.types.ts`)
- The initial prototype schema (`prisma/schema.prisma`)
- All 38 API route handlers in `src/app/api/`
- All frontend data fetching and mutations across `src/app/` and `src/components/`

### Key Investigation Discoveries & Schema Gaps in Prototype:
1. **Omitted Table (`teacher_applications`)**: An entire production table used by `/teach`, `/api/teacher-application`, `/api/get-teacher-applications`, `/api/approve-teacher-application`, and the admin dashboard was completely missing from `supabase_schema.sql` and the initial `prisma/schema.prisma`.
2. **Missing Profile Attributes**: Multiple columns actively updated and selected across routes were missing from `Profile`, including `whatsapp`, `bio`, `specializations` (`String[]`), `qualification`, `experience_years`, `is_profile_complete`, `profile_photo_url`, and `last_active`.
3. **Incomplete Enum Values**:
   - `BillingStatus` was missing the `"Reviewing"` status written by `/api/verify-manual-payment`.
   - `AttendanceStatus` was missing the `"Excused"` status accepted by `/api/attendance` and `/api/mark-attendance`.
4. **Attendance Attribution (`marked_by`)**: Attendance logs track who recorded the attendance (`user.id` or `"student"`). In `attendance/route.ts`, queries join against `profiles` to display the marker's name (`markedBy: log.profiles?.name || "System"`).
5. **Clerk ID Compatibility**: Under Clerk authentication, user identifiers are alphanumeric strings (e.g., `user_2b...`). The `Profile` model's primary key must be a `String` without automatic UUID generation, receiving the Clerk User ID directly.

---

## 2. Comprehensive Entity Inventory

The application utilizes 8 distinct core database entities:

| # | Entity | Prisma Model | Supabase Table | Purpose |
|---|--------|--------------|----------------|---------|
| 1 | User Profile | `Profile` | `profiles` | Users (Students, Teachers, Admins) linked to Clerk Auth IDs |
| 2 | Student Record | `Student` | `students` | Academic student profile, course assignment, progress, classroom links |
| 3 | Billing Account | `Billing` | `billing` | Fee invoice, payment due status, last payment tracking |
| 4 | Attendance Record | `Attendance` | `attendance` | Daily attendance log per student with status and marker |
| 5 | Announcement | `Notification` | `notifications` | Global broadcasts or targeted notifications to individual students |
| 6 | Payment Ticket | `PaymentTicket` | `payment_tickets` | Proof-of-payment receipts submitted by students for admin review |
| 7 | Course Catalog | `Course` | `courses` | Academy course listings, descriptions, curriculum offerings |
| 8 | Teacher Application | `TeacherApplication` | `teacher_applications` | Prospective teacher applications submitted via the `/teach` portal |

---

## 3. Field-by-Field Detailed Specification

### 3.1 `Profile` (Table: `profiles`)
- **Primary Key**: `id` (`String` / `@id`) — Clerk User ID (`user_...`).
- **Columns**:
  - `id`: `String` (Clerk User ID)
  - `name`: `String` (Full name)
  - `email`: `String @unique` (Normalized lowercase email)
  - `role`: `UserRole` (`student`, `teacher`, `admin`, `@default(student)`)
  - `whatsapp`: `String?` (WhatsApp contact number)
  - `bio`: `String?` (Teacher bio for public listing and dashboard)
  - `specializations`: `String[] @default([])` (PostgreSQL text array of subjects)
  - `qualification`: `String?` (Teacher degree / certification)
  - `experienceYears`: `Int? @default(0)` (Years of teaching experience)
  - `isProfileComplete`: `Boolean @default(false)` (Flag indicating completed instructor profile)
  - `profilePhotoUrl`: `String?` (Avatar image URL)
  - `lastActive`: `DateTime?` (Timestamp of last ping, used for online status calculation)
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`
- **Relations**:
  - `studentProfile`: `Student?` (`@relation("StudentProfile")`)
  - `teacherStudents`: `Student[]` (`@relation("TeacherStudents")`)
  - `markedAttendances`: `Attendance[]` (`@relation("MarkedAttendances")`)

### 3.2 `Student` (Table: `students`)
- **Primary Key**: `id` (`String @id @default(uuid())`)
- **Columns**:
  - `id`: `String` (UUID)
  - `profileId`: `String? @unique` (Foreign key to `Profile.id`, nullable for pre-registered students)
  - `teacherId`: `String?` (Foreign key to `Profile.id`, assigned instructor)
  - `studentName`: `String` (Full name of student)
  - `parentName`: `String?` (Guardian name)
  - `course`: `String?` (Enrolled course title)
  - `enrolled`: `Boolean @default(false)` (Tuition/Enrollment active status)
  - `progress`: `Int @default(0)` (0-100 completion percentage)
  - `lastAssignment`: `String?` (Current homework log or instructions)
  - `liveClassroomLink`: `String?` (Zoom/Google Meet session link)
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`
- **Relations & Foreign Keys**:
  - `profile`: `Profile? @relation("StudentProfile", fields: [profileId], references: [id], onDelete: Cascade)`
  - `teacher`: `Profile? @relation("TeacherStudents", fields: [teacherId], references: [id], onDelete: SetNull)`
  - `billing`: `Billing?`
  - `attendances`: `Attendance[]`
  - `notifications`: `Notification[]`
  - `paymentTickets`: `PaymentTicket[]`
- **Indexes**:
  - `@@index([teacherId])` — Accelerates instructor roster fetching

### 3.3 `Billing` (Table: `billing`)
- **Primary Key**: `id` (`String @id @default(uuid())`)
- **Columns**:
  - `id`: `String` (UUID)
  - `studentId`: `String @unique` (Foreign key to `Student.id`)
  - `amountDue`: `String @default("3000 PKR")` (Tuition fee description)
  - `status`: `BillingStatus @default(Pending)` (`Pending`, `Paid`, `Overdue`, `Reviewing`)
  - `lastPaymentDate`: `DateTime?` (Timestamp of last approved payment)
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`
- **Relations & Foreign Keys**:
  - `student`: `Student @relation(fields: [studentId], references: [id], onDelete: Cascade)`

### 3.4 `Attendance` (Table: `attendance`)
- **Primary Key**: `id` (`String @id @default(uuid())`)
- **Columns**:
  - `id`: `String` (UUID)
  - `studentId`: `String` (Foreign key to `Student.id`)
  - `date`: `DateTime @db.Date` (Normalized date YYYY-MM-DD)
  - `status`: `AttendanceStatus` (`Present`, `Absent`, `Late`, `Excused`)
  - `markedById`: `String?` (Foreign key to `Profile.id`, user who recorded the attendance)
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`
- **Constraints & Indexes**:
  - `@@unique([studentId, date])` — Enforces single log per student per calendar date
  - `@@index([studentId, date])` — Accelerates monthly attendance history queries
  - `@@index([date])` — Optimizes daily admin dashboard presence counting
- **Relations**:
  - `student`: `Student @relation(fields: [studentId], references: [id], onDelete: Cascade)`
  - `markedBy`: `Profile? @relation("MarkedAttendances", fields: [markedById], references: [id], onDelete: SetNull)`

### 3.5 `Notification` (Table: `notifications`)
- **Primary Key**: `id` (`String @id @default(uuid())`)
- **Columns**:
  - `id`: `String` (UUID)
  - `title`: `String` (Notice heading)
  - `text`: `String` (Notice body text)
  - `type`: `NotificationType` (`Global`, `Targeted`)
  - `targetStudentId`: `String?` (Foreign key to `Student.id`, populated if Targeted)
  - `publisherRole`: `String` (Role of publisher: `'admin'` or `'teacher'`)
  - `isActive`: `Boolean @default(true)`
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`
- **Constraints & Indexes**:
  - `@@index([isActive, type])`
  - `@@index([targetStudentId])`
- **Relations**:
  - `student`: `Student? @relation(fields: [targetStudentId], references: [id], onDelete: Cascade)`

### 3.6 `PaymentTicket` (Table: `payment_tickets`)
- **Primary Key**: `id` (`String @id @default(uuid())`)
- **Columns**:
  - `id`: `String` (UUID)
  - `studentId`: `String` (Foreign key to `Student.id`)
  - `transactionId`: `String @unique` (Payment reference / bank receipt number)
  - `methodUsed`: `String` (e.g., `"JazzCash"`, `"EasyPaisa"`, `"Bank Transfer"`, `"Stripe"`)
  - `status`: `TicketStatus @default(Reviewing)` (`Reviewing`, `Approved`, `Rejected`)
  - `submittedAt`: `DateTime @default(now())`
  - `resolvedAt`: `DateTime?` (Timestamp of approval or rejection)
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`
- **Indexes**:
  - `@@index([studentId, status])`
- **Relations**:
  - `student`: `Student @relation(fields: [studentId], references: [id], onDelete: Cascade)`

### 3.7 `Course` (Table: `courses`)
- **Primary Key**: `id` (`String @id @default(uuid())`)
- **Columns**:
  - `id`: `String` (UUID)
  - `title`: `String` (Course title)
  - `description`: `String` (Course overview)
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`

### 3.8 `TeacherApplication` (Table: `teacher_applications`)
- **Primary Key**: `id` (`String @id @default(uuid())`)
- **Columns**:
  - `id`: `String` (UUID)
  - `name`: `String` (Applicant name)
  - `email`: `String @unique` (Applicant email address)
  - `whatsapp`: `String` (Applicant phone / WhatsApp)
  - `country`: `String?` (Country of residence)
  - `qualification`: `String` (Educational/Islamic qualification)
  - `specializations`: `String[] @default([])` (PostgreSQL text array of subjects)
  - `experienceYears`: `Int @default(0)` (Years of teaching experience)
  - `bio`: `String?` (Applicant biography)
  - `status`: `ApplicationStatus @default(pending)` (`pending`, `approved`, `rejected`)
  - `adminNotes`: `String?` (Internal notes recorded by admin)
  - `createdAt`: `DateTime @default(now())`
  - `updatedAt`: `DateTime @default(now()) @updatedAt`
- **Indexes**:
  - `@@index([status])`

---

## 4. Enums Specification

```prisma
enum UserRole {
  student
  teacher
  admin
}

enum BillingStatus {
  Pending
  Paid
  Overdue
  Reviewing
}

enum AttendanceStatus {
  Present
  Absent
  Late
  Excused
}

enum NotificationType {
  Global
  Targeted
}

enum TicketStatus {
  Reviewing
  Approved
  Rejected
}

enum ApplicationStatus {
  pending
  approved
  rejected
}
```

---

## 5. Complete Proposed `schema.prisma`

This schema incorporates all model definitions, Postgres snake_case mappings (`@@map` and `@map`), relation definitions with referential integrity (`onDelete: Cascade` / `SetNull`), scalar array types (`String[]`), and performance indexes.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// --------------------------------------------------------
// ENUMS
// --------------------------------------------------------

enum UserRole {
  student
  teacher
  admin
}

enum BillingStatus {
  Pending
  Paid
  Overdue
  Reviewing
}

enum AttendanceStatus {
  Present
  Absent
  Late
  Excused
}

enum NotificationType {
  Global
  Targeted
}

enum TicketStatus {
  Reviewing
  Approved
  Rejected
}

enum ApplicationStatus {
  pending
  approved
  rejected
}

// --------------------------------------------------------
// MODELS
// --------------------------------------------------------

/// User profile synchronized with Clerk authentication
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

  // Relations
  studentProfile     Student?     @relation("StudentProfile")
  teacherStudents    Student[]    @relation("TeacherStudents")
  markedAttendances  Attendance[] @relation("MarkedAttendances")

  @@map("profiles")
}

/// Student academic profile and enrollment tracking
model Student {
  id                 String    @id @default(uuid())
  profileId          String?   @unique @map("profile_id")
  profile            Profile?  @relation("StudentProfile", fields: [profileId], references: [id], onDelete: Cascade)
  teacherId          String?   @map("teacher_id")
  teacher            Profile?  @relation("TeacherStudents", fields: [teacherId], references: [id], onDelete: SetNull)
  studentName        String    @map("student_name")
  parentName         String?   @map("parent_name")
  course             String?
  enrolled           Boolean   @default(false)
  progress           Int       @default(0)
  lastAssignment     String?   @map("last_assignment")
  liveClassroomLink  String?   @map("live_classroom_link")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @default(now()) @updatedAt @map("updated_at")

  // Relations
  billing            Billing?
  attendances        Attendance[]
  notifications      Notification[]
  paymentTickets     PaymentTicket[]

  @@index([teacherId])
  @@map("students")
}

/// Student tuition invoice and billing lifecycle
model Billing {
  id              String        @id @default(uuid())
  studentId       String        @unique @map("student_id")
  student         Student       @relation(fields: [studentId], references: [id], onDelete: Cascade)
  amountDue       String        @default("3000 PKR") @map("amount_due")
  status          BillingStatus @default(Pending)
  lastPaymentDate DateTime?     @map("last_payment_date")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @default(now()) @updatedAt @map("updated_at")

  @@map("billing")
}

/// Daily session attendance logs
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

/// Announcements and targeted notifications
model Notification {
  id              String           @id @default(uuid())
  title           String
  text            String
  type            NotificationType
  targetStudentId String?          @map("target_student_id")
  student         Student?         @relation(fields: [targetStudentId], references: [id], onDelete: Cascade)
  publisherRole   String           @map("publisher_role")
  isActive        Boolean          @default(true) @map("is_active")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @default(now()) @updatedAt @map("updated_at")

  @@index([isActive, type])
  @@index([targetStudentId])
  @@map("notifications")
}

/// Manual payment proof submissions for admin review
model PaymentTicket {
  id            String       @id @default(uuid())
  studentId     String       @map("student_id")
  student       Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  transactionId String       @unique @map("transaction_id")
  methodUsed    String       @map("method_used")
  status        TicketStatus @default(Reviewing)
  submittedAt   DateTime     @default(now()) @map("submitted_at")
  resolvedAt    DateTime?    @map("resolved_at")
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @default(now()) @updatedAt @map("updated_at")

  @@index([studentId, status])
  @@map("payment_tickets")
}

/// Academy course offerings
model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at")

  @@map("courses")
}

/// Prospective instructor applications submitted via /teach portal
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

---

## 6. Neon DB Connection Architecture & Parameters

Neon is a serverless PostgreSQL platform. When connecting to Neon using Prisma in Next.js, two connection modes exist:

### 6.1 Pooled Connection (`DATABASE_URL`)
- **Role**: Used by Prisma Client during application runtime (API routes, server components, background tasks).
- **Architecture**: Neon routes requests through PgBouncer connection poolers on port 5432 or 6543.
- **URL Pattern**:
  ```env
  DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.[region].aws.neon.tech/[dbname]?sslmode=require"
  ```
- **Key Parameters**:
  - `-pooler`: Identifier designating a pooled connection endpoint.
  - `sslmode=require`: Mandatory for encrypted communication with Neon.

### 6.2 Direct Connection (`DIRECT_URL`)
- **Role**: Used by the Prisma CLI for schema management (`prisma db push`, `prisma migrate dev`).
- **Architecture**: Direct TCP connection bypassing PgBouncer.
- **Why Required**: PgBouncer transaction pooling mode does not support PostgreSQL session-level advisory locks, which Prisma uses to ensure migration safety.
- **URL Pattern**:
  ```env
  DIRECT_URL="postgresql://[user]:[password]@[endpoint].[region].aws.neon.tech/[dbname]?sslmode=require"
  ```
- **Fallback / Local Dev Note**: If `DIRECT_URL` is omitted, `directUrl` in `schema.prisma` can either be removed or set equal to `DATABASE_URL` if `DATABASE_URL` is already the direct unpooled endpoint.

---

## 7. Prisma Client Singleton Utility (`src/lib/prisma.ts`)

In Next.js, Fast Refresh / Hot Module Replacement (HMR) re-evaluates modules on file edits. Without a global singleton, each reload creates a new `PrismaClient` instance, rapidly exhausting available PostgreSQL connections.

### Proposed Code for `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

## 8. Database Connection Verification Script (`test-db.mjs`)

The project acceptance criteria mandate:
> "A test script (`test-db.mjs`) is created and can be run to successfully insert and read a dummy record from the Neon database, verifying the connection and Prisma setup."

### Script Requirements:
1. Runs standalone with `node test-db.mjs`.
2. Connects to Neon via `@prisma/client`.
3. Creates a test record in the `Course` table (has no foreign key dependencies).
4. Reads the record back by unique `id`.
5. Removes the test record so the database remains clean.
6. Returns exit code 0 on success, exit code 1 on failure.

### Proposed Implementation for `test-db.mjs`:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Connecting to Neon PostgreSQL via Prisma...');
  const startTime = Date.now();

  await prisma.$connect();
  console.log('✅ Connection established successfully.');

  const testTitle = `Test Course ${Date.now()}`;
  console.log(`📝 Inserting dummy record: "${testTitle}"...`);
  
  const createdCourse = await prisma.course.create({
    data: {
      title: testTitle,
      description: 'Temporary verification record created by test-db.mjs',
    },
  });
  console.log('✅ Record inserted successfully:', {
    id: createdCourse.id,
    title: createdCourse.title,
    createdAt: createdCourse.createdAt,
  });

  console.log('🔍 Reading record back from database...');
  const fetchedCourse = await prisma.course.findUnique({
    where: { id: createdCourse.id },
  });

  if (!fetchedCourse || fetchedCourse.id !== createdCourse.id) {
    throw new Error('Database read verification failed: Record not found.');
  }
  console.log('✅ Record read successfully matched:', fetchedCourse.id);

  console.log('🧹 Cleaning up dummy test record...');
  await prisma.course.delete({
    where: { id: createdCourse.id },
  });
  console.log('✅ Test record removed.');

  const durationMs = Date.now() - startTime;
  console.log(`🎉 Neon DB & Prisma verification succeeded in ${durationMs}ms!`);
}

main()
  .catch((error) => {
    console.error('❌ Neon DB connection verification failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 9. API Migration Reference Matrix

A quick-reference mapping of existing Supabase patterns to equivalent Prisma Client operations for the upcoming implementation phase:

| Supabase Pattern | Prisma Equivalent | Affected Routes |
|------------------|-------------------|-----------------|
| `supabase.from('students').select('*, billing(*)')` | `prisma.student.findMany({ include: { billing: true } })` | `get-students`, `student-dashboard` |
| `supabase.from('students').select('*', { count: 'exact', head: true })` | `prisma.student.count()` | `admin-stats`, `get-teachers` |
| `supabase.from('billing').select('*', { count: 'exact', head: true }).eq('status', 'Pending')` | `prisma.billing.count({ where: { status: 'Pending' } })` | `admin-stats` |
| `supabase.from('attendance').select('id').eq('student_id', id).eq('date', date).maybeSingle()` | `prisma.attendance.findUnique({ where: { studentId_date: { studentId, date } } })` | `attendance`, `mark-attendance`, `student-self-attendance` |
| `supabase.from('attendance').select('*, profiles(name)')` | `prisma.attendance.findMany({ include: { markedBy: { select: { name: true } } } })` | `attendance` |
| `supabase.from('billing').upsert({ student_id, status })` | `prisma.billing.upsert({ where: { studentId }, update: { status }, create: { studentId, status } })` | `verify-manual-payment`, `approve-manual-payment` |
| `supabase.from('notifications').select('*').or(...)` | `prisma.notification.findMany({ where: { isActive: true, OR: [{ type: 'Global' }, { type: 'Targeted', targetStudentId: id }] } })` | `get-active-announcements` |
| `supabase.from('teacher_applications').insert({...})` | `prisma.teacherApplication.create({ data: {...} })` | `teacher-application` |
| `supabase.from('profiles').update({ last_active: new Date() }).eq('id', id)` | `prisma.profile.update({ where: { id }, data: { lastActive: new Date() } })` | `update-teacher-activity`, `teacher-dashboard` |
| `supabase.from('students').delete().eq('id', id)` | `prisma.student.delete({ where: { id } })` | `delete-student` |

---

## 10. Summary & Handoff Readiness

The complete database design is verified against all 38 API route handlers, legacy SQL scripts, and frontend components. All required entities, relations, enums, indexes, and connection configurations are resolved. The design is ready for immediate application by the implementation agents.
