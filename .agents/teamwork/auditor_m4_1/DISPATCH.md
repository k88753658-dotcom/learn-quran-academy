# Dispatch: auditor_m4_1

## Working Directory
d:\VS CODE\learn-quran-academy\.agents\teamwork\auditor_m4_1\

## Mission
Perform forensic integrity audit of Milestone M4 (Student & Teacher Dashboard API routes, Shared/Auth routes, and M3 hardening):
- Inspect all 23 route files touched by Worker M4.
- Conduct forensic checks:
  1. Zero hardcoded test return payloads or bypasses.
  2. Zero facade implementations.
  3. Proper singleton usage (`prisma` from `@/lib/prisma`).
  4. Complete eradication of `@supabase` runtime imports.
  5. Authentic Clerk integration (`auth()`, `clerkClient().users.createUser`).
  6. Authentic Prisma queries and mutations.

## References
- ORIGINAL_REQUEST: `d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md`
- PROJECT: `d:\VS CODE\learn-quran-academy\PROJECT.md`
- Worker Handoff: `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_m4\handoff.md`
- Prisma Schema: `d:\VS CODE\learn-quran-academy\prisma\schema.prisma`

## Instructions
1. Inspect each of the 23 files line-by-line for integrity violations.
2. Deliver a binary verdict: CLEAN or INTEGRITY VIOLATION with exhaustive evidence in `handoff.md`.
