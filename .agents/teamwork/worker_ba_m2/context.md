# Context for worker_ba_m2

## Objective
Implement Milestone 2: Better Auth Core Infrastructure & Middleware.

## Scope & File Ownership
You exclusively own:
- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/lib/session.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/middleware.ts`

## Requirements & Specifications
1. `src/lib/auth.ts`:
   - Initialize Better Auth with Prisma adapter using `prisma` singleton from `@/lib/prisma`.
   - Import `prismaAdapter` from `better-auth/adapters/prisma`.
   - Enable `emailAndPassword: { enabled: true }`.
   - Set up user model mapping if needed (the models are `user`, `session`, `account`, `verification`).
   - Export `auth`: `export const auth = betterAuth({ ... });`.
   - Export type if needed: `export type Session = typeof auth.$Infer.Session;`.

2. `src/lib/auth-client.ts`:
   - Create client using `createAuthClient` from `better-auth/react`.
   - Export `authClient`: `export const authClient = createAuthClient();`.
   - Export helper hooks/methods: `export const { signIn, signUp, signOut, useSession } = authClient;`.

3. `src/lib/session.ts`:
   - Export `getServerSession()`:
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
   - Export GET and POST handlers:
     ```ts
     import { auth } from "@/lib/auth";
     import { toNextJsHandler } from "better-auth/next-js";

     export const { GET, POST } = toNextJsHandler(auth.handler);
     ```

5. `src/middleware.ts`:
   - Purge `@clerk/nextjs` completely.
   - Match and protect private routes (`/dashboard(.*)`, `/teacher(.*)`, `/admin(.*)`).
   - Check `better-auth.session_token` or `__Secure-better-auth.session_token` cookie.
   - Public paths: `/`, `/about`, `/courses(.*)`, `/teachers(.*)`, `/contact`, `/login`, `/register`, `/api/auth(.*)`, `/api/courses(.*)`, `/api/public-teachers(.*)`, `/api/teacher-application(.*)`.
   - Redirect unauthorized requests to `/login`.
   - Ensure matcher config avoids static files, images, etc.

6. Verification:
   - Run `node tests/better-auth-core.test.mjs`.
   - Verify that all core auth tests pass.
