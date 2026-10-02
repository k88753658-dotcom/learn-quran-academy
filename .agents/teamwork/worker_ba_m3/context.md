# Context for worker_ba_m3

## Objective
Implement Milestone 3: Authentication UI & Navigation Components.

## Scope & File Ownership
You exclusively own:
- `src/app/layout.tsx`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/components/Navbar.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/teacher/dashboard/page.tsx`
- `src/app/admin/dashboard/page.tsx`

## Requirements & Specifications
1. `src/app/layout.tsx`:
   - Remove `<ClerkProvider>` and any `@clerk/nextjs` imports.
   - Retain font imports, Tailwind CSS styling, Toaster, and standard layout structure.

2. `src/app/login/page.tsx`:
   - Beautiful, responsive Islamic/Modern Tailwind CSS login card.
   - Form fields: Email, Password, Remember Me (optional), Submit button with loading state.
   - Integrate with Better Auth:
     ```ts
     import { authClient } from "@/lib/auth-client";
     ...
     const { data, error } = await authClient.signIn.email({
       email,
       password,
       callbackURL: callbackUrl || "/dashboard"
     });
     ```
   - Graceful error messaging and link to `/register`.

3. `src/app/register/page.tsx`:
   - Tailored student registration form.
   - Integrate with Better Auth:
     ```ts
     import { authClient } from "@/lib/auth-client";
     ...
     const { data, error } = await authClient.signUp.email({
       email,
       password,
       name,
       callbackURL: "/dashboard"
     });
     ```
   - Automatically handles student onboarding flow and links to `/login`.

4. `src/components/Navbar.tsx`:
   - Eradicate ALL Clerk imports and components (`<SignedIn>`, `<SignedOut>`, `<UserButton>`, etc.).
   - Use `const { data: session, isPending } = authClient.useSession();`.
   - If authenticated, display user avatar / initials pill, user name, role badge, dashboard link, and Sign Out button.
   - If unauthenticated, display "Sign In" and "Register" buttons.
   - Implement sign out handler:
     ```ts
     await authClient.signOut({
       fetchOptions: {
         onSuccess: () => {
           router.push('/');
           router.refresh();
         }
       }
     });
     ```

5. Dashboard Sign Out:
   - In `src/app/dashboard/page.tsx`, `src/app/teacher/dashboard/page.tsx`, and `src/app/admin/dashboard/page.tsx`, replace `useClerk().signOut()` with `authClient.signOut()`.

6. Verification:
   - Run `node tests/better-auth-ui.test.mjs`.
