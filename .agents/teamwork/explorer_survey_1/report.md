# Codebase Structural Survey & Supabase-to-Prisma/Clerk Inventory

**Date:** 2026-09-29  
**Surveyor:** Explorer 1 (`teamwork_preview_explorer`)  
**Workspace:** `d:\VS CODE\learn-quran-academy`  
**Target Objective:** Complete architectural survey of codebase, Supabase references, configuration, dependencies, and API routes to support migration to Neon DB (using Prisma) and Clerk (for authentication).

---

## 1. Executive Summary & Architecture Overview

The "Learn Quran Academy" web application is a full-stack Next.js application built with Next.js 16 (App Router), React 19, and Tailwind CSS 4.

### Current Architecture
- **Framework:** Next.js 16.2.6 (App Router, `src/app/`)
- **Language / Runtime:** TypeScript 5, Node.js (`ES2017`, `moduleResolution: "bundler"`)
- **Styling & UI:** Tailwind CSS 4, Framer Motion 12, Lucide React icons
- **Current Database & Auth Stack:** Supabase (`@supabase/supabase-js` v2.108.1, `@supabase/ssr` v0.12.0)
  - Supabase Auth handles student/teacher/admin authentication (`auth.users`).
  - PostgreSQL hosted on Supabase stores application tables (`profiles`, `students`, `billing`, `attendance`, `notifications`, `payment_tickets`, `courses`, `teacher_applications`).
  - Row Level Security (RLS) and PostgreSQL triggers (`on_auth_user_created`) were used to sync user profiles.
- **Third-Party Services:**
  - **Email:** Resend (`resend` v6.12.4) for transactional notifications (admin alerts on registration/application, welcome credentials).
  - **Payments:** Stripe (`stripe` v22.2.0, `@stripe/stripe-js` v9.7.0) with webhook fulfillment, plus manual bank/wallet verification tickets (NayaPay/EasyPaisa).
  - **AI Assistant:** Google Gemini API (`gemini-1.5-flash`) via `AI_API_KEY` for the Quran AI tutor chat endpoint.

### Migration Scope
1. **Database:** Replace Supabase PostgreSQL with Neon PostgreSQL using Prisma ORM.
2. **Authentication:** Replace Supabase Auth (`signInWithPassword`, `admin.createUser`, `admin.deleteUser`, Supabase cookies) with Clerk (`@clerk/nextjs`).
3. **API Layer:** Refactor 38 API route endpoints in `src/app/api/` (35 of which directly query or manipulate Supabase).
4. **Data Migration:** Explicitly **not required** (fresh start with Neon DB).

---

## 2. Dependency & Configuration Analysis

### 2.1 `package.json` Review

```json
{
  "name": "learn-quran-academy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@clerk/nextjs": "^7.9.7",
    "@prisma/client": "^6.19.3",
    "@stripe/stripe-js": "^9.7.0",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.1",
    "bcryptjs": "^3.0.3",
    "framer-motion": "^12.40.0",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.2.1",
    "lucide-react": "^1.17.0",
    "mongodb": "^7.2.0",
    "mongoose": "^9.6.3",
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-intersection-observer": "^10.0.3",
    "recharts": "^3.8.1",
    "resend": "^6.12.4",
    "stripe": "^22.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/mongodb": "^4.0.6",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "prisma": "^6.19.3",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

#### Key Findings:
- **Already Installed Target Packages:**
  - `@clerk/nextjs`: `^7.9.7` is already installed in `dependencies`!
  - `@prisma/client`: `^6.19.3` is already installed in `dependencies`!
  - `prisma`: `^6.19.3` is already installed in `devDependencies`!
- **Packages to Remove:**
  - `@supabase/ssr`: `^0.12.0` (Supabase Server-Side Auth/Cookies)
  - `@supabase/supabase-js`: `^2.108.1` (Supabase Client SDK)
  - `mongodb`: `^7.2.0` (Legacy unused package, 0 code references)
  - `mongoose`: `^9.6.3` (Legacy unused package, 0 code references)
  - `@types/mongodb`: `^4.0.6` (Legacy unused type definitions)
- **Packages Recommended to Add / Verify:**
  - `svix`: Recommended if using Clerk webhooks (e.g. `user.created`, `user.deleted` to keep the Prisma `Profile` table automatically synchronized).
  - `@clerk/backend` or direct `@clerk/nextjs/server` for backend user management (`clerkClient`).

### 2.2 Next.js and TypeScript Configurations
- **`next.config.ts`**: Clean standard NextConfig (`const nextConfig: NextConfig = { /* config options here */ }; export default nextConfig;`).
- **`tsconfig.json`**: Configured with path alias `@/*` pointing to `./src/*`.
  - Target: `ES2017`, `moduleResolution: "bundler"`, `strict: true`.

---

## 3. Environment Variables Survey

### 3.1 Supabase Variables to Deprecate and Remove
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (used in client and server clients).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret service role key (bypassed RLS for admin user creation and privileged queries).

### 3.2 Existing Active Non-Supabase Variables (Retain)
- `RESEND_API_KEY`: Required for transactional emails (used in `contact`, `register`, `teacher-application`, `approve-teacher-application`).
- `NEXT_PUBLIC_SITE_URL`: Base URL of the website for email links (defaults to `https://learnquranacademy.com`).
- `CRON_SECRET`: Bearer token authorizing Vercel/external cron jobs (`api/cron/reset-roster`).
- `AI_API_KEY`: Google Gemini API key for the Quran chatbot (`api/chat`).
- `STRIPE_SECRET_KEY`: Stripe API secret for checkout sessions and payments.
- `STRIPE_WEBHOOK_SECRET`: Stripe signing secret for `api/webhooks/stripe`.

### 3.3 New Required Variables for Neon DB + Prisma + Clerk
```env
# Neon PostgreSQL Connection URL for Prisma
DATABASE_URL="postgresql://<user>:<password>@<neon-endpoint>.neon.tech/<dbname>?sslmode=require"
# Direct connection URL (recommended by Neon for migrations when using PgBouncer pooler)
DIRECT_URL="postgresql://<user>:<password>@<neon-endpoint>.neon.tech/<dbname>?sslmode=require"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Redirect / Route URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/register"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Clerk Webhook Secret (if syncing users via Clerk Webhooks to Prisma Profile table)
CLERK_WEBHOOK_SECRET="whsec_..."
```

---

## 4. Repository-Wide Enumeration of Supabase References

Every file in the repository referencing Supabase has been identified and categorized below:

### 4.1 Configuration and Setup Files (4 files)
1. `package.json` (lines 15, 16): imports `@supabase/ssr`, `@supabase/supabase-js`.
2. `package-lock.json`: lockfile dependencies.
3. `supabase_schema.sql` (129 lines): SQL DDL schema defining Supabase tables, RLS policies, trigger `on_auth_user_created`.
4. `src/proxy.ts` (lines 2, 3, 12): helper/middleware importing `@supabase/ssr` and `updateSession` to inspect Supabase auth cookies and protect routes `/admin/*`, `/teacher/*`, `/dashboard/*`.

### 4.2 Utility & Helper SDK Files (4 files)
5. `src/utils/supabase/client.ts` (10 lines): `createClient()` using `createBrowserClient` from `@supabase/ssr`.
6. `src/utils/supabase/server.ts` (31 lines): `createClient()` using `createServerClient` and `cookies()` from Next.js headers.
7. `src/utils/supabase/middleware.ts` (37 lines): `updateSession()` session token refresh handler.
8. `src/utils/supabase/database.types.ts` (140 lines): Supabase TypeScript definitions for tables `profiles`, `students`, `billing`, `attendance`.

### 4.3 Root Administrative Scripts (5 files)
9. `check-admin.mjs`: Tests REST query to Supabase `profiles` table for `role=admin`.
10. `create-admin.mjs`: Uses Supabase Admin API `POST /auth/v1/admin/users` to create an admin user.
11. `fix-admin.mjs`: Uses Supabase Admin API `PUT /auth/v1/admin/users/:id` to reset admin password.
12. `list-users.mjs`: Queries Supabase Admin API `GET /auth/v1/admin/users`.
13. `register-admin.mjs`: Calls Supabase Auth `POST /auth/v1/signup`.

### 4.4 API Routes Referencing Supabase (35 files)
*(See Section 6 for full route-by-route breakdown)*
14. `src/app/api/add-teacher/route.ts`
15. `src/app/api/admin-stats/route.ts`
16. `src/app/api/approve-manual-payment/route.ts`
17. `src/app/api/approve-teacher-application/route.ts`
18. `src/app/api/assign-task/route.ts`
19. `src/app/api/assign-teacher/route.ts`
20. `src/app/api/attendance/route.ts`
21. `src/app/api/billing/route.ts`
22. `src/app/api/courses/route.ts`
23. `src/app/api/cron/reset-roster/route.ts`
24. `src/app/api/delete-student/route.ts`
25. `src/app/api/get-active-announcements/route.ts`
26. `src/app/api/get-students/route.ts`
27. `src/app/api/get-teacher-applications/route.ts`
28. `src/app/api/get-teachers/route.ts`
29. `src/app/api/live-session/route.ts`
30. `src/app/api/login/route.ts`
31. `src/app/api/make-admin/route.ts`
32. `src/app/api/mark-attendance/route.ts`
33. `src/app/api/my-attendance/route.ts`
34. `src/app/api/public-teachers/route.ts`
35. `src/app/api/publish-announcement/route.ts`
36. `src/app/api/register/route.ts`
37. `src/app/api/student-dashboard/route.ts`
38. `src/app/api/student-profile/route.ts`
39. `src/app/api/student-self-attendance/route.ts`
40. `src/app/api/teacher-application/route.ts`
41. `src/app/api/teacher-dashboard/route.ts`
42. `src/app/api/test-db/route.ts`
43. `src/app/api/update-progress/route.ts`
44. `src/app/api/update-student/route.ts`
45. `src/app/api/update-teacher-activity/route.ts`
46. `src/app/api/update-teacher-profile/route.ts`
47. `src/app/api/verify-manual-payment/route.ts`
48. `src/app/api/webhooks/stripe/route.ts`

**Total Supabase-referencing files:** **48 files** across repository.

---

## 5. Database Schema Gap Analysis: Supabase vs Prisma

An initial `prisma/schema.prisma` already exists in the repo, but a rigorous line-by-line comparison with the actual Supabase database usage reveals critical discrepancies that must be reconciled:

### 5.1 Model: `Profile`
- **Current `schema.prisma`:**
  ```prisma
  model Profile {
    id        String   @id // Clerk's user ID
    name      String
    email     String   @unique
    role      UserRole @default(student)
    createdAt DateTime @default(now())

    studentProfile  Student? @relation("StudentProfile")
    teacherStudents Student[] @relation("TeacherStudents")
  }
  ```
- **Discrepancy:** The actual codebase actively reads and writes to fields that are **missing** from `schema.prisma`:
  - `whatsapp` (String? - used in `teacher-application`, `approve-teacher-application`, `update-teacher-profile`)
  - `bio` (String? - used in teacher profile and public teachers)
  - `qualification` (String? - used in `public-teachers`, `approve-teacher-application`)
  - `specializations` (String[] or String - used in `public-teachers`, `approve-teacher-application`)
  - `experienceYears` (Int? - used in `approve-teacher-application`)
  - `isProfileComplete` (Boolean @default(false) - used in `public-teachers`, `update-teacher-profile`)
  - `profilePhotoUrl` (String? - used in `update-teacher-profile`)
  - `lastActive` (DateTime? - used in `get-teachers`, `teacher-dashboard`, `update-teacher-activity`)

### 5.2 Model: `TeacherApplication` (CRITICAL: Completely Missing from `schema.prisma`)
- `teacher_applications` table is heavily used by:
  - `src/app/api/teacher-application/route.ts` (public submission)
  - `src/app/api/get-teacher-applications/route.ts` (admin listing)
  - `src/app/api/approve-teacher-application/route.ts` (admin approval / rejection)
- **Required Prisma Model:**
  ```prisma
  model TeacherApplication {
    id              String   @id @default(uuid())
    name            String
    email           String   @unique
    whatsapp        String
    country         String?
    qualification   String
    specializations String[] // PostgreSQL text array
    experienceYears Int      @default(0)
    bio             String?
    status          String   @default("pending") // "pending" | "approved" | "rejected"
    adminNotes      String?
    createdAt       DateTime @default(now())
  }
  ```

### 5.3 Model: `Attendance`
- **Current `schema.prisma`:**
  ```prisma
  model Attendance {
    id        String   @id @default(uuid())
    studentId String
    student   Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
    date      DateTime @default(now()) @db.Date
    status    AttendanceStatus
    createdAt DateTime @default(now())

    @@unique([studentId, date])
  }
  ```
- **Discrepancy:**
  - `markedBy`: `attendance/route.ts` and `student-self-attendance/route.ts` record `marked_by: user.id` or `marked_by: "student"`. `Attendance` model is missing `markedBy String?`.
  - Enum `AttendanceStatus`: Currently `Present`, `Absent`, `Late`. Code also checks/allows `Excused`.

### 5.4 Model: `Billing`
- **Current `schema.prisma`:**
  ```prisma
  enum BillingStatus {
    Pending
    Paid
    Overdue
  }
  ```
- **Discrepancy:**
  - `verify-manual-payment/route.ts` sets billing status to `'Reviewing'`.
  - In `schema.prisma`, `BillingStatus` enum lacks `Reviewing`. It should be `Pending, Paid, Overdue, Reviewing`.

### 5.5 Summary of Prisma Schema Changes Needed
1. Add missing fields to `Profile`.
2. Add `markedBy String?` to `Attendance` and add `Excused` to `AttendanceStatus`.
3. Add `Reviewing` to `BillingStatus` enum.
4. Add new model `TeacherApplication`.
5. Ensure `prisma.ts` singleton client is created in `src/lib/db/prisma.ts`.

---

## 6. Comprehensive Survey of All 38 API Routes

All 38 route handlers under `src/app/api/` were inspected in detail.

### 6.1 Route Inventory Summary Table

| # | Route Path | Methods | Auth Required | Role | Database Tables / Entities | External Services |
|---|---|---|---|---|---|---|
| 1 | `add-teacher` | POST | Yes | `admin` | `auth.admin`, `profiles` | None |
| 2 | `admin-stats` | GET | Yes | `admin` | `students`, `billing`, `attendance` | None |
| 3 | `approve-manual-payment` | POST | Yes | `admin` | `students`, `billing`, `payment_tickets` | None |
| 4 | `approve-teacher-application` | POST | Yes | `admin` | `teacher_applications`, `auth.admin`, `profiles` | Resend |
| 5 | `assign-task` | POST | Yes | `admin`, `teacher` | `students` | None |
| 6 | `assign-teacher` | POST | Yes | `admin` | `students` | None |
| 7 | `attendance` | GET, POST | Yes | `admin`, `teacher` (POST) / Any auth (GET) | `attendance`, `profiles` | None |
| 8 | `billing` | GET, POST | GET: Public/ID; POST: Yes | `admin` (POST) | `billing` | None |
| 9 | `chat` | POST | No | Public | None | Google Gemini AI |
| 10 | `checkout` | POST | No | Public | None (Redirect generator) | None |
| 11 | `contact` | POST | No | Public | None | Resend |
| 12 | `courses` | GET, POST, DELETE | GET: Public; POST/DEL: Yes | `admin` (POST, DEL) | `courses` | None |
| 13 | `cron/reset-roster` | GET | Bearer Secret | `CRON_SECRET` | `attendance` | None |
| 14 | `delete-student` | DELETE | Yes | `admin` | `students`, `auth.admin` | None |
| 15 | `get-active-announcements` | GET | Yes | Any Authenticated | `notifications` | None |
| 16 | `get-students` | GET | Yes | `admin`, `teacher` | `students`, `billing` | None |
| 17 | `get-teacher-applications` | GET | Yes | `admin` | `teacher_applications` | None |
| 18 | `get-teachers` | GET | Yes | `admin` | `profiles`, `students` | None |
| 19 | `live-session` | GET, POST | GET: Public/ID; POST: Yes | `admin`, `teacher` (POST) | `students` | None |
| 20 | `login` | POST | No | Public | `auth.signIn`, `profiles`, `students`, `billing` | Supabase Auth |
| 21 | `make-admin` | GET | No (Dev tool) | Public (Query email) | `profiles` | None |
| 22 | `mark-attendance` | POST | Yes | `admin`, `teacher` | `attendance` | None |
| 23 | `my-attendance` | POST | Yes | Any Authenticated | `attendance` | None |
| 24 | `public-teachers` | GET | No | Public | `profiles` | None |
| 25 | `publish-announcement` | POST | Yes | `admin`, `teacher` | `notifications` | None |
| 26 | `register` | POST | No | Public | `auth.admin`, `students`, `billing` | Resend |
| 27 | `student-dashboard` | GET | Yes | Any Authenticated (`student`) | `students`, `profiles`, `billing`, `attendance` | None |
| 28 | `student-profile` | GET | Yes | Any Authenticated | `students`, `billing`, `attendance` | None |
| 29 | `student-self-attendance` | POST | No (Student ID in body) | Public / Student | `attendance` | None |
| 30 | `teacher-application` | POST | No | Public | `teacher_applications` | Resend |
| 31 | `teacher-dashboard` | GET | Yes | `teacher` | `profiles`, `students`, `billing` | None |
| 32 | `test-db` | GET | No | Public / Dev test | `auth.signInWithPassword` | None |
| 33 | `update-progress` | POST | Yes | `teacher` | `students` | None |
| 34 | `update-student` | POST | Yes | `admin`, `teacher` | `students` | None |
| 35 | `update-teacher-activity`| POST | Yes | `teacher` | `profiles` | None |
| 36 | `update-teacher-profile` | POST | Yes | `teacher` | `profiles` | None |
| 37 | `verify-manual-payment` | POST | No | Public / Student | `payment_tickets`, `billing` | None |
| 38 | `webhooks/stripe` | POST | Signature | Stripe Sig | `students`, `billing` | Stripe |

---

### 6.2 Detailed Breakdown of All 38 Route Handlers

#### 1. `src/app/api/add-teacher/route.ts`
- **Method:** `POST`
- **Auth:** Supabase `getUser()`. Requires `user.user_metadata?.role === "admin"`. Returns `403` if not admin.
- **Input:** JSON body `{ name: string, email: string, role?: string, password: string }`.
  - Validates email regex and password length >= 6.
- **Database Tables / Actions:**
  - Creates user via Supabase Admin API (`supabaseAdmin.auth.admin.createUser`) with `user_metadata: { name, role: 'teacher' | 'admin' }`.
  - In Neon/Clerk/Prisma: Use Clerk Backend API (`clerkClient.users.createUser`) and insert `Profile` in Prisma.
- **Response:**
  - Success: `{ success: true, message: string, teacherId: string }`
  - Error: `{ success: false, error: string }` with status `400`, `403`, or `500`.

#### 2. `src/app/api/admin-stats/route.ts`
- **Method:** `GET`
- **Auth:** Supabase `getUser()`. Requires `user.user_metadata?.role === "admin"`. Returns `403` if not admin.
- **Input:** None.
- **Database Tables / Actions:**
  - Parallel counts on `students` (total count), `billing` (status = 'Pending'), `attendance` (status = 'Present' today), and `students.course`.
  - Computes `attendanceRate = round((presentCount / totalStudents) * 100)` and `uniqueCourses` count.
- **Response:**
  - Success: `{ success: true, stats: { totalStudents: number, attendanceRate: number, activeCourses: number, pendingPayments: number } }`
  - Error: `{ success: false, error: string }` with status `403`, `500`.

#### 3. `src/app/api/approve-manual-payment/route.ts`
- **Method:** `POST`
- **Auth:** Supabase `getUser()`. Admin only (`role === "admin"`).
- **Input:** JSON body `{ studentId: string, action: "Approve" | "Reject" }`.
- **Database Tables / Actions:**
  - If `Approve`: Updates `students` set `enrolled = true`, sets welcome `last_assignment`. Upserts `billing` to `{ status: "Paid", amount_due: "0 PKR" }`. Updates `payment_tickets` set `status = "Approved", resolved_at = now()` where `status = "Reviewing"`.
  - If `Reject`: Updates `students.last_assignment` with rejection note. Upserts `billing` to `{ status: "Pending" }`. Updates `payment_tickets` set `status = "Rejected", resolved_at = now()`.
- **Response:**
  - Success: `{ success: true, message: string }`
  - Error: `{ success: false, error: string }` with status `400`, `403`, `404`, `500`.

#### 4. `src/app/api/approve-teacher-application/route.ts`
- **Method:** `POST`
- **Auth:** Supabase `getUser()`. Admin only (`role === "admin"`).
- **Input:** JSON body `{ applicationId: string, action: "approve" | "reject", adminNotes?: string }`.
- **Database Tables / Actions:**
  - Queries `teacher_applications` table.
  - If `reject`: updates `teacher_applications.status = "rejected"`.
  - If `approve`: generates temporary password, creates Auth user with email, creates/updates `profiles` (`whatsapp`, `bio`, `specializations`, `qualification`, `experience_years`, `is_profile_complete`), updates `teacher_applications.status = "approved"`, sends welcome email via Resend.
- **Response:**
  - Success: `{ success: true, message: string, teacherId: string, temporaryPassword?: string }`
  - Error: `{ success: false, error: string }` with status `400`, `403`, `404`, `409`, `500`.

#### 5. `src/app/api/assign-task/route.ts`
- **Method:** `POST`
- **Auth:** Staff only (`role === "admin" || role === "teacher"`).
- **Input:** JSON body `{ studentId: string, assignment: string }`.
- **Database Tables / Actions:**
  - Updates `students` set `last_assignment = safeAssignment` where `id = studentId`.
- **Response:**
  - Success: `{ success: true, message: "Homework log updated successfully!" }`
  - Error: `{ success: false, error: string }` with status `400`, `403`, `404`, `500`.

#### 6. `src/app/api/assign-teacher/route.ts`
- **Method:** `POST`
- **Auth:** Admin only (`role === "admin"`).
- **Input:** JSON body `{ studentId: string, teacherId: string }`.
- **Database Tables / Actions:**
  - Updates `students` set `teacher_id = teacherId` where `id = studentId`.
- **Response:**
  - Success: `{ success: true, message: "Student successfully assigned to teacher." }`
  - Error: `{ success: false, error: string }` with status `400`, `403`, `404`, `500`.

#### 7. `src/app/api/attendance/route.ts`
- **Methods:** `POST`, `GET`
- **Auth:**
  - `POST`: Staff only (`role === "admin" || role === "teacher"`).
  - `GET`: Any authenticated user (`getUser()`).
- **Input:**
  - `POST`: JSON body `{ studentId: string, status: "Present" | "Absent" | "Late" | "Excused" }`.
  - `GET`: Search params `?studentId=<optional_id>`.
- **Database Tables / Actions:**
  - `POST`: Upserts `attendance` record for student on current date (`YYYY-MM-DD`) with `marked_by: user.id`.
  - `GET`: Queries `attendance` joining `profiles(name)` on `marked_by` for the last 30 days. Maps to `{ _id, studentId, date, status, markedBy }`.
- **Response:**
  - `POST`: `{ success: true, message: string }`
  - `GET`: `{ success: true, logs: Array<{ _id, studentId, date, status, markedBy }> }`

#### 8. `src/app/api/billing/route.ts`
- **Methods:** `GET`, `POST`
- **Auth:**
  - `GET`: Public with `?studentId=<id>`.
  - `POST`: Admin only (`role === "admin"`).
- **Input:**
  - `GET`: Query param `?studentId=<id>`.
  - `POST`: JSON body `{ studentId: string, status: string }`.
- **Database Tables / Actions:**
  - `GET`: Selects `billing` record for `student_id`. Returns default 3000 PKR if not found.
  - `POST`: Updates `billing` set `status` where `student_id = studentId`.
- **Response:**
  - `GET`: `{ success: true, billing: { amountDue, dueDate, status, lastPaymentDate } }`
  - `POST`: `{ success: true, message: "Invoice state updated successfully!" }`

#### 9. `src/app/api/chat/route.ts`
- **Method:** `POST`
- **Auth:** Public.
- **Input:** JSON body `{ message: string }`.
- **Database Tables / Actions:** No database access. Calls Google Gemini `gemini-1.5-flash:generateContent?key=AI_API_KEY`.
- **Response:** `{ success: true, answer: string }` or `{ success: false, error: string }`.

#### 10. `src/app/api/checkout/route.ts`
- **Method:** `POST`
- **Auth:** Public.
- **Input:** JSON body `{ studentId: string }`.
- **Database Tables / Actions:** No database access. Computes manual terminal redirect URL.
- **Response:** `{ success: true, url: "/payment-terminal?studentId=${studentId}" }`.

#### 11. `src/app/api/contact/route.ts`
- **Method:** `POST`
- **Auth:** Public.
- **Input:** JSON body `{ name: string, email: string, subject?: string, message: string }`.
- **Database Tables / Actions:** No database access. Sends notification email to academy inbox via Resend.
- **Response:** `{ success: true, data: any }`.

#### 12. `src/app/api/courses/route.ts`
- **Methods:** `GET`, `POST`, `DELETE`
- **Auth:**
  - `GET`: Public.
  - `POST`, `DELETE`: Admin only (`role === "admin"`).
- **Input:**
  - `GET`: None.
  - `POST`: JSON body `{ title: string, description: string }`.
  - `DELETE`: Query param `?id=<course_id>`.
- **Database Tables / Actions:**
  - `GET`: Selects all from `courses` ordered by `created_at asc`.
  - `POST`: Inserts `{ title, description }` into `courses`.
  - `DELETE`: Deletes from `courses` where `id = id`.
- **Response:**
  - `GET`: `{ success: true, courses: Course[] }`
  - `POST`: `{ success: true, course: Course }`
  - `DELETE`: `{ success: true }`

#### 13. `src/app/api/cron/reset-roster/route.ts`
- **Method:** `GET`
- **Auth:** Header `authorization: Bearer <CRON_SECRET>`. Returns `401` if missing/invalid.
- **Input:** None (triggered by cron scheduler).
- **Database Tables / Actions:**
  - Checks if tomorrow is the 1st of the month.
  - If end of month: deletes attendance records older than tomorrow (`attendance.delete().lt('date', tomorrow)`).
- **Response:** `{ success: true, message: string }`.

#### 14. `src/app/api/delete-student/route.ts`
- **Method:** `DELETE`
- **Auth:** Admin only (`role === "admin"`).
- **Input:** JSON body `{ id: string }`.
- **Database Tables / Actions:**
  - Fetches student to get `profile_id`.
  - Deletes student record (`students.delete().eq('id', id)`). Cascade deletes billing and attendance.
  - Deletes auth user via admin API (`auth.admin.deleteUser(profile_id)`).
- **Response:** `{ success: true, message: "Student and all associated records permanently deleted." }`.

#### 15. `src/app/api/get-active-announcements/route.ts`
- **Method:** `GET`
- **Auth:** Any authenticated user (`getUser()`).
- **Input:** Query param `?studentId=<optional_id>`.
- **Database Tables / Actions:**
  - Queries `notifications` where `is_active = true`.
  - If `studentId`: fetches `type = 'Global' OR (type = 'Targeted' AND target_student_id = studentId)`.
  - Else: fetches `type = 'Global'`.
- **Response:** `{ success: true, announcements: Array<{ _id, title, text, type, targetStudentId, isActive, createdAt, publisherRole }> }`.

#### 16. `src/app/api/get-students/route.ts`
- **Method:** `GET`
- **Auth:** Staff only (`role === "admin" || role === "teacher"`).
- **Input:** Optional query param `?teacherId=<optional_id>` (for admins).
- **Database Tables / Actions:**
  - Selects `students` joining `billing(*)`.
  - If teacher: filters by `teacher_id = user.id`.
  - If admin and `teacherId`: filters by `teacher_id = teacherId`.
  - Sanitizes response to map `id -> _id`, `student_name -> studentName`, `parent_name -> parentName`, `billing[0] -> billing`.
- **Response:** `{ success: true, students: Student[] }`.

#### 17. `src/app/api/get-teacher-applications/route.ts`
- **Method:** `GET`
- **Auth:** Admin only (`role === "admin"`).
- **Input:** None.
- **Database Tables / Actions:**
  - Selects all from `teacher_applications` ordered by `created_at desc`.
  - Maps `experience_years -> experienceYears`, `admin_notes -> adminNotes`.
- **Response:** `{ success: true, applications: TeacherApplication[] }`.

#### 18. `src/app/api/get-teachers/route.ts`
- **Method:** `GET`
- **Auth:** Admin only (`role === "admin"`).
- **Input:** None.
- **Database Tables / Actions:**
  - Selects `profiles` where `role = 'teacher'`.
  - For each teacher, counts assigned students in `students` table (`teacher_id = teacher.id`).
  - Calculates `isOnline` if `last_active` within past 6 minutes (360,000 ms).
- **Response:** `{ success: true, teachers: Array<{ _id, name, email, studentCount, isOnline, lastActive }> }`.

#### 19. `src/app/api/live-session/route.ts`
- **Methods:** `GET`, `POST`
- **Auth:**
  - `GET`: Public with `?studentId=<id>`.
  - `POST`: Staff only (`role === "admin" || role === "teacher"`).
- **Input:**
  - `GET`: Query param `?studentId=<id>`.
  - `POST`: JSON body `{ url: string, studentId: string }`.
- **Database Tables / Actions:**
  - `GET`: Selects `live_classroom_link` from `students` where `id = studentId`.
  - `POST`: Normalizes Zoom URLs (`zoom.us/j/` -> `zoom.us/wc/join/`). Updates `students.live_classroom_link`. If teacher, enforces `teacher_id = user.id`.
- **Response:**
  - `GET`: `{ success: true, active: boolean, url: string }`
  - `POST`: `{ success: true, message: string }`

#### 20. `src/app/api/login/route.ts`
- **Method:** `POST`
- **Auth:** Public.
- **Input:** JSON body `{ email: string, password: string }`.
- **Database Tables / Actions:**
  - Supabase `auth.signInWithPassword`.
  - Queries `profiles` where `id = authData.user.id`.
  - If student: queries `students` joining `billing` where `profile_id = profile.id`.
  - Returns formatted user and role object.
  - *Migration Note:* In the Clerk stack, authentication is driven by Clerk's frontend `<SignIn />` component or Clerk SDK `authenticateWithPassword`. If custom credential submission is retained, use Clerk's client SDK.
- **Response:** `{ success: true, role: string, user: { id, name, email, ... } }`.

#### 21. `src/app/api/make-admin/route.ts`
- **Method:** `GET`
- **Auth:** Public dev tool (`?email=<email>`).
- **Input:** Query param `?email=<email>`.
- **Database Tables / Actions:**
  - Updates `profiles` set `role = 'admin'` where `email = email`.
- **Response:** `{ success: true, updated: any }`.

#### 22. `src/app/api/mark-attendance/route.ts`
- **Method:** `POST`
- **Auth:** Staff only (`role === "admin" || role === "teacher"`).
- **Input:** JSON body `{ studentId: string, status: string, date: string }`.
- **Database Tables / Actions:**
  - Validates status in `["Present", "Absent", "Late", "Excused"]`.
  - Normalizes target date to `YYYY-MM-DD`.
  - Upserts `attendance` record with `marked_by: user.id`.
- **Response:** `{ success: true, message: string }`.

#### 23. `src/app/api/my-attendance/route.ts`
- **Method:** `POST`
- **Auth:** Authenticated user (`getUser()`).
- **Input:** JSON body `{ studentId: string }`.
- **Database Tables / Actions:**
  - Selects all from `attendance` where `student_id = studentId` ordered by `date desc`.
- **Response:** `{ success: true, history: AttendanceRecord[] }`.

#### 24. `src/app/api/public-teachers/route.ts`
- **Method:** `GET`
- **Auth:** Public.
- **Input:** None.
- **Database Tables / Actions:**
  - Selects `id, name, qualification, specializations, role, is_profile_complete` from `profiles` where `role = 'teacher'` limit 3.
- **Response:** `{ success: true, teachers: Array<{ id, name, qualification, specializations, role, is_profile_complete }> }`.

#### 25. `src/app/api/publish-announcement/route.ts`
- **Method:** `POST`
- **Auth:** Staff only (`role === "admin" || role === "teacher"`).
- **Input:** JSON body `{ title: string, text: string, type: "Global" | "Targeted", targetStudentId?: string }`.
- **Database Tables / Actions:**
  - Inserts into `notifications`: `{ title, text, type, target_student_id, publisher_role: userRole, is_active: true }`.
- **Response:** `{ success: true, message: string, notificationId: string }`.

#### 26. `src/app/api/register/route.ts`
- **Method:** `POST`
- **Auth:** Public.
- **Input:** JSON body `{ parentName, email, whatsappNumber, studentName, studentAge, selectedCourse, password, country?, specialRequirements? }`.
- **Database Tables / Actions:**
  - Creates auth user via admin API (`auth.admin.createUser`) with `user_metadata: { name: studentName, role: 'student' }`.
  - Inserts into `students`: `{ profile_id, student_name, parent_name, course, enrolled: false, progress: 0, last_assignment: "..." }`.
  - Inserts into `billing`: `{ student_id, amount_due: "3000 PKR", status: "Pending" }`.
  - Sends admin email alert via Resend.
- **Response:** `{ success: true, studentId: string }`.

#### 27. `src/app/api/student-dashboard/route.ts`
- **Method:** `GET`
- **Auth:** Authenticated user (`getUser()`).
- **Input:** None (uses session).
- **Database Tables / Actions:**
  - Queries `students` where `profile_id = user.id`, joining `teacher:profiles!teacher_id(id, name, email)` and `billing(*)`.
  - Queries last 10 attendance records from `attendance` where `student_id = student.id`.
- **Response:** `{ success: true, data: { student: { id, studentName, parentName, course, enrolled, progress, liveClassroomLink, lastAssignment }, teacher, billing, attendance } }`.

#### 28. `src/app/api/student-profile/route.ts`
- **Method:** `GET`
- **Auth:** Authenticated user (`getUser()`).
- **Input:** Query param `?id=<studentId>`.
- **Database Tables / Actions:**
  - Queries `students` joining `billing(*)` where `id = studentId`.
  - Aggregates attendance metrics: totalSessions, presentSessions, checkInToday.
  - Computes `attendanceRate`.
- **Response:** `{ success: true, data: { name, course, attendanceRate, isMarkedToday, lastAssignment, enrollmentDate, progress, billing, syllabus } }`.

#### 29. `src/app/api/student-self-attendance/route.ts`
- **Method:** `POST`
- **Auth:** Public / Student (passes `studentId`).
- **Input:** JSON body `{ studentId: string }`.
- **Database Tables / Actions:**
  - Checks if attendance exists for student on today (`YYYY-MM-DD`).
  - If not exists, inserts `attendance` with `status: "Present", marked_by: "student"`.
- **Response:** `{ success: true, message: "Attendance marked successfully!" }`.

#### 30. `src/app/api/teacher-application/route.ts`
- **Method:** `POST`
- **Auth:** Public.
- **Input:** JSON body `{ name, email, whatsapp, country?, qualification, specializations, experienceYears, bio? }`.
- **Database Tables / Actions:**
  - Checks `teacher_applications` for existing application by email.
  - Inserts into `teacher_applications`: `{ name, email, whatsapp, country, qualification, specializations, experience_years, bio, status: 'pending' }`.
  - Sends admin notification email via Resend.
- **Response:** `{ success: true, message: string }`.

#### 31. `src/app/api/teacher-dashboard/route.ts`
- **Method:** `GET`
- **Auth:** Authenticated teacher (`getUser()`, `profile.role === 'teacher'`).
- **Input:** None (uses session).
- **Database Tables / Actions:**
  - Queries `profiles` where `id = user.id`.
  - Queries `students` where `teacher_id = profile.id` joining `billing(*)`.
  - Updates `profiles.last_active = now()`.
- **Response:** `{ success: true, data: { teacher: profile, students: student[] } }`.

#### 32. `src/app/api/test-db/route.ts`
- **Method:** `GET`
- **Auth:** Public / Dev testing.
- **Input:** None.
- **Database Tables / Actions:** Test signIn via Supabase.
- **Response:** JSON with test auth result.
- *Migration Note:* This route can be repurposed to test Prisma connection to Neon DB (`prisma.profile.count()`).

#### 33. `src/app/api/update-progress/route.ts`
- **Method:** `POST`
- **Auth:** Teacher only (`role === "teacher"`).
- **Input:** JSON body `{ studentId, bookType, surahName, verseNumber }`.
- **Database Tables / Actions:**
  - Formats assignment string: `Book: ${bookType} | Surah: ${surahName} | Ayah: ${verseNumber}`.
  - Updates `students` set `last_assignment` where `id = studentId` and `teacher_id = user.id`.
- **Response:** `{ success: true, message: "Progress updated successfully" }`.

#### 34. `src/app/api/update-student/route.ts`
- **Method:** `POST`
- **Auth:** Staff only (`role === "admin" || role === "teacher"`).
- **Input:** JSON body `{ studentId, liveClassroomLink, progress, lastAssignment }`.
- **Database Tables / Actions:**
  - Updates `students` set `live_classroom_link`, `progress`, `last_assignment` where `id = studentId`.
- **Response:** `{ success: true, message: "Student metrics successfully synchronized." }`.

#### 35. `src/app/api/update-teacher-activity/route.ts`
- **Method:** `POST`
- **Auth:** Teacher only (`role === "teacher"`).
- **Input:** None.
- **Database Tables / Actions:**
  - Updates `profiles` set `last_active = now()` where `id = user.id`.
- **Response:** `{ success: true }`.

#### 36. `src/app/api/update-teacher-profile/route.ts`
- **Method:** `POST`
- **Auth:** Teacher only (`role === "teacher"`).
- **Input:** JSON body `{ bio, whatsapp, specializations, profilePhotoUrl? }`.
- **Database Tables / Actions:**
  - Updates `profiles` set `bio, whatsapp, specializations, profile_photo_url, is_profile_complete = true` where `id = user.id`.
- **Response:** `{ success: true, message: "Profile updated successfully!" }`.

#### 37. `src/app/api/verify-manual-payment/route.ts`
- **Method:** `POST`
- **Auth:** Public / Student.
- **Input:** JSON body `{ studentId, transactionId, methodUsed }`.
- **Database Tables / Actions:**
  - Checks `payment_tickets` for duplicate `transaction_id`.
  - Inserts into `payment_tickets`: `{ student_id, transaction_id, method_used, status: "Reviewing" }`.
  - Upserts `billing` set `status: 'Reviewing'` for `student_id`.
- **Response:** `{ success: true, message: "Receipt logged successfully!" }`.

#### 38. `src/app/api/webhooks/stripe/route.ts`
- **Method:** `POST`
- **Auth:** Stripe signature verification using `STRIPE_WEBHOOK_SECRET`.
- **Input:** Raw body and header `stripe-signature`.
- **Database Tables / Actions:**
  - On `checkout.session.completed`:
    - Reads `studentId` and `courseName` from session metadata.
    - Updates `students` set `course = courseName, enrolled = true, progress = 0`.
    - Updates `billing` set `status = "Paid", amount_due = "0 PKR"` where `student_id = studentId`.
- **Response:** `{ received: true }`.

---

## 7. Frontend Integration & Authentication Architecture

### 7.1 Frontend Auth Consumption
- **Pages calling API routes:**
  - `src/app/login/page.tsx`: POSTs to `/api/login`, saves `academy_user` and `user_role` to `localStorage` and `document.cookie`, then redirects based on `role`.
  - `src/app/dashboard/page.tsx` (Student): Calls `/api/student-dashboard` and `/api/get-active-announcements`. Redirects to `/login` if `!json.success`.
  - `src/app/teacher/dashboard/page.tsx` (Teacher): Calls `/api/teacher-dashboard`, `/api/get-active-announcements`, `/api/update-student`, `/api/attendance`.
  - `src/app/admin/dashboard/page.tsx` (Admin): Calls `/api/admin-stats`, `/api/get-students`, `/api/get-teachers`, `/api/get-teacher-applications`, `/api/courses`, `/api/approve-teacher-application`, `/api/publish-announcement`, `/api/assign-teacher`, `/api/approve-manual-payment`.
  - `src/app/(public)/student-portal/page.tsx`: Uses `?id=<studentId>` to fetch `/api/student-profile`, `/api/live-session`, `/api/get-active-announcements`, `/api/student-self-attendance`, and `/api/verify-manual-payment`.
  - `src/app/(public)/payment-terminal/page.tsx`: Calls `/api/verify-manual-payment`.
  - `src/app/register/page.tsx`: Calls `/api/courses` and `/api/register`.
  - `src/app/teach/page.tsx`: Calls `/api/courses` and `/api/teacher-application`.

### 7.2 Routing & Route Protection (`src/proxy.ts` -> Next.js Middleware)
- The application currently has `src/proxy.ts` which uses `@supabase/ssr` to inspect user session cookies and redirect unauthorized roles.
- **Recommended Clerk Migration:**
  - Create standard Next.js `src/middleware.ts` using `clerkMiddleware()` from `@clerk/nextjs/server`.
  - Protect `/admin/:path*`, `/teacher/:path*`, and `/dashboard/:path*`.
  - Wrap `src/app/layout.tsx` in `<ClerkProvider>`.
  - In API routes, replace `supabase.auth.getUser()` with Clerk's `auth()`:
    ```typescript
    import { auth } from "@clerk/nextjs/server";
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    ```
  - Fetch the user's role from Prisma (`prisma.profile.findUnique({ where: { id: userId } })`) or Clerk's `sessionClaims?.metadata?.role`.

---

## 8. Summary of Migration Actions for Downstream Agents

1. **Prisma Setup:**
   - Update `prisma/schema.prisma` to add:
     - Missing fields to `Profile` (`whatsapp`, `bio`, `qualification`, `specializations`, `experienceYears`, `isProfileComplete`, `profilePhotoUrl`, `lastActive`).
     - New model `TeacherApplication`.
     - `Reviewing` to `BillingStatus`.
     - `markedBy String?` and `Excused` to `Attendance` / `AttendanceStatus`.
   - Create singleton Prisma client at `src/lib/db/prisma.ts`.
   - Run `npx prisma generate`.
2. **Clerk Integration:**
   - Add `<ClerkProvider>` to `src/app/layout.tsx`.
   - Replace `src/proxy.ts` with standard `src/middleware.ts` using `clerkMiddleware`.
   - Update `/login` and `/register` flows to integrate Clerk components or Clerk authentication handlers.
3. **API Route Refactoring:**
   - Systematically refactor all 35 Supabase-dependent API routes to use `prisma.<model>` and Clerk `auth()`.
4. **Cleanup:**
   - Remove `src/utils/supabase/` and `src/proxy.ts`.
   - Remove `@supabase/ssr` and `@supabase/supabase-js` from `package.json`.
   - Remove legacy unused `mongodb` and `mongoose`.
5. **Verification Script:**
   - Create `test-db.mjs` verifying connection and CRUD against Neon PostgreSQL via Prisma as requested in acceptance criteria.
