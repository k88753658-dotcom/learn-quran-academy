# Context for worker_ba_m1_finisher

## Objective
Finalize Milestone 1 (Package Dependencies & Prisma Database Schema).

## Predecessor Handoff
Refer to: `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m1\handoff.md`
and script: `d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m1\run_m1.mjs`.

## Tasks
1. Ensure `.env.local` has `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL=http://localhost:3000` set.
2. Run `npx prisma validate` and verify schema is valid.
3. Run `npx prisma db push` to push `User`, `Session`, `Account`, `Verification`, and 1:1 `Profile` relation to Neon DB.
4. Run `npx prisma generate` to generate the updated `@prisma/client`.
5. Run `node test-db.mjs` to verify database operations against Neon DB.
6. Run `node tests/better-auth-schema.test.mjs` to verify test suite schema contracts pass.
7. Document all commands, outputs, and status in `handoff.md`.
