## 2026-09-30T16:08:57Z
[Message] timestamp=2026-09-30T16:08:57Z sender=d344cbef-61fb-4ca0-bf70-d2f9541a4236 priority=MESSAGE_PRIORITY_HIGH content=You are worker_ba_m2.
Your working directory is: d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m2
Your role is: Core Auth & Middleware Specialist
Your parent is orchestrator_better_auth_gen2 (conversation ID: d344cbef-61fb-4ca0-bf70-d2f9541a4236).

Read:
- d:\VS CODE\learn-quran-academy\.agents\teamwork\ORIGINAL_REQUEST.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\orchestrator_better_auth_gen2\PROJECT.md
- d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m2\context.md
- tests/better-auth-core.test.mjs

Your exclusive write boundaries:
- src/lib/auth.ts
- src/lib/auth-client.ts
- src/lib/session.ts
- src/app/api/auth/[...all]/route.ts
- src/middleware.ts

Key Requirements:
1. `src/lib/auth.ts`:
   - Initialize Better Auth with Prisma adapter:
     ```ts
     import { betterAuth } from "better-auth";
     import { prismaAdapter } from "better-auth/adapters/prisma";
     import { prisma } from "@/lib/prisma";

     export const auth = betterAuth({
       database: prismaAdapter(prisma, {
         provider: "postgresql",
       }),
       emailAndPassword: {
         enabled: true,
       },
       secret: process.env.BETTER_AUTH_SECRET || "learn_quran_academy_better_auth_secret_key_2026_super_secure_32_chars",
       baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
     });

     export type Session = typeof auth.$Infer.Session;
     ```
2. `src/lib/auth-client.ts`:
   - Initialize client SDK:
     ```ts
     import { createAuthClient } from "better-auth/react";

     export const authClient = createAuthClient({
       baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
     });

     export const { signIn, signUp, signOut, useSession } = authClient;
     ```
3. `src/lib/session.ts`:
   - Centralized server session helper:
     ```ts
     import { auth } from '@/lib/auth';
     import { headers } from 'next/headers';

     export async function getServerSession() {
       return await auth.api.getSession({
         headers: await headers(),
       });
     }
     ```
4. `src/app/api/auth/[...all]/route.ts`:
   - Catch-all Next.js route handler:
     ```ts
     import { auth } from "@/lib/auth";
     import { toNextJsHandler } from "better-auth/next-js";

     export const { GET, POST } = toNextJsHandler(auth.handler);
     ```
5. `src/middleware.ts`:
   - Replace Clerk completely. Protect routes `/dashboard(.*)`, `/teacher(.*)`, `/admin(.*)`.
   - Check `better-auth.session_token` and `__Secure-better-auth.session_token` cookies. Whitelist public paths and `/api/auth(.*)`.
   - Redirect unauthenticated requests to `/login?callbackUrl=...`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Deliver your handoff report to:
d:\VS CODE\learn-quran-academy\.agents\teamwork\worker_ba_m2\handoff.md
Include Observation, Logic Chain, Caveats, Conclusion, and Verification Method.
When finished, notify your parent via send_message.
