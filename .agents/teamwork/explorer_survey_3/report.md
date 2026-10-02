# Comprehensive Authentication & Client-Side Data Fetching Migration Report

**Project**: Learn Quran Academy (`d:\VS CODE\learn-quran-academy`)  
**Objective**: Complete Auth & Data Fetching Survey and Migration Plan from Supabase to Neon DB (Prisma) and Clerk  
**Author**: Explorer 3 (`teamwork_preview_explorer`)  
**Date**: September 29, 2026  

---

## 1. Executive Summary & Core Architectural Discoveries

A full audit of `src/app/`, `src/components/`, `src/lib/`, `src/utils/`, and the root directory was conducted to evaluate all authentication logic, direct database/auth client usages, and client-side data fetching mechanisms.

### Key Discoveries:
1. **Zero Direct Supabase Invocations in Client Components**:
   - `src/components/` and client pages in `src/app/` contain **zero** imports of `@supabase/supabase-js` or `@/utils/supabase/client`.
   - The browser helper `src/utils/supabase/client.ts` was defined but never actually imported anywhere in `src/`.
   - **All client pages and components fetch data exclusively via standard HTTP `fetch('/api/...')` calls**.
2. **Current Authentication Mechanism**:
   - Authentication currently runs through a manual hybrid model:
     - Form submission to `/api/login` calling Supabase `signInWithPassword`.
     - Upon login, user metadata is copied to client `localStorage` (`academy_user`, `user_role`) and a cookie (`user_role`).
     - Client pages inspect `localStorage.getItem("user_role")` to gate access or trigger redirects.
     - A Next.js middleware draft exists at `src/proxy.ts` (using `@supabase/ssr` `createServerClient`) rather than standard `src/middleware.ts`.
3. **Clerk Already Installed**:
   - `package.json` already contains `"@clerk/nextjs": "^7.9.7"`, `"@prisma/client": "^6.19.3"`, and `"prisma": "^6.19.3"`.
   - `@clerk/nextjs` v7 utilizes modern App Router APIs: `clerkMiddleware`, `createRouteMatcher`, `auth()` (async), `currentUser()` (async), and `clerkClient()` (async factory).
4. **Prisma Model & Schema Discrepancy**:
   - `prisma/schema.prisma` already defines `Profile.id` with the comment `// We will use Clerk's user ID here`.
   - However, `schema.prisma` is currently missing the `TeacherApplication` model (used by `/teach` and admin application management), as well as teacher-specific profile fields (`whatsapp`, `bio`, `specializations`, `qualification`, `experienceYears`, `isProfileComplete`, `lastActive`) which exist in the legacy SQL schema and are actively manipulated by `/api/approve-teacher-application` and `/api/update-teacher-profile`.

---

## 2. Authentication Logic Survey

### 2.1 Login Flow

- **File**: `src/app/login/page.tsx` (Lines 24-66)
  - **Current Implementation**:
    - Form captures `email` and `password`.
    - Dispatches a `POST` request to `/api/login`.
    - On success:
      - Sets `localStorage.setItem("academy_user", JSON.stringify(data.user))`
      - Sets `localStorage.setItem("user_role", data.role)`
      - Sets cookie `document.cookie = "user_role=" + data.role + "; path=/; max-age=86400"`
      - Redirects based on role (`admin` -> `/admin/dashboard`, `teacher` -> `/teacher/dashboard`, `student` -> `/dashboard`).
- **File**: `src/app/api/login/route.ts` (Lines 1-96)
  - **Current Implementation**:
    - Calls `const supabase = await createClient();` (from `@/utils/supabase/server`).
    - Executes `supabase.auth.signInWithPassword({ email, password })`.
    - Queries `profiles` table to read user role.
    - If `role === 'student'`, queries `students` joined with `billing` to construct a legacy frontend student session object.
- **Clerk Migration Plan**:
  - **Approach 1 (Recommended UI Integration)**:
    - Replace the form in `src/app/login/page.tsx` with Clerk's `<SignIn />` component configured with custom appearance to preserve the dark emerald (`#0F5132`) and gold (`#D4AF37`) luxury styling:
      ```tsx
      import { SignIn } from "@clerk/nextjs";

      export default function LoginPage() {
        return (
          <main className="min-h-screen flex font-sans ...">
            {/* Left Branding Panel preserved */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6">
              <SignIn
                path="/login"
                routing="path"
                signUpUrl="/register"
                fallbackRedirectUrl="/dashboard"
              />
            </div>
          </main>
        );
      }
      ```
  - **Approach 2 (Custom Form with Clerk SDK)**:
    - Use Clerk's `useSignIn` hook in `src/app/login/page.tsx`:
      ```tsx
      import { useSignIn } from "@clerk/nextjs";
      // Inside component:
      const { isLoaded, signIn, setActive } = useSignIn();
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await signIn.create({ identifier: credentials.email, password: credentials.password });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          // Redirect based on user role
        }
      };
      ```
  - **API Route Deprecation**: `/api/login` will no longer be necessary because Clerk securely handles session issuance, cookies, and tokens on the client and in middleware.

---

### 2.2 Student Registration Flow

- **File**: `src/app/register/page.tsx` (Lines 21-92, 280-349)
  - **Current Implementation**:
    - Collects parent name, student name, student age, WhatsApp number, country, course selection (loaded dynamically from `/api/courses`), password, and optional requirements.
    - Submits `POST` payload to `/api/register`.
    - On success, displays a confirmation screen showing WhatsApp contact instructions and an off-ramp to `/login`.
- **File**: `src/app/api/register/route.ts` (Lines 25-73)
  - **Current Implementation**:
    - Uses Supabase Admin Client (`supabaseAdmin.auth.admin.createUser`) with `email_confirm: true` and `user_metadata: { name, role: 'student' }`.
    - Inserts a record into `students` table (`profile_id = authUser.id`).
    - Inserts an initial `billing` record (`status = 'Pending'`).
    - Sends an email alert via Resend to the academy inbox.
- **Clerk Migration Plan**:
  - The custom form in `src/app/register/page.tsx` should be preserved because it captures rich academy-specific onboarding fields (`studentAge`, `parentName`, `course`, `specialRequirements`) not natively captured by standard Clerk sign-up.
  - Refactor `src/app/api/register/route.ts`:
    ```ts
    import { clerkClient } from "@clerk/nextjs/server";
    import { prisma } from "@/lib/db/prisma";

    export async function POST(req: NextRequest) {
      const body = await req.json();
      const { parentName, email, whatsappNumber, studentName, studentAge, selectedCourse, password, country, specialRequirements } = body;
      
      const cleanEmail = email.trim().toLowerCase();
      const client = await clerkClient();

      // 1. Create User in Clerk with metadata
      const clerkUser = await client.users.createUser({
        emailAddress: [cleanEmail],
        password: password,
        firstName: studentName.trim(),
        publicMetadata: {
          role: "student",
        },
      });

      // 2. Create Profile, Student, and Billing in Prisma Transaction
      const [profile, student] = await prisma.$transaction(async (tx) => {
        const newProfile = await tx.profile.create({
          data: {
            id: clerkUser.id,
            name: studentName.trim(),
            email: cleanEmail,
            role: "student",
            whatsapp: whatsappNumber.trim(),
          },
        });

        const newStudent = await tx.student.create({
          data: {
            profileId: clerkUser.id,
            studentName: studentName.trim(),
            parentName: parentName.trim(),
            course: selectedCourse,
            enrolled: false,
            progress: 0,
            lastAssignment: "Welcome! Complete your payment to activate your student terminal.",
            billing: {
              create: {
                amountDue: "3000 PKR",
                status: "Pending",
              },
            },
          },
        });

        return [newProfile, newStudent];
      });

      // 3. Send Admin Notification Email via Resend...
      return NextResponse.json({ success: true, studentId: student.id });
    }
    ```

---

### 2.3 Teacher Hiring & Application Flow

- **File**: `src/app/teach/page.tsx` (Lines 16-89)
  - Teacher candidates fill an application (name, email, WhatsApp, qualification, specializations, experience, bio).
  - Posts to `/api/teacher-application`.
- **File**: `src/app/api/teacher-application/route.ts` (Lines 1-106)
  - Inserts application into `teacher_applications` table with `status: 'pending'`.
  - Sends email to academy HR via Resend.
  - *Prisma Update*: Model `TeacherApplication` must be added to `schema.prisma`.
- **File**: `src/app/api/approve-teacher-application/route.ts` (Lines 1-163)
  - **Current Implementation**:
    - Verifies caller is admin via `supabase.auth.getUser()` and `user.user_metadata?.role === "admin"`.
    - Generates a crypto-secure random password.
    - Creates Supabase auth user with role `'teacher'`.
    - Updates `profiles` with credentials, bio, qualifications, and marks `is_profile_complete = true`.
    - Updates application status to `'approved'`.
    - Dispatches welcome email with login credentials via Resend.
  - **Clerk Migration**:
    - Verify admin:
      ```ts
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const admin = await prisma.profile.findUnique({ where: { id: userId } });
      if (!admin || admin.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      ```
    - Create Clerk user:
      ```ts
      const client = await clerkClient();
      const clerkTeacher = await client.users.createUser({
        emailAddress: [app.email],
        password: generatedPassword,
        firstName: app.name,
        publicMetadata: { role: 'teacher' }
      });
      ```
    - Upsert/Create `Profile` in Neon via Prisma:
      ```ts
      await prisma.profile.create({
        data: {
          id: clerkTeacher.id,
          name: app.name,
          email: app.email,
          role: 'teacher',
          whatsapp: app.whatsapp,
          bio: app.bio,
          specializations: app.specializations,
          qualification: app.qualification,
          experienceYears: app.experience_years,
          isProfileComplete: true,
        }
      });
      ```
- **File**: `src/app/api/add-teacher/route.ts` (Lines 1-81)
  - Admin manually creates a teacher account.
  - Migrate to `clerkClient().users.createUser()` with `publicMetadata: { role: 'teacher' }` and Prisma `prisma.profile.create()`.

---

### 2.4 Logout & Session Invalidation

- **Current State**:
  - `src/components/Navbar.tsx` (Lines 22-29): reads `localStorage.getItem("academy_user")` and `user_role`.
  - `src/app/admin/dashboard/page.tsx` (Lines 312, 361): `onClick={() => { localStorage.clear(); router.push("/login"); }}`
  - `src/app/teacher/dashboard/page.tsx` (Line 92): `handleSignOut = () => { localStorage.clear(); router.push('/login'); }`
  - `src/app/dashboard/page.tsx` (Line 75): `handleSignOut = () => { localStorage.clear(); router.push("/login"); }`
  - **Critical Flaw in Current Implementation**: Clearing `localStorage` does not invalidate the server session or delete the HTTP-only auth cookies, allowing stale or zombie sessions to persist.
- **Clerk Migration**:
  - Replace all sign-out click handlers with Clerk's `useClerk().signOut()` or `<SignOutButton />`:
    ```tsx
    import { useClerk } from "@clerk/nextjs";

    const { signOut } = useClerk();

    const handleSignOut = async () => {
      localStorage.clear();
      await signOut({ redirectUrl: "/login" });
    };
    ```
  - In `Navbar.tsx`:
    - Use `<SignedIn>` and `<SignedOut>` wrappers:
      - Signed out: Display "Login" and "Enroll Now" buttons.
      - Signed in: Display "Dashboard" link and `<UserButton afterSignOutUrl="/" />`.

---

### 2.5 Role & Permissions Checking

There are 3 user roles across the application:
1. `admin`:
   - System manager with full authority.
   - Gated to `/admin/dashboard` and all admin endpoints (`/api/admin-stats`, `/api/get-students`, `/api/get-teachers`, `/api/get-teacher-applications`, `/api/approve-teacher-application`, `/api/add-teacher`, `/api/assign-teacher`, `/api/approve-manual-payment`, `/api/publish-announcement`, `/api/delete-student`, `/api/make-admin`).
2. `teacher`:
   - Instructor managing assigned students.
   - Gated to `/teacher/dashboard` and teacher endpoints (`/api/teacher-dashboard`, `/api/update-student`, `/api/attendance`, `/api/mark-attendance`, `/api/assign-task`, `/api/update-teacher-profile`, `/api/update-teacher-activity`).
3. `student`:
   - Enrolled learner.
   - Gated to `/dashboard` and student endpoints (`/api/student-dashboard`, `/api/my-attendance`, `/api/billing`).

#### Role Mapping Strategy:
- **Fast Middleware & Token Layer**:
  - Store role in Clerk's `user.publicMetadata.role`.
  - Clerk session tokens can surface `sessionClaims.metadata.role` for zero-latency middleware route matching.
- **Authoritative Database Layer**:
  - `Profile.role` in Neon DB (`enum UserRole { student, teacher, admin }`).
  - In all mutation/sensitive API routes, fetch the profile via Prisma:
    ```ts
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!profile || profile.role !== expectedRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    ```

---

### 2.6 Middleware & Route Protection

- **Current State**:
  - File `src/proxy.ts` (Lines 1-60) was created with custom `@supabase/ssr` logic matching `/admin/:path*`, `/teacher/:path*`, `/dashboard/:path*`.
  - Next.js does not automatically run `proxy.ts` as standard middleware unless named `middleware.ts`.
- **Clerk Migration**:
  - Replace `src/proxy.ts` and `src/utils/supabase/middleware.ts` with standard `src/middleware.ts`.
  - Implementation:
    ```ts
    import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
    import { NextResponse } from "next/server";

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
      "/api/public-teachers(.*)",
      "/api/courses(.*)",
      "/api/contact(.*)",
      "/api/register(.*)",
      "/api/teacher-application(.*)",
      "/api/student-profile(.*)",
      "/api/live-session(.*)",
      "/api/student-self-attendance(.*)",
      "/api/verify-manual-payment(.*)",
      "/api/webhooks(.*)",
      "/api/chat(.*)",
      "/api/cron(.*)",
    ]);

    const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
    const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);
    const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

    export default clerkMiddleware(async (auth, request) => {
      if (isPublicRoute(request)) {
        return NextResponse.next();
      }

      const { userId, sessionClaims } = await auth();

      if (!userId) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect_url", request.url);
        return NextResponse.redirect(loginUrl);
      }

      const role = (sessionClaims?.metadata as any)?.role || "student";

      if (isAdminRoute(request) && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (isTeacherRoute(request) && role !== "teacher" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (isDashboardRoute(request) && role !== "student" && role !== "teacher" && role !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.next();
    });

    export const config = {
      matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
      ],
    };
    ```

---

## 3. Client-Side Data Fetching & Component Survey

### 3.1 Direct Supabase Usage Assessment
- **Component / Client Page Direct Supabase Usage**: **None (0 files)**.
- Neither `createBrowserClient` nor `createClient` from `@/utils/supabase/client` or `@supabase/ssr` is invoked in any `.tsx` component or page.
- All client pages rely strictly on Next.js native Route Handlers via `fetch()`.
- Consequently, client-side refactoring does **not** require rewriting database queries inside components. Components will continue calling the same API routes with the same request/response payloads, while the API route handlers are converted from Supabase to Prisma.

---

### 3.2 Inventory of Components in `src/components/`

| Component | File Path | Data Fetching / Auth Behavior | Action Required for Migration |
|---|---|---|---|
| `Navbar.tsx` | `src/components/Navbar.tsx` | Reads `localStorage` for `academy_user` and `user_role`. Static "Login" and "Enroll Now" links. | Wrap with Clerk `<SignedIn>`, `<SignedOut>`, `<UserButton />`, and use `useUser()`. |
| `TeachersSection.tsx` | `src/components/TeachersSection.tsx` | `useEffect` calls `fetch("/api/public-teachers")`. | None in component. Backing route `/api/public-teachers` migrated to Prisma. |
| `PrayerTimes.tsx` | `src/components/PrayerTimes.tsx` | Calls external Aladhan API (`api.aladhan.com`). | None (Third-party public API). |
| `ReportGenerator.tsx` | `src/components/ReportGenerator.tsx` | Client-side DOM to PDF generator (`jspdf`, `html2canvas`). | None. |
| `CourseSection.tsx` | `src/components/CourseSection.tsx` | Reads local static data from `@/lib/courseData.ts`. | None. |
| `CourseMatcher.tsx` | `src/components/CourseMatcher.tsx` | Interactive quiz using local state and `@/lib/courseData.ts`. | None. |
| `BlogPreview.tsx` | `src/components/BlogPreview.tsx` | Reads local static data from `@/lib/blogData.ts`. | None. |
| `Testimonials.tsx` | `src/components/Testimonials.tsx` | Static UI rendering. | None. |
| `Hero.tsx` | `src/components/Hero.tsx` | Static UI rendering. | None. |
| `Footer.tsx` | `src/components/Footer.tsx` | Static UI rendering. | None. |
| `TajweedShowcase.tsx` | `src/components/TajweedShowcase.tsx` | Audio playback and static UI. | None. |
| `WhatsAppButton.tsx` | `src/components/WhatsAppButton.tsx` | Link to WhatsApp. | None. |
| `FloatingWhatsApp.tsx` | `src/components/FloatingWhatsApp.tsx` | Link to WhatsApp. | None. |
| `PageTransition.tsx` | `src/components/PageTransition.tsx` | Framer motion layout wrapper. | None. |
| `ScrollReveal.tsx` | `src/components/ScrollReveal.tsx` | Framer motion scroll wrapper. | None. |

---

### 3.3 Inventory of Pages in `src/app/`

| Page / Route | File Path | Client Data Fetching Calls | Auth Check / Protection Mechanism | Action Required for Migration |
|---|---|---|---|---|
| Home (`/`) | `src/app/page.tsx` | Modular components (`TeachersSection`, `PrayerTimes`). | Public. | None. |
| Login (`/login`) | `src/app/login/page.tsx` | Submits form to `fetch("/api/login")`. | Public (Redirects to dashboard if logged in). | Replace with Clerk `<SignIn />` or `useSignIn()`. |
| Register (`/register`) | `src/app/register/page.tsx` | `fetch("/api/courses")` on mount; submits to `fetch("/api/register")`. | Public. | Keep custom form, point `/api/register` to Clerk SDK + Prisma. |
| Teach With Us (`/teach`) | `src/app/teach/page.tsx` | `fetch("/api/courses")` on mount; submits to `fetch("/api/teacher-application")`. | Public. | Backing APIs migrated to Prisma. |
| Student Dashboard (`/dashboard`) | `src/app/dashboard/page.tsx` | `fetch("/api/student-dashboard")`, `fetch("/api/get-active-announcements?studentId=...")`. | Checks `res.success`; redirects to `/login`. Sign out clears `localStorage`. | Update `handleSignOut` to `useClerk().signOut()`. Protected by middleware. |
| Teacher Dashboard (`/teacher/dashboard`) | `src/app/teacher/dashboard/page.tsx` | `fetch("/api/teacher-dashboard")`, `fetch("/api/get-active-announcements")`, `fetch("/api/update-student")`, `fetch("/api/attendance")`. | Checks `res.success`; redirects to `/login`. Sign out clears `localStorage`. | Update `handleSignOut` to `useClerk().signOut()`. Protected by middleware. |
| Admin Dashboard (`/admin/dashboard`) | `src/app/admin/dashboard/page.tsx` | `fetch("/api/admin-stats")`, `fetch("/api/get-students")`, `fetch("/api/get-teachers")`, `fetch("/api/get-teacher-applications")`, `fetch("/api/courses")`, plus mutation endpoints. | Checks `localStorage.getItem("user_role") !== "admin"`. Sign out clears `localStorage`. | Replace role check with Clerk user role. Update sign out to Clerk `signOut()`. Protected by middleware. |
| Legacy Teacher Redirect (`/teacher-dashboard`) | `src/app/teacher-dashboard/page.tsx` | Redirects to `/teacher/dashboard`. | Public redirect. | Keep or delete legacy redirect. |
| Student Portal (`/student-portal`) | `src/app/(public)/student-portal/page.tsx` | `fetch("/api/student-profile?id=...")`, `fetch("/api/get-active-announcements")`, `fetch("/api/live-session")`, `fetch("/api/student-self-attendance")`, `fetch("/api/verify-manual-payment")`. | Parameter-based public portal (`?id=studentId`). | Backing APIs migrated to Prisma. |
| Payment Terminal (`/payment-terminal`) | `src/app/(public)/payment-terminal/page.tsx` | Submits proof to `fetch("/api/verify-manual-payment")`. | Public terminal (`?studentId=...`). | Backing API migrated to Prisma. |
| Contact (`/contact`) | `src/app/contact/page.tsx` | Submits message to `fetch("/api/contact")`. | Public. | None. |
| Courses (`/courses`) | `src/app/courses/page.tsx` | Static course cards. | Public. | None. |
| Pricing (`/pricing`) | `src/app/pricing/page.tsx` | Static plans & interactive FAQ. | Public. | None. |
| Kids (`/kids`) | `src/app/kids/page.tsx` | Static marketing copy. | Public. | None. |
| Countries (`/countries`) | `src/app/(public)/countries/page.tsx` | Static global student marketing. | Public. | None. |
| Blog (`/blog`) | `src/app/(public)/blog/page.tsx` | Reads `@/lib/blogData.ts`. | Public. | None. |
| Teachers (`/teachers`) | `src/app/(public)/teachers/page.tsx` | Reads `@/lib/teacherData.ts`. | Public. | None. |
| About (`/about`) | `src/app/about/page.tsx` | Static marketing page. | Public. | None. |
| Legacy Courses (`/courses-legacy`) | `src/app/(public)/courses-legacy/page.tsx` | Static legacy layout. | Public. | None. |
| Legacy About (`/about-legacy`) | `src/app/(public)/about-legacy/page.tsx` | Minimal placeholder text. | Public. | None. |

---

### 3.4 Catalog of All 38 API Routes & Required Auth Migration

| API Route | HTTP Methods | Required Role / Auth | Migration Action (Clerk & Prisma) |
|---|---|---|---|
| `/api/login` | POST | Public | Deprecate or replace with Clerk verification. |
| `/api/register` | POST | Public | Use `clerkClient().users.createUser()` + Prisma transaction for Profile, Student, Billing. |
| `/api/teacher-application` | POST | Public | Validate & insert into Prisma `teacherApplication`. |
| `/api/contact` | POST | Public | Resend email notification (unchanged). |
| `/api/chat` | POST | Public | Gemini AI chatbot (unchanged). |
| `/api/checkout` | POST | Public | Stripe checkout session creation. |
| `/api/webhooks/stripe` | POST | Stripe Signature | Update Prisma `Student` and `Billing` on payment success. |
| `/api/cron/reset-roster` | GET | `CRON_SECRET` Bearer Token | Prune old attendance via Prisma `prisma.attendance.deleteMany()`. |
| `/api/courses` | GET | Public | Fetch all courses via `prisma.course.findMany()`. |
| `/api/courses` | POST, DELETE | Admin | Check Clerk `auth()`, verify admin profile in Prisma, mutate Course. |
| `/api/public-teachers` | GET | Public | Fetch teachers via `prisma.profile.findMany({ where: { role: 'teacher' } })`. |
| `/api/student-profile` | GET | Public (`?id=`) | Query `prisma.student.findUnique({ where: { id } })`. |
| `/api/live-session` | GET | Public (`?studentId=`) | Query student live classroom link via Prisma. |
| `/api/live-session` | POST | Teacher / Admin | Update `liveClassroomLink` via Prisma. |
| `/api/student-self-attendance` | POST | Student (`studentId`) | Log attendance via Prisma `attendance.create()`. |
| `/api/verify-manual-payment` | POST | Student (`studentId`) | Create Prisma `paymentTicket`, upsert `billing`. |
| `/api/student-dashboard` | GET | Authenticated Student | Verify `auth()`, fetch `prisma.student.findUnique({ where: { profileId: userId } })`. |
| `/api/my-attendance` | GET | Authenticated Student | Verify `auth()`, fetch attendance history via Prisma. |
| `/api/billing` | GET, POST | Authenticated Student / Admin | Verify `auth()`, read/update `prisma.billing`. |
| `/api/teacher-dashboard` | GET | Authenticated Teacher | Verify `auth()`, fetch assigned students via `prisma.student.findMany({ where: { teacherId: userId } })`. |
| `/api/update-student` | POST | Authenticated Teacher | Update student progress, assignments, notes via Prisma. |
| `/api/attendance` | GET, POST | Authenticated Teacher | Mark attendance for student via Prisma. |
| `/api/mark-attendance` | POST | Authenticated Teacher | Alternate attendance marker via Prisma. |
| `/api/assign-task` | POST | Authenticated Teacher | Update student `lastAssignment` via Prisma. |
| `/api/update-teacher-profile` | POST | Authenticated Teacher | Update teacher bio, WhatsApp, qualifications in Prisma `Profile`. |
| `/api/update-teacher-activity` | POST | Authenticated Teacher | Update `lastActive` timestamp in Prisma `Profile`. |
| `/api/admin-stats` | GET | Authenticated Admin | Parallel counts via `prisma.$transaction([student.count(), billing.count(), ...])`. |
| `/api/get-students` | GET | Authenticated Admin | Fetch all students with billing via `prisma.student.findMany({ include: { billing: true, teacher: true } })`. |
| `/api/get-teachers` | GET | Authenticated Admin | Fetch teachers with student count via `prisma.profile.findMany({ where: { role: 'teacher' } })`. |
| `/api/get-teacher-applications` | GET | Authenticated Admin | Fetch applications via `prisma.teacherApplication.findMany()`. |
| `/api/approve-teacher-application` | POST | Authenticated Admin | Create Clerk user via `clerkClient()`, insert `Profile`, update application status. |
| `/api/add-teacher` | POST | Authenticated Admin | Create Clerk user via `clerkClient()`, insert `Profile`. |
| `/api/assign-teacher` | POST | Authenticated Admin | Update `teacherId` on `Student` via Prisma. |
| `/api/approve-manual-payment` | POST | Authenticated Admin | Update `PaymentTicket` status & `Billing` status via Prisma. |
| `/api/publish-announcement` | POST | Authenticated Admin | Create `Notification` in Prisma. |
| `/api/get-active-announcements` | GET | Authenticated / Public Student | Query active notifications from Prisma. |
| `/api/delete-student` | DELETE | Authenticated Admin | Delete student via Prisma and delete user from Clerk via `clerkClient().users.deleteUser()`. |
| `/api/make-admin` | GET / POST | Superadmin / Script | Update `role: 'admin'` in Prisma and Clerk `publicMetadata`. |
| `/api/test-db` | GET | Diagnostic | Test Prisma connection to Neon DB. |

---

## 4. Detailed Clerk & Prisma Migration Specifications

### 4.1 Root Layout Setup (`src/app/layout.tsx`)

Wrap the application tree in `<ClerkProvider>`:
```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn Quran Academy — Global Online Quran Education",
  description: "Certified Tajweed, Hifz, and foundational Quranic studies for students worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0F5132",
          colorText: "#111827",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#111827",
          borderRadius: "0.5rem",
        },
        elements: {
          formButtonPrimary:
            "bg-[#0F5132] hover:bg-[#D4AF37] hover:text-[#0F5132] text-white font-bold transition-all duration-200",
          card: "shadow-2xl border border-gray-100 rounded-2xl",
          headerTitle: "font-serif text-2xl text-[#0F5132]",
          headerSubtitle: "text-gray-500 font-light",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="antialiased selection:bg-[#0F5132] selection:text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

### 4.2 Clerk Component & Hook Selection Matrix

| Context | Clerk Mechanism | Rationale |
|---|---|---|
| **Root Layout** | `<ClerkProvider>` | Provides Clerk context across the whole client & server component tree. |
| **Login Page** | `<SignIn routing="path" path="/login" />` OR `useSignIn()` | `<SignIn />` provides complete MFA, password reset, and session management out of the box with zero custom auth bugs. |
| **Navbar Desktop** | `<SignedIn>`, `<SignedOut>`, `<UserButton />` | Clean conditional rendering: unauthenticated users see "Login" / "Enroll"; authenticated users see user avatar menu & dashboard. |
| **Navbar Mobile** | `<SignedIn>`, `<SignedOut>`, `<SignOutButton />` | Mobile menu triggers Clerk's native sign-out cleanly. |
| **Dashboards (Student, Teacher, Admin)** | `useClerk().signOut()` | Replaces `localStorage.clear()` in sidebar logout buttons to destroy active Clerk session tokens. |
| **API Route Handlers (`src/app/api/...`)** | `const { userId } = await auth();` | Primary server-side authentication check. Fast, cryptographically verified JWT. |
| **Programmatic User Creation (`/api/register`, `/api/add-teacher`, `/api/approve-teacher-application`)** | `const client = await clerkClient(); await client.users.createUser(...)` | Server-to-server creation with `publicMetadata: { role }`. |
| **Programmatic User Deletion (`/api/delete-student`)** | `await client.users.deleteUser(profileId)` | Ensures Clerk user is removed alongside Neon DB records. |

---

### 4.3 Database Schema Reconciliation (`prisma/schema.prisma`)

To ensure 100% feature parity with the legacy Supabase system, the Prisma schema must be updated to include the missing fields on `Profile` and the missing `TeacherApplication` model:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  student
  teacher
  admin
}

enum BillingStatus {
  Pending
  Paid
  Overdue
}

enum AttendanceStatus {
  Present
  Absent
  Late
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

model Profile {
  id                 String    @id // Clerk User ID (e.g. "user_2n...")
  name               String
  email              String    @unique
  role               UserRole  @default(student)
  whatsapp           String?
  bio                String?
  specializations    String[]  @default([])
  qualification      String?
  experienceYears    Int       @default(0)
  isProfileComplete  Boolean   @default(false)
  lastActive         DateTime?
  createdAt          DateTime  @default(now())

  studentProfile     Student?  @relation("StudentProfile")
  teacherStudents    Student[] @relation("TeacherStudents")
}

model TeacherApplication {
  id              String            @id @default(uuid())
  name            String
  email           String            @unique
  whatsapp        String
  country         String?
  qualification   String
  specializations String[]          @default([])
  experienceYears Int               @default(0)
  bio             String?
  status          ApplicationStatus @default(pending)
  adminNotes      String?
  createdAt       DateTime          @default(now())
}

model Student {
  id                  String   @id @default(uuid())
  profileId           String   @unique
  profile             Profile  @relation("StudentProfile", fields: [profileId], references: [id], onDelete: Cascade)
  teacherId           String?
  teacher             Profile? @relation("TeacherStudents", fields: [teacherId], references: [id], onDelete: SetNull)
  studentName         String
  parentName          String?
  course              String
  enrolled            Boolean  @default(false)
  progress            Int      @default(0)
  lastAssignment      String?
  liveClassroomLink   String?
  createdAt           DateTime @default(now())

  billing             Billing?
  attendances         Attendance[]
  notifications       Notification[]
  paymentTickets      PaymentTicket[]
}

model Billing {
  id              String        @id @default(uuid())
  studentId       String        @unique
  student         Student       @relation(fields: [studentId], references: [id], onDelete: Cascade)
  amountDue       String
  status          BillingStatus @default(Pending)
  lastPaymentDate DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @default(now()) @updatedAt
}

model Attendance {
  id        String           @id @default(uuid())
  studentId String
  student   Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date      DateTime         @default(now()) @db.Date
  status    AttendanceStatus
  createdAt DateTime         @default(now())

  @@unique([studentId, date])
}

model Notification {
  id              String           @id @default(uuid())
  title           String
  text            String
  type            NotificationType
  targetStudentId String?
  student         Student?         @relation(fields: [targetStudentId], references: [id], onDelete: Cascade)
  publisherRole   String
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
}

model PaymentTicket {
  id            String       @id @default(uuid())
  studentId     String
  student       Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  transactionId String       @unique
  methodUsed    String
  status        TicketStatus @default(Reviewing)
  submittedAt   DateTime     @default(now())
  resolvedAt    DateTime?
}

model Course {
  id          String   @id @default(uuid())
  title       String
  description String
  createdAt   DateTime @default(now())
}
```

---

### 4.4 Prisma Client Singleton (`src/lib/db/prisma.ts`)

Create a robust singleton instance in `src/lib/db/prisma.ts` to prevent connection exhaustion in Next.js development hot-reloading:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### 4.5 Clerk Webhook Sync Handler (`src/app/api/webhooks/clerk/route.ts`)

To guarantee data consistency if users sign in or update their profiles via Clerk directly (such as OAuth or pre-built UI), create a webhook handler:
- Listens for `user.created`, `user.updated`, and `user.deleted`.
- On `user.created`: Inserts or upserts `Profile` in Neon DB (`id: evt.data.id`, `name`, `email`, `role: evt.data.public_metadata?.role || 'student'`).
- On `user.deleted`: Deletes `Profile` in Neon DB (cascading to `Student`).

---

## 5. Phased Implementation Roadmap & Verification Checklist

### Phase 1: Environment & Prisma Foundation
1. Verify Neon DB credentials in `.env.local` (`DATABASE_URL`, `DIRECT_URL`).
2. Add missing fields and `TeacherApplication` model to `prisma/schema.prisma`.
3. Create `src/lib/db/prisma.ts` singleton client.
4. Run `npx prisma db push` to synchronize Neon DB tables.
5. Create and run `test-db.mjs` verifying connection and dummy record insertion.

### Phase 2: Clerk Middleware & Provider Integration
1. Configure Clerk environment variables in `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`
2. Update `src/app/layout.tsx` to wrap the app with `<ClerkProvider>`.
3. Create `src/middleware.ts` with route matchers for public, admin, teacher, and student routes. Delete `src/proxy.ts` and `src/utils/supabase/middleware.ts`.
4. Update `src/components/Navbar.tsx` to use `<SignedIn>`, `<SignedOut>`, `<UserButton />`.

### Phase 3: Auth Pages & Endpoints Refactoring
1. Update `src/app/login/page.tsx` with Clerk `<SignIn />` or `useSignIn`.
2. Refactor `src/app/api/register/route.ts` to use `clerkClient().users.createUser()` and Prisma `$transaction`.
3. Refactor `src/app/api/approve-teacher-application/route.ts` and `src/app/api/add-teacher/route.ts` to create Clerk user and Prisma `Profile`.
4. Refactor `src/app/admin/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, and `src/app/dashboard/page.tsx` logout handlers to use `useClerk().signOut()`.

### Phase 4: API Routes Supabase-to-Prisma Conversion
1. Systematically rewrite all 30+ remaining API routes to use `prisma` and Clerk `auth()`.
2. Delete `src/utils/supabase/` directory once all routes are converted.
3. Clean up unused legacy scripts (`create-admin.mjs`, `fix-admin.mjs`, `check-admin.mjs`, `list-users.mjs`, `register-admin.mjs`).

### Phase 5: Verification & Build
1. Execute `test-db.mjs` to confirm Neon database connectivity and record insertion/deletion.
2. Run `npm run build` to confirm 0 TypeScript and Next.js build errors.
3. Verify public and protected route redirection behavior.
