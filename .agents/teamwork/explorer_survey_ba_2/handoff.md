# Handoff Report: Prisma Schema, Database Models & Better Auth Requirements

**Agent ID:** `explorer_survey_ba_2`  
**Parent ID:** `7d598a49-2559-46ca-b0d0-9bec91c43a4e`  
**Handoff Type:** Hard (Task Complete)  
**Report Artifact:** `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\report.md`  

---

## 1. Observation

1. **Current Schema & Models (`prisma/schema.prisma`)**:
   - `prisma/schema.prisma` lines 17–53 defines 6 enums: `UserRole`, `BillingStatus`, `AttendanceStatus`, `NotificationType`, `TicketStatus`, `ApplicationStatus`.
   - `prisma/schema.prisma` lines 59–81 defines `model Profile` with:
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

       // Relations
       studentProfile     Student?     @relation("StudentProfile")
       teacherStudents    Student[]    @relation("TeacherStudents")
       markedAttendances  Attendance[] @relation("MarkedAttendances")

       @@map("profiles")
     }
     ```
   - Lines 84–206 define `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, `Course`, and `TeacherApplication`.
   - `Student` has `profileId String? @unique @map("profile_id")` and `teacherId String? @map("teacher_id")` both referencing `Profile.id`.
   - `Attendance` has `markedById String? @map("marked_by")` referencing `Profile.id`.
   - No models exist for bookings or reviews. Courses exist in `model Course`; enrollments are tracked via `Student.enrolled` and `Student.course`.

2. **Codebase Access Pattern for `Profile`**:
   - Grep search for `prisma.profile` returned over 59 occurrences across 25+ files (e.g. `src/app/api/admin-stats/route.ts:18`, `src/app/api/login/route.ts:27`, `src/app/api/add-teacher/route.ts:17`, `src/app/api/add-student/route.ts:18`).
   - The universal pattern across API routes is:
     ```typescript
     const { userId } = await auth();
     const profile = await prisma.profile.findUnique({ where: { id: userId } });
     ```
   - Lines 52–66 of `PROJECT.md` confirm this interface contract:
     > "`Profile.id` directly stores the Clerk user ID (e.g. `'user_2b...'`)."

3. **Prisma Singleton Setup (`src/lib/prisma.ts`)**:
   - `src/lib/prisma.ts` lines 7–18 exports a singleton `prisma` instance of `PrismaClient` with global caching for development hot reloading.
   - It is directly compatible with Better Auth's `prismaAdapter(prisma, { provider: "postgresql" })`.

4. **Environment Setup (`.env.local`)**:
   - `DATABASE_URL` is configured with Neon DB connection string:
     `postgresql://neondb_owner:npg_P1gt2ViSQaDb@ep-late-voice-b4uwwqj9-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `NEXT_PUBLIC_BASE_URL` is set to `http://localhost:3000`.
   - There are currently no Better Auth variables (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`). No Clerk variables are present.

5. **Better Auth Prisma Adapter Requirements**:
   - Official Better Auth documentation requires 4 models: `User`, `Session`, `Account`, `Verification`.
   - `Account` stores credentials/passwords (`providerId = "credential"`).
   - Better Auth generates string IDs (`cuid()` or random strings).

---

## 2. Logic Chain

1. **Step 1 (Identity Contract Invariance)**:
   - Observation 2 demonstrates that every API route and domain model relation (`Student.profileId`, `Student.teacherId`, `Attendance.markedById`) relies on `Profile.id` being identical to the authentication system's user identifier.
   - If `Profile` were merged into `User`, or if `Profile` were assigned a disconnected UUID, all 59+ queries across 25+ API routes and pages would fail or require massive rewriting.

2. **Step 2 (Shared Primary Key Solution)**:
   - Linking `Profile` to Better Auth's `User` via a Shared Primary Key 1:1 relation:
     ```prisma
     model Profile {
       id   String @id
       user User   @relation(fields: [id], references: [id], onDelete: Cascade)
       ...
     ```
     ensures `Profile.id === User.id`.
   - When Better Auth authenticates a user, `session.user.id` is the user's ID.
   - Therefore, `prisma.profile.findUnique({ where: { id: session.user.id } })` resolves immediately with zero modifications to existing query filters or foreign keys.

3. **Step 3 (Password and Credential Separation)**:
   - Observation 5 confirms Better Auth does not store passwords in `User` or `Profile`. Passwords are encrypted and stored in `Account` with `providerId = "credential"`.
   - Thus, adding the standard 4 Better Auth models leaves the domain `Profile` clean and decoupled from raw auth secrets.

4. **Step 4 (Client & Adapter Compatibility)**:
   - Observation 3 confirms `src/lib/prisma.ts` already instantiates a global singleton `PrismaClient`.
   - Passing `prisma` to `prismaAdapter(prisma, { provider: "postgresql" })` in `src/lib/auth.ts` requires no changes to `src/lib/prisma.ts`.

5. **Step 5 (Deployment & Execution Flow)**:
   - Adding `User`, `Session`, `Account`, and `Verification` to `prisma/schema.prisma` and running `npx prisma db push` followed by `npx prisma generate` creates the database tables on Neon and regenerates the Prisma client without data loss or downtime.

---

## 3. Caveats

- **No Data Migration Needed**: As specified in `ORIGINAL_REQUEST.md` (R2: Fresh Start), historical Clerk user data does not need to be migrated to Neon.
- **Client Components vs Server Sessions**: Server routes must pass `headers: await headers()` to `auth.api.getSession()`. In Route Handlers, `request.headers` or `await headers()` is required so Better Auth can read session cookies.
- **CLI vs Manual Schema**: Running `npx @better-auth/cli generate` directly can overwrite manual comments and relations; manually applying the verified schema in `report.md` guarantees the 1:1 `user: User` relation on `Profile` remains intact.

---

## 4. Conclusion

The Prisma schema and database architecture for `learn-quran-academy` can be upgraded to Better Auth with complete preservation of existing domain queries and relations.

### Summary of Actions for Implementation:
1. **Uninstall Clerk**: `npm uninstall @clerk/nextjs`
2. **Install Better Auth**: `npm install better-auth @better-auth/prisma-adapter`
3. **Configure Environment (`.env.local`)**:
   - Add `BETTER_AUTH_SECRET="learn_quran_academy_better_auth_secret_key_2026_super_secure_32_chars"`
   - Add `BETTER_AUTH_URL="http://localhost:3000"`
4. **Update `prisma/schema.prisma`**:
   - Add `model User`, `model Session`, `model Account`, `model Verification`.
   - Add `user User @relation(fields: [id], references: [id], onDelete: Cascade)` to `model Profile`.
   - Add `profile Profile?` and `role String? @default("student")` to `model User`.
5. **Sync Database & Generate Client**:
   - Run `npx prisma db push`
   - Run `npx prisma generate`
6. **Create Auth Modules**:
   - `src/lib/auth.ts` (server auth configuration with prismaAdapter)
   - `src/lib/auth-client.ts` (client auth hooks `signIn`, `signUp`, `signOut`, `useSession`)
   - `src/app/api/auth/[...all]/route.ts` (catch-all route handler)

---

## 5. Verification Method

1. **Schema Validation**:
   - Run `npx prisma validate`
   - Expected: `The schema is valid.`
2. **Client Generation Verification**:
   - Run `npx prisma generate`
   - Expected: Client generated successfully, types for `prisma.user`, `prisma.session`, `prisma.account`, `prisma.verification` available.
3. **Database Connection Verification**:
   - Run `node test-db.mjs`
   - Expected: `Neon DB & Prisma verification succeeded!`
4. **Detailed Specification Reference**:
   - Inspect `d:\VS CODE\learn-quran-academy\.agents\teamwork\explorer_survey_ba_2\report.md` for the full replacement schema and implementation details.
