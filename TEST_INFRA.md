# Learn Quran Academy — E2E Test Suite Infrastructure & Specification

**Document Version:** 1.0.0  
**Target Architecture:** Next.js 16 (App Router) + Neon DB (PostgreSQL via Prisma ORM) + Clerk Authentication  
**Author:** E2E Test Suite Designer (`teamwork_preview_test_writer`)  
**Specification Sources:** `ORIGINAL_REQUEST.md`, `PROJECT.md`, Explorer Reports 1–3  

---

## 1. Test Philosophy

### 1.1 Opaque-Box & Requirement-Driven
The Learn Quran Academy test suite is designed strictly as an **opaque-box, requirement-driven verification system**. The tests evaluate application behavior through external interface contracts (HTTP route requests/responses, Prisma schema definitions, Clerk authentication gates, database model integrity, and end-to-end data workflows) without coupling to internal incidental implementation details.

Every test case derives its expected outcomes directly from:
1. **`ORIGINAL_REQUEST.md`**: Authoritative migration goals (zero Supabase footprint, Neon DB connection, Clerk authentication, successful build, working `test-db.mjs`).
2. **`PROJECT.md`**: Feature Inventory (Features 1–23), Interface Contracts (Clerk ↔ Prisma identity, Prisma singleton, Next.js route handler responses), and Code Layout.
3. **Domain Contracts**: Islamic Academy business rules (course cataloging, student registration, teacher onboarding, tuition billing, daily attendance tracking, role-based dashboard authorization).

### 1.2 The 4-Tier Test Methodology

The test suite is structured across four progressive testing tiers:

```
+-------------------------------------------------------------------------+
|                  TIER 4: Real-World User Workflows                      |
|  Complete end-to-end lifecycle journeys across academic cycles, tuition |
|  payments, teacher assignments, and disaster recovery.                  |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                TIER 3: Cross-Feature Interactions                       |
|  Multi-step transactional flows connecting auth, database models,       |
|  and route handlers (e.g. Application -> Approval -> Account -> Class).|
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                TIER 2: Boundaries & Error Conditions                    |
|  Negative testing: unauthenticated queries, role escalation attempts,   |
|  schema constraint violations, malformed payloads, injection vectors.   |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                TIER 1: Feature Coverage & Unit Contracts                |
|  Independent verification of each individual feature (Features 1 to 23) |
|  matching API signatures, schema models, layout components, and scripts.|
+-------------------------------------------------------------------------+
```

1. **Tier 1 — Feature Coverage (Isolated Feature Contracts)**:
   - Validates that each of the 23 items in the Feature Inventory fulfills its contract.
   - Covers schema models (`Profile`, `Student`, `Billing`, `Attendance`, `Notification`, `PaymentTicket`, `Course`, `TeacherApplication`), enums, singleton exports, script viability, route status codes, and payload formats.
2. **Tier 2 — Boundaries & Error Conditions (Adversarial Verification)**:
   - Evaluates system resilience under non-ideal conditions.
   - Verifies 401 Unauthorized for unauthenticated requests, 403 Forbidden for role mismatches (e.g. students accessing `/admin/dashboard` or teachers marking other teachers' students), 400 Bad Request on invalid parameters, unique constraint handling (duplicate emails, duplicate attendance on same date, duplicate transaction IDs), and sanitization of malicious or malformed inputs.
3. **Tier 3 — Cross-Feature Interactions (Integration Chains)**:
   - Validates state transitions across interdependent subsystems.
   - For example:
     - Student Registration -> Billing Account Creation (`Pending`) -> Manual Payment Ticket Submission (`Reviewing`) -> Admin Approval -> Student Status Update (`Enrolled = true`, Billing `Paid`, Ticket `Approved`).
     - Prospective Teacher Application (`pending`) -> Admin Review & Approval -> Clerk/Prisma Profile Generation (`teacher`) -> Student Assignment -> Attendance Logging -> Aggregate Attendance Analytics.
4. **Tier 4 — Real-World Workflows (End-to-End User Journeys)**:
   - Simulates complete persona journeys through the application matching actual student, teacher, and administrator behavior over an entire academic month.
   - Evaluates RBAC matrix completeness, concurrent state consistency, and edge recovery scenarios.

---

## 2. Feature Inventory Test Coverage Mapping

All 23 features defined in `PROJECT.md` are systematically covered across Tiers 1–4:

| Feature # | Feature Name | Tier 1 Test File | Tier 2 Coverage | Tier 3 Coverage | Tier 4 Coverage |
|---|---|---|---|---|---|
| **F01** | Complete Prisma Schema | `tests/tier1-features/f01-prisma-schema.test.mjs` | Schema constraints, enum boundaries | Cascade delete, foreign key integrity | Data model persistence across journeys |
| **F02** | Prisma Singleton Client | `tests/tier1-features/f02-prisma-client.test.mjs` | Multi-instantiation guard | Fast-refresh cache reuse | Concurrency stability |
| **F03** | Neon DB Verification Script | `tests/tier1-features/f03-neon-script.test.mjs` | Connection failure handling | CRUD rollback safety | Neon DB live execution |
| **F04** | Clerk Provider Root Layout | `tests/tier1-features/f04-clerk-layout.test.mjs` | Missing Clerk keys fallback | Provider tree wrapping | Full page hydration |
| **F05** | Clerk Route Protection Middleware | `tests/tier1-features/f05-clerk-middleware.test.mjs` | Route regex, unauth redirects | Role-based gating | Multi-role route matrix |
| **F06** | Navbar & Client Auth State | `tests/tier1-features/f06-navbar-auth-state.test.mjs` | SignedIn vs SignedOut states | Session invalidation sync | Navigation lifecycle |
| **F07** | Login & Register Pages | `tests/tier1-features/f07-login-register-pages.test.mjs` | Password length, email regex | Registration -> Profile sync | Student onboarding journey |
| **F08** | Public Courses API | `tests/tier1-features/f08-public-courses-api.test.mjs` | Missing title/desc, non-admin POST | Course deletion cascading | Catalog browsing & registration |
| **F09** | Public Teachers & Teach API | `tests/tier1-features/f09-public-teachers-teach-api.test.mjs` | Duplicate teacher email, empty fields | Application -> Review queue | Teacher recruitment workflow |
| **F10** | Notifications & Tickets API | `tests/tier1-features/f10-notifications-tickets-api.test.mjs` | Duplicate ticket transactionId | Targeted vs Global notifications | Academy announcement cycle |
| **F11** | Student Self-Attendance API | `tests/tier1-features/f11-student-self-attendance-api.test.mjs` | Double check-in on same day | Daily unique constraint | Student daily attendance portal |
| **F12** | Student Dashboard API Routes | `tests/tier1-features/f12-student-dashboard-api.test.mjs` | Student profile not found | Student dashboard data aggregation | Student learning dashboard journey |
| **F13** | Teacher Dashboard API Routes | `tests/tier1-features/f13-teacher-dashboard-api.test.mjs` | Non-teacher access, unassigned student | Teacher activity update & roster | Instructor class management journey |
| **F14** | Attendance Management API | `tests/tier1-features/f14-attendance-management-api.test.mjs` | Invalid status enum, future date | Attendance upsert & marker audit | Monthly attendance calculation |
| **F15** | Manual Payment Verification API | `tests/tier1-features/f15-manual-payment-verification-api.test.mjs` | Empty transaction ID, duplicate receipt | Billing status transition to Reviewing | Tuition payment & verification flow |
| **F16** | Auth API Handlers | `tests/tier1-features/f16-auth-api-handlers.test.mjs` | Invalid credentials, Clerk webhook edge | Profile sync on auth event | Complete credential cycle |
| **F17** | Admin Stats & Dashboards API | `tests/tier1-features/f17-admin-stats-dashboard-api.test.mjs` | Zero students division by zero | Live KPI aggregation from tables | Admin executive overview |
| **F18** | Admin User Management API | `tests/tier1-features/f18-admin-user-management-api.test.mjs` | Orphaned records, invalid user ID | Cascade user deletion | User provisioning & reassignment |
| **F19** | Admin Teacher Applications API | `tests/tier1-features/f19-admin-teacher-applications-api.test.mjs` | Non-existent application, invalid action | Approval -> User & Profile creation | Teacher onboarding & credentialing |
| **F20** | Admin Manual Payment Approval API | `tests/tier1-features/f20-admin-manual-payment-approval-api.test.mjs` | Approve non-existent student | Billing status update & ticket resolution | Tuition reconciliation workflow |
| **F21** | Clean Legacy Supabase & Unused Deps | `tests/tier1-features/f21-clean-legacy-supabase.test.mjs` | Dangling `@supabase` imports | Zero Supabase runtime dependency | Clean code & bundle audit |
| **F22** | Build Compilation & Type Safety | `tests/tier1-features/f22-build-type-safety.test.mjs` | TypeScript strict type violations | Compiler diagnostic verification | Production build readiness |
| **F23** | E2E DB Verification Execution | `tests/tier1-features/f23-e2e-db-verification.test.mjs` | Invalid connection string handling | Live CRUD cycle on Neon | End-to-end database validation |

---

## 3. Test Architecture & Directory Structure

The test suite is structured as follows:

```
d:\VS CODE\learn-quran-academy\
├── tests/
│   ├── helpers/
│   │   ├── test-harness.mjs                # Zero-dependency test runner, assert utilities, reporters
│   │   ├── contract-helpers.mjs            # AST & contract analysis tools (Prisma, Clerk, routes)
│   │   └── mock-context.mjs                # Request/response simulators & Clerk session builders
│   ├── tier1-features/                     # Tier 1: Isolated Feature Contract Tests
│   │   ├── f01-prisma-schema.test.mjs
│   │   ├── f02-prisma-client.test.mjs
│   │   ├── f03-neon-script.test.mjs
│   │   ├── f04-clerk-layout.test.mjs
│   │   ├── f05-clerk-middleware.test.mjs
│   │   ├── f06-navbar-auth-state.test.mjs
│   │   ├── f07-login-register-pages.test.mjs
│   │   ├── f08-public-courses-api.test.mjs
│   │   ├── f09-public-teachers-teach-api.test.mjs
│   │   ├── f10-notifications-tickets-api.test.mjs
│   │   ├── f11-student-self-attendance-api.test.mjs
│   │   ├── f12-student-dashboard-api.test.mjs
│   │   ├── f13-teacher-dashboard-api.test.mjs
│   │   ├── f14-attendance-management-api.test.mjs
│   │   ├── f15-manual-payment-verification-api.test.mjs
│   │   ├── f16-auth-api-handlers.test.mjs
│   │   ├── f17-admin-stats-dashboard-api.test.mjs
│   │   ├── f18-admin-user-management-api.test.mjs
│   │   ├── f19-admin-teacher-applications-api.test.mjs
│   │   ├── f20-admin-manual-payment-approval-api.test.mjs
│   │   ├── f21-clean-legacy-supabase.test.mjs
│   │   ├── f22-build-type-safety.test.mjs
│   │   └── f23-e2e-db-verification.test.mjs
│   ├── tier2-boundaries/                   # Tier 2: Boundaries, Edge Cases, Negative Tests
│   │   ├── auth-matrix-boundaries.test.mjs
│   │   ├── input-validation-boundaries.test.mjs
│   │   ├── schema-constraints-boundaries.test.mjs
│   │   └── error-handling-adversarial.test.mjs
│   ├── tier3-interactions/                 # Tier 3: Cross-Feature Integration Chains
│   │   ├── student-onboarding-payment-flow.test.mjs
│   │   ├── teacher-recruitment-assignment-flow.test.mjs
│   │   ├── attendance-logging-aggregation-flow.test.mjs
│   │   └── billing-ticket-reconciliation-flow.test.mjs
│   ├── tier4-workflows/                    # Tier 4: Real-World E2E Persona Journeys
│   │   ├── full-academic-term-journey.test.mjs
│   │   ├── multi-role-access-control-matrix.test.mjs
│   │   └── disaster-recovery-edge-cases.test.mjs
│   └── run-all.mjs                         # Unified Runner CLI entry point
├── TEST_INFRA.md                           # This infrastructure specification
└── TEST_READY.md                           # Operational readiness report & execution commands
```

---

## 4. Test Runner Invocation & CLI Usage

The test suite runs using standard Node.js without requiring external testing framework installations.

### 4.1 Running All Tiers
```bash
node tests/run-all.mjs
```
Runs the entire test suite across all 4 tiers, providing an aggregated summary table with pass/fail counts and timing.

### 4.2 Running Specific Tiers
```bash
# Tier 1 only (Feature contracts)
node tests/run-all.mjs --tier=1

# Tier 2 only (Boundaries, negative tests, adversarial inputs)
node tests/run-all.mjs --tier=2

# Tier 3 only (Cross-feature interactions)
node tests/run-all.mjs --tier=3

# Tier 4 only (End-to-end persona journeys)
node tests/run-all.mjs --tier=4
```

### 4.3 Running Individual Feature Tests
```bash
# Run specific feature test (e.g., Feature 12 - Student Dashboard)
node tests/run-all.mjs --feature=12

# Run directly via Node test runner
node tests/tier1-features/f12-student-dashboard-api.test.mjs
```

---

## 5. Pass/Fail Semantics & Progressive Testability

### 5.1 Pass Criteria
- **Assertion Validity**: All assertions (`assert.equal`, `assert.ok`, `assert.match`, `assert.rejects`) pass with exact matches.
- **Contract Verification**: Interface shapes match Next.js App Router route contracts (`NextResponse.json(...)`), Clerk authentication signatures (`userId`, `sessionClaims`), and Prisma model definitions.
- **Adversarial Integrity**: Escaped inputs, malicious payloads, and empty boundaries are correctly rejected with appropriate HTTP status codes (400, 401, 403, 404).

### 5.2 Progressive Testability Gate
During phased migration (M1 to M6):
- Milestone-specific tests verify completed milestones.
- Milestone dependencies are explicitly documented:
  - **M1 Tests (F01–F03)**: Require `prisma/schema.prisma`, `src/lib/prisma.ts`, `test-db.mjs`.
  - **M2 Tests (F04–F07)**: Require Clerk provider layout, middleware, client navigation.
  - **M3 Tests (F08–F11)**: Require public routes and core Prisma endpoints.
  - **M4 Tests (F12–F16)**: Require Student & Teacher dashboards, attendance, payments.
  - **M5 Tests (F17–F20)**: Require Admin reporting, teacher approval, user management.
  - **M6 Tests (F21–F23)**: Require full Supabase cleanup, build passing, live Neon connection.
- The test runner distinguishes between:
  - **PASS**: Feature implemented and fulfills all contracts.
  - **FAIL**: Feature has a logic defect or regression that must be escalated.
  - **PENDING**: Feature belongs to an upcoming milestone not yet dispatched.
