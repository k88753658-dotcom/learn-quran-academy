## 2026-09-29T08:21:19Z
You are Worker M3 (teamwork_preview_worker).
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m3\
The authoritative user request is located at:
d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
You MUST read d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read d:\VS CODE\learn-quran-academy\PROJECT.md and d:\VS CODE\learn-quran-academy\TEST_INFRA.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You have exclusive write ownership over:
- src/app/api/courses/route.ts
- src/app/api/public-teachers/route.ts
- src/app/api/teacher-application/route.ts
- src/app/api/notifications/route.ts
- src/app/api/payment-ticket/route.ts
- src/app/api/student-self-attendance/route.ts

Your Task:
1. Refactor all 6 routes to completely remove `@/utils/supabase/*` and use Prisma (`import { prisma } from '@/lib/prisma';`):
   - `src/app/api/courses/route.ts`:
     - GET: `prisma.course.findMany({ orderBy: { createdAt: 'desc' } })`. Return `NextResponse.json({ courses })`.
     - POST: create course `prisma.course.create({ data: { title, description, duration, price, level, imageUrl } })`. Return `NextResponse.json({ course })`.
   - `src/app/api/public-teachers/route.ts`:
     - GET: `prisma.profile.findMany({ where: { role: 'teacher' }, select: { id: true, name: true, email: true, bio: true, specializations: true, qualification: true, experienceYears: true, profilePhotoUrl: true } })`. Return `NextResponse.json({ teachers })`.
   - `src/app/api/teacher-application/route.ts`:
     - POST: create application in `prisma.teacherApplication.create({ data: { fullName, email, phone, qualification, experienceYears, specializations, resumeUrl, status: 'Pending' } })`. Return `NextResponse.json({ message: "Application submitted successfully", id: application.id })`.
   - `src/app/api/notifications/route.ts`:
     - GET: fetch notifications for user `prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })`.
     - PATCH: mark as read `prisma.notification.update({ where: { id }, data: { isRead: true } })`.
   - `src/app/api/payment-ticket/route.ts`:
     - POST: create ticket `prisma.paymentTicket.create({ data: { studentId, studentName, amount, transactionId, receiptUrl, status: 'Pending' } })`.
   - `src/app/api/student-self-attendance/route.ts`:
     - POST: create or update attendance `prisma.attendance.create({ data: { studentId, date: new Date(date), status: 'Present', notes: 'Self attendance' } })`. Note: do NOT set markedById to literal string "student"; leave null or set to profile id.
2. Verify your implementation:
   - `npx tsc --noEmit`
   - `node tests/run-all.mjs --feature=8`
   - `node tests/run-all.mjs --feature=9`
   - `node tests/run-all.mjs --feature=10`
   - `node tests/run-all.mjs --feature=11`
3. Document commands, code changes, and test results in `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m3\handoff.md`.
4. Update progress.md with timestamped logs. When finished, send a message to parent with your handoff path.
