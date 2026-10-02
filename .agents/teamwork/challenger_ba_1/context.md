# Context for Challenger 1 (Milestone 5)

## Mission
Adversarially challenge and stress-test the Better Auth migration:
1. Verify edge route protection matrix: public routes vs protected routes, prefix collision resistance (`/teachers` vs `/teacher`).
2. Verify session cookie handling (`better-auth.session_token` and `__Secure-better-auth.session_token`).
3. Verify unauthenticated 401 status across all protected API routes.
4. Verify cascade deletions and foreign key integrity in schema.
5. Verify zero leakage of server secrets in client bundles (`src/lib/auth-client.ts`, `src/components/Navbar.tsx`, etc.).
6. Run:
   - `node tests/better-auth-adversarial.test.mjs`
   - `node tests/better-auth-workflows.test.mjs`
   - `node tests/e2e-better-auth.test.mjs`

Write your report to: `d:\VS CODE\learn-quran-academy\.agents\teamwork\challenger_ba_1\handoff.md`
Report must end with a clear verdict: `VERDICT: APPROVE` or `VERDICT: REJECT`.
