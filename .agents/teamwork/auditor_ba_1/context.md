# Context for Forensic Auditor (Milestone 5)

## Mission
Perform comprehensive forensic integrity audit on the Better Auth migration of "Learn Quran Academy":
1. Anti-cheating verification: Ensure no dummy facades, mock returns, or hardcoded pass strings.
2. Verify genuine integration: Better Auth server instance in `src/lib/auth.ts`, client SDK in `src/lib/auth-client.ts`, session helper in `src/lib/session.ts`, route handler in `src/app/api/auth/[...all]/route.ts`.
3. Verify zero occurrences of the word "clerk" across all files in `src/`.
4. Verify schema models in `prisma/schema.prisma` (`User`, `Session`, `Account`, `Verification`, and 1:1 `Profile` relation).
5. Verify unauthenticated 401 handling across protected routes in `src/app/api/`.

Write your report to: `d:\VS CODE\learn-quran-academy\.agents\teamwork\auditor_ba_1\handoff.md`
Report must conclude with:
`VERDICT: CLEAN` or `VERDICT: INTEGRITY VIOLATION`.
