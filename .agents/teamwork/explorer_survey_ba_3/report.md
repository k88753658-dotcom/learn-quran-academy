# Better Auth Architecture, API Routes, Server Actions, & Auth UI Blueprint

**Author**: `explorer_survey_ba_3`  
**Date**: 2026-09-30  
**Target Repository**: `d:\VS CODE\learn-quran-academy`  
**Context**: Migration from `@clerk/nextjs` to open-source `better-auth` with Prisma adapter on Neon PostgreSQL (Next.js 16.2.6, React 19.2.4).

---

## 1. Executive Summary & Architectural Overview

The application is undergoing a complete authentication refactoring from Clerk to Better Auth. The migration requires zero breaking changes to existing database queries or UI layouts, while ensuring 100% eradication of `@clerk/nextjs` (0 occurrences of `clerk` in `src/`).

### Key Architectural Findings:
1. **Framework & Environment**:
   - Next.js: `16.2.6` (App Router)
   - React: `19.2.4`
   - Prisma Client: `6.19.3`
   - Notice: In Next.js 15+, dynamic functions like `headers()` and `cookies()` from `next/headers` return Promises (`await headers()`). Better Auth's server API cleanly handles this via `{ headers: await headers() }`.
2. **Current State of Authentication in Codebase**:
   - **Total files containing Clerk in `src/`**: 51 files (7 UI/config files + 44 API route handlers).
   - **Server Actions**: Currently **0** Server Actions exist (`"use server"` count = 0). All backend operations are handled through Next.js Route Handlers (`src/app/api/.../route.ts`).
   - **Clerk UI Components**: `<ClerkProvider>` wraps root layout (`src/app/layout.tsx`), `<SignIn />` is rendered in `src/app/login/page.tsx`, and `<UserButton />` is used in `src/components/Navbar.tsx`.
   - **API Routes**: 44 API routes call `const { userId } = await auth();` and 6 endpoints call `clerkClient` for user provisioning/deletion.
3. **Database Mapping Strategy**:
   - Better Auth adds 4 core models: `User`, `Session`, `Account`, `Verification`.
   - The existing `Profile` model has `id String @id`. By ensuring `Profile.id` maps 1:1 to `User.id` (or `user User @relation(fields: [id], references: [id], onDelete: Cascade)`), all existing database queries in all 44 API routes (`prisma.profile.findUnique({ where: { id: userId } })` and `prisma.student.findFirst({ where: { OR: [{ profileId: userId }, { id: userId }] } })`) continue working with zero schema breakage.

---

## 2. Better Auth Core Setup

### 2.1. Dependencies
Install `better-auth`:
```bash
npm install better-auth
npm uninstall @clerk/nextjs
```

### 2.2. Server Auth Instance (`src/lib/auth.ts`)
Create `src/lib/auth.ts` initializing `betterAuth` with the Prisma adapter and custom fields.

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
    requireEmailVerification: false,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false, // Security: clients cannot self-assign role via sign-up
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,             // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
```

### 2.3. Dynamic API Route Handler (`src/app/api/auth/[...all]/route.ts`)
Create the catch-all API route handler to process all Better Auth requests (e.g., `/api/auth/sign-in/email`, `/api/auth/sign-up/email`, `/api/auth/sign-out`, `/api/auth/get-session`):

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### 2.4. Client-side Auth Instance (`src/lib/auth-client.ts`)
Create `src/lib/auth-client.ts` using `createAuthClient` from `better-auth/react`:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
```

### 2.5. Centralized Server Session Helper (`src/lib/session.ts`)
To avoid repeating boilerplate `auth.api.getSession({ headers: await headers() })` across 44 API routes and potential Server Actions, create `src/lib/session.ts`:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Retrieves the currently authenticated Better Auth session on the server.
 * Compatible with Next.js 15+ / 16 App Router.
 */
export async function getServerSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return session;
}

/**
 * Convenience helper to retrieve only the authenticated User or null.
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}
```

---

## 3. Authentication UI & Navbar Rebuild

### 3.1. Root Layout Cleanup (`src/app/layout.tsx`)
**Observation**: Lines 3, 27, 51 wrap the root HTML document in `<ClerkProvider>`.
**Action**: Remove `<ClerkProvider>` entirely. Better Auth does not require an outer context provider wrapping `<html>`.

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn Quran Academy — Global Online Quran Education",
  description: "Certified Tajweed, Hifz, and foundational Quranic studies for students worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased selection:bg-[#0F5132] selection:text-white">
        {children}
      </body>
    </html>
  );
}
```

---

### 3.2. Custom Login Page (`src/app/login/page.tsx`)
**Observation**: Currently uses Clerk's `<SignIn />` component inside the right-hand panel (lines 81–104). The left-hand panel contains high-end branding (quotes, statistics, badges) that must be preserved.

**Implementation Specification**:
1. Replace `<SignIn />` with a custom, accessible React form styled with Tailwind CSS matching the academy's visual identity:
   - Primary: Deep Emerald (`#0F5132`)
   - Accent: Gold (`#D4AF37`)
   - Backgrounds: Clean whites (`#FFFFFF`) and neutrals (`#F9F9F9`)
2. Use `authClient.signIn.email({ email, password })`.
3. Provide:
   - Email input with email icon and validation.
   - Password input with toggleable show/hide password (`Eye` / `EyeOff` from `lucide-react`).
   - Loading indicator on the submit button.
   - User-friendly error message display.
   - Seamless role-based redirect post-login (or reading `/api/login` / session profile).
   - "Don't have an account? Start 3-day Free Trial" pointing to `/register`.
   - "← Back to Homepage" link.

**Code Blueprint for `src/app/login/page.tsx`**:
```tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Check role from user object if available, or query /api/login for dashboard routing
      const userRole = (data?.user as any)?.role;
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else if (userRole === "teacher") {
        router.push("/teacher/dashboard");
      } else if (redirectUrl && redirectUrl !== "/login") {
        router.push(redirectUrl);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex font-sans selection:bg-[#0F5132] selection:text-white">
      {/* ===== LEFT PANEL: BRANDING (Preserved 100%) ===== */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F5132] relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.5) 35px, rgba(255,255,255,0.5) 36px)`,
        }} />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif italic text-xl tracking-tight">
              LQ
            </div>
            <span className="text-white/80 text-sm font-light tracking-[0.2em] uppercase group-hover:text-white transition-colors">
              Learn Quran Academy
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="text-[#D4AF37]/40 font-serif text-8xl leading-none">"</div>
          <h2 className="text-4xl xl:text-5xl font-serif text-white leading-[1.2] tracking-tight -mt-8">
            Whoever teaches <br />something, gets the <br />
            <span className="text-[#D4AF37] italic">reward of the learner.</span>
          </h2>
          <div className="flex items-center gap-4 mt-8">
            <div className="w-12 h-[1px] bg-[#D4AF37]/50" />
            <p className="text-white/50 text-sm font-light tracking-widest uppercase">Prophet Muhammad ﷺ</p>
          </div>
        </div>

        <div className="relative z-10 flex gap-12">
          <div>
            <p className="text-3xl font-serif text-[#D4AF37]">500+</p>
            <p className="text-white/40 text-xs font-light tracking-widest uppercase mt-1">Students</p>
          </div>
          <div>
            <p className="text-3xl font-serif text-[#D4AF37]">15+</p>
            <p className="text-white/40 text-xs font-light tracking-widest uppercase mt-1">Countries</p>
          </div>
          <div>
            <p className="text-3xl font-serif text-[#D4AF37]">4.9★</p>
            <p className="text-white/40 text-xs font-light tracking-widest uppercase mt-1">Rating</p>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: BESPOKE BETTER AUTH LOGIN ===== */}
      <div className="w-full lg:w-[55%] bg-[#F9F9F9] flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F5132] flex items-center justify-center text-[#D4AF37] font-serif italic text-lg">
              LQ
            </div>
            <span className="text-gray-900 text-sm font-light tracking-[0.2em] uppercase">Learn Quran Academy</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-8 sm:p-10 relative z-10"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-6 h-[1px] bg-[#D4AF37]" />
              <span className="text-[#0F5132] text-[10px] font-black uppercase tracking-[0.25em]">Portal Access</span>
            </div>
            <h1 className="text-3xl font-serif text-gray-900 tracking-tight">Sign In</h1>
            <p className="text-gray-500 font-light text-sm mt-1">Enter your credentials to access your classroom terminal.</p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0F5132] focus:bg-white transition-all pl-10"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0F5132] focus:bg-white transition-all pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F5132] hover:bg-[#D4AF37] hover:text-[#0F5132] text-white font-black text-xs uppercase tracking-[0.2em] py-3.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-xs text-gray-500 font-light">
              Don't have a student account?{" "}
              <Link href="/register" className="text-[#0F5132] font-bold hover:text-[#D4AF37] transition-colors">
                Apply for 3-Day Free Trial
              </Link>
            </p>
            <div>
              <Link href="/" className="text-[11px] font-light text-gray-400 hover:text-[#0F5132] transition-colors tracking-widest uppercase">
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
```

---

### 3.3. Custom Register Flow & Page (`src/app/register/page.tsx` & `/api/register`)
**Observation**: `src/app/register/page.tsx` is already a 363-line custom Tailwind CSS multi-field enrollment page that gathers:
- Parent/Guardian: `parentName`, `email`, `whatsappNumber`, `country`, `password`
- Student: `studentName`, `studentAge`, `selectedCourse`, `specialRequirements`
It submits a JSON POST payload to `/api/register`.

**Better Auth Integration Architecture**:
Inside `src/app/api/register/route.ts`:
1. Remove all Clerk code (`import { clerkClient } from "@clerk/nextjs/server"`, `client.users.createUser(...)`).
2. Replace with Better Auth Server API user creation:
   ```ts
   const userRes = await auth.api.signUpEmail({
     body: {
       email: cleanEmail,
       password: password,
       name: String(studentName).trim(),
     },
   });
   const newUserId = userRes.user.id;
   ```
3. Synchronize `Profile`, `Student`, and `Billing` in Prisma using `newUserId`:
   ```ts
   await prisma.profile.create({
     data: {
       id: newUserId,
       name: String(studentName).trim(),
       email: cleanEmail,
       role: "student",
       whatsapp: whatsappNumber ? String(whatsappNumber).trim() : null,
       isProfileComplete: true,
     },
   });
   ```
4. Return `{ success: true, studentId: student.id, userId: newUserId }`.

**Optional Dedicated Client Sign-Up Component**:
If a standalone minimal registration form is needed that uses `authClient.signUp.email` directly on the client:
```tsx
const { data, error } = await authClient.signUp.email({
  email,
  password,
  name,
  callbackURL: "/dashboard",
});
```

---

### 3.4. Navbar Rebuild (`src/components/Navbar.tsx`)
**Observation**:
- Line 7: `import { UserButton, useUser } from "@clerk/nextjs";`
- Line 12: `const { isSignedIn, user, isLoaded } = useUser();`
- Line 110 & 193: `<UserButton ... />`

**Requirements for Better Auth Navbar**:
1. Replace Clerk hooks with Better Auth React hooks:
   ```ts
   import { useSession, signOut } from "@/lib/auth-client";
   ```
2. Retrieve session state:
   ```ts
   const { data: session, isPending } = useSession();
   const user = session?.user;
   const isSignedIn = !!user;
   ```
3. Extract role:
   ```ts
   const role = (user as any)?.role || (typeof window !== "undefined" ? localStorage.getItem("user_role") : null);
   ```
4. Render Authenticated Desktop UI:
   - "Dashboard" redirect button (redirecting to `/admin/dashboard`, `/teacher/dashboard`, or `/dashboard`).
   - Clean User Pill / Dropdown displaying:
     - Avatar circle with user's initial (`user.name?.charAt(0).toUpperCase() || "U"`).
     - User name and role badge.
     - A sleek "Sign Out" button calling `signOut()`.
5. Render Authenticated Mobile UI:
   - "Go to Dashboard" button.
   - User account summary card.
   - Prominent "Sign Out" button.
6. Sign Out Handler:
   ```ts
   const handleSignOut = async () => {
     try {
       localStorage.clear();
       await signOut({
         fetchOptions: {
           onSuccess: () => {
             router.push("/login");
           },
         },
       });
     } catch (err) {
       console.error("Sign-out error:", err);
       router.push("/login");
     }
   };
   ```

**Navbar Code Replacement Specification**:
```tsx
// In src/components/Navbar.tsx
// REPLACE line 7:
// import { UserButton, useUser } from "@clerk/nextjs";
// WITH:
import { useSession, signOut } from "@/lib/auth-client";

// REPLACE line 12:
// const { isSignedIn, user, isLoaded } = useUser();
// WITH:
const { data: session, isPending } = useSession();
const user = session?.user;
const isSignedIn = !!user;

// REPLACE desktop actions (lines 101-130):
<div className="hidden md:flex items-center gap-5 relative z-50">
  {isSignedIn ? (
    <div className="flex items-center gap-4">
      <button
        onClick={handleDashboardRedirect}
        className="text-[11px] font-bold uppercase tracking-widest text-[#0F5132] hover:text-[#D4AF37] transition-colors cursor-pointer"
      >
        Dashboard
      </button>
      <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
        <div className="w-8 h-8 rounded-full bg-[#0F5132] text-white border border-[#D4AF37]/50 flex items-center justify-center font-bold text-xs shadow-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <button
          onClick={handleSignOut}
          className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors py-1 px-2.5 rounded border border-red-200 hover:border-red-300 bg-red-50/50 cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  ) : (
    <>
      <Link href="/login" className="text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-[#0F5132] transition-colors">
        Login
      </Link>
      <Link href="/register" className="group relative overflow-hidden bg-[#D4AF37] text-[#0F5132] text-[11px] font-black uppercase tracking-widest px-7 py-3 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">
        <span className="relative z-10 text-[#0F5132]">Enroll Now</span>
        <ChevronRight className="w-4 h-4 text-[#0F5132] group-hover:translate-x-1 transition-transform relative z-10" />
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
      </Link>
    </>
  )}
</div>

// REPLACE mobile drawer authenticated section (lines 183-195):
{isSignedIn ? (
  <>
    <button
      onClick={handleDashboardRedirect}
      className="w-full bg-[#0F5132] text-white text-sm font-black uppercase tracking-widest py-4 rounded-xl shadow-sm flex justify-center items-center gap-2"
    >
      Go to Dashboard <ChevronRight className="w-5 h-5" />
    </button>
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#0F5132] text-white flex items-center justify-center font-bold text-sm">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-900">{user?.name || "Student"}</span>
          <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{user?.email}</span>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 bg-white"
      >
        Sign Out
      </button>
    </div>
  </>
) : ( ... )}
```

---

### 3.5. Dashboard Pages Sign-Out Updates (3 Files)
1. `src/app/admin/dashboard/page.tsx`:
   - Replace: `import { useClerk, useUser } from "@clerk/nextjs";`
   - With: `import { signOut, useSession } from "@/lib/auth-client";`
   - In component:
     ```ts
     const { data: session } = useSession();
     const user = session?.user;
     const handleSignOut = async () => {
       try {
         localStorage.clear();
         await signOut({
           fetchOptions: {
             onSuccess: () => router.push("/login"),
           },
         });
       } catch (e) {
         console.error("Sign out error:", e);
         router.push("/login");
       }
     };
     ```
2. `src/app/dashboard/page.tsx`:
   - Replace: `import { useClerk } from "@clerk/nextjs";`
   - With: `import { signOut } from "@/lib/auth-client";`
   - In component: `await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });`
3. `src/app/teacher/dashboard/page.tsx`:
   - Replace: `import { useClerk } from "@clerk/nextjs";`
   - With: `import { signOut } from "@/lib/auth-client";`
   - In component: `await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });`

---

## 4. Protected API Routes & Server Actions

### 4.1. Exhaustive Inventory of 44 Protected API Routes
All 44 protected API routes import `@clerk/nextjs/server`. Here is the categorization:

#### A. Administrative Routes (17 Routes)
Require authenticated session and `profile.role === "admin"`:
1. `src/app/api/admin-billing/route.ts`
2. `src/app/api/admin-classes/route.ts`
3. `src/app/api/admin-stats/route.ts`
4. `src/app/api/admin-students/route.ts`
5. `src/app/api/admin-teachers/route.ts`
6. `src/app/api/add-teacher/route.ts`
7. `src/app/api/add-student/route.ts`
8. `src/app/api/approve-manual-payment/route.ts`
9. `src/app/api/reject-manual-payment/route.ts`
10. `src/app/api/approve-teacher-application/route.ts`
11. `src/app/api/reject-teacher-application/route.ts`
12. `src/app/api/assign-teacher/route.ts`
13. `src/app/api/delete-student/route.ts`
14. `src/app/api/delete-user/route.ts`
15. `src/app/api/get-teacher-applications/route.ts`
16. `src/app/api/make-admin/route.ts`
17. `src/app/api/publish-announcement/route.ts`

#### B. Teacher Routes (12 Routes)
Require authenticated session and `profile.role === "teacher"`:
1. `src/app/api/teacher-dashboard/route.ts`
2. `src/app/api/teacher-classes/route.ts`
3. `src/app/api/teacher-students/route.ts`
4. `src/app/api/teacher-schedule/route.ts`
5. `src/app/api/teacher-attendance/route.ts`
6. `src/app/api/mark-attendance/route.ts`
7. `src/app/api/update-student/route.ts`
8. `src/app/api/update-progress/route.ts`
9. `src/app/api/assign-task/route.ts`
10. `src/app/api/update-teacher-activity/route.ts`
11. `src/app/api/update-teacher-profile/route.ts`
12. `src/app/api/add-availability/route.ts`

#### C. Student Routes (6 Routes)
Require authenticated session and student profile:
1. `src/app/api/student-dashboard/route.ts`
2. `src/app/api/student-schedule/route.ts`
3. `src/app/api/student-profile/route.ts`
4. `src/app/api/student-history/route.ts`
5. `src/app/api/student-billing/route.ts`
6. `src/app/api/my-attendance/route.ts`

#### D. Multi-Role & Resource Management Routes (9 Routes)
1. `src/app/api/attendance/route.ts` (GET & POST)
2. `src/app/api/billing/route.ts` (GET & POST)
3. `src/app/api/courses/route.ts` (POST, PUT)
4. `src/app/api/get-active-announcements/route.ts`
5. `src/app/api/get-students/route.ts`
6. `src/app/api/get-teachers/route.ts`
7. `src/app/api/live-session/route.ts`
8. `src/app/api/login/route.ts`
9. `src/app/api/register/route.ts`

---

### 4.2. Session Verification Conversion Pattern

#### Standard Session Verification:
**Before (Clerk)**:
```ts
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  ...
}
```

**After (Better Auth)**:
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  ...
}
```

Or using our `getServerSession()` helper:
```ts
import { getServerSession } from "@/lib/session";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  ...
}
```

---

### 4.3. User Creation / Provisioning Routes (4 Routes)
In Clerk, routes called `client.users.createUser({...})`. With Better Auth, user creation is performed directly using Better Auth's server API: `auth.api.signUpEmail` or direct database transactions.

#### Example 1: `src/app/api/add-teacher/route.ts`
```ts
// 1. Session & Admin Check
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
const callerProfile = await prisma.profile.findUnique({
  where: { id: session.user.id },
  select: { role: true },
});
if (!callerProfile || callerProfile.role !== "admin") {
  return NextResponse.json({ success: false, error: "Unauthorized: Admin privileges required." }, { status: 403 });
}

// 2. Provision User via Better Auth Server API
const userRes = await auth.api.signUpEmail({
  body: {
    email: safeEmail,
    password: String(password),
    name: formattedName,
  },
});
const newTeacherId = userRes.user.id;

// 3. Create Profile in Prisma
await prisma.profile.create({
  data: {
    id: newTeacherId,
    name: formattedName,
    email: safeEmail,
    role: safeRole as any,
    isProfileComplete: true,
  },
});
```

#### Example 2: `src/app/api/delete-user/route.ts`
In Clerk:
`await client.users.deleteUser(clerkIdToDelete).catch(() => null);`
With Better Auth:
Deleting the `User` from Prisma (`prisma.user.delete({ where: { id: targetId } })`) automatically cascades to delete all `Session` and `Account` rows.
```ts
// In src/app/api/delete-user/route.ts
await prisma.student.deleteMany({ where: { OR: [{ id: cleanTargetId }, { profileId: cleanTargetId }] } });
await prisma.profile.deleteMany({ where: { id: cleanTargetId } });
await prisma.user.deleteMany({ where: { id: cleanTargetId } });
```

---

### 4.4. Server Actions Assessment
- **Status**: Exactly **0** Server Actions exist in the current project (`grep_search` found no `"use server"` declarations in `src/`).
- **Guideline for future Server Actions**:
  If Server Actions are added, session verification is identical to Route Handlers:
  ```ts
  "use server";
  import { getServerSession } from "@/lib/session";

  export async function myAction() {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    // execute action...
  }
  ```

---

## 5. Middleware Session Handling Architecture

### 5.1. Next.js 16 App Router Middleware Design (`src/middleware.ts`)
In Clerk, `clerkMiddleware` wraps the entire middleware function.
In Better Auth, the middleware is a native Next.js `middleware(request: NextRequest)` function that inspects Better Auth's session token cookie.

Better Auth cookie names:
- Development (HTTP): `better-auth.session_token`
- Production (HTTPS): `__Secure-better-auth.session_token`

### 5.2. Public Route Whitelist
The public routes list must be preserved and expanded to include `"/api/auth(.*)"` so Better Auth endpoints can receive requests without middleware interference:
- Web pages: `/`, `/login(.*)`, `/register(.*)`, `/about(.*)`, `/contact(.*)`, `/courses(.*)`, `/pricing(.*)`, `/teach(.*)`, `/kids(.*)`, `/countries(.*)`, `/blog(.*)`, `/teachers(.*)`, `/payment-terminal(.*)`, `/student-portal(.*)`
- API routes:
  - `"/api/auth(.*)"` **(CRITICAL for Better Auth)**
  - `"/api/public-teachers(.*)"`
  - `"/api/courses(.*)"`
  - `"/api/contact(.*)"`
  - `"/api/register(.*)"`
  - `"/api/teacher-application(.*)"`
  - `"/api/student-profile(.*)"`
  - `"/api/live-session(.*)"`
  - `"/api/student-self-attendance(.*)"`
  - `"/api/verify-manual-payment(.*)"`
  - `"/api/webhooks(.*)"`
  - `"/api/chat(.*)"`
  - `"/api/cron(.*)"`
  - `"/api/test-db(.*)"`

### 5.3. Middleware Code Blueprint
```ts
// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const publicRoutePrefixes = [
  "/",
  "/login",
  "/register",
  "/about",
  "/contact",
  "/courses",
  "/pricing",
  "/teach",
  "/kids",
  "/countries",
  "/blog",
  "/teachers",
  "/payment-terminal",
  "/student-portal",
  "/api/auth",
  "/api/public-teachers",
  "/api/courses",
  "/api/contact",
  "/api/register",
  "/api/teacher-application",
  "/api/student-profile",
  "/api/live-session",
  "/api/student-self-attendance",
  "/api/verify-manual-payment",
  "/api/webhooks",
  "/api/chat",
  "/api/cron",
  "/api/test-db",
];

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  return publicRoutePrefixes.some((prefix) => {
    if (prefix === "/") return false;
    return pathname === prefix || pathname.startsWith(prefix + "/");
  });
}

const protectedRoutePrefixes = ["/admin", "/teacher", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public routes
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2. Read Better Auth session token cookie
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // 3. Handle unauthenticated access
  if (!sessionToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active session required." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based routing gatekeeper (optional cookie-based or delegated to page/API verification)
  const userRole = request.cookies.get("user_role")?.value;
  if (userRole) {
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname.startsWith("/teacher") && userRole !== "teacher" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

## 6. Implementation & Verification Roadmap

### Phase 1: Core Setup
1. Update `package.json`:
   - Uninstall `@clerk/nextjs`.
   - Install `better-auth`.
2. Environment Configuration (`.env.local`):
   - Add `BETTER_AUTH_SECRET="<random-32-char-secret>"`.
   - Add `BETTER_AUTH_URL="http://localhost:3000"`.
   - Add `NEXT_PUBLIC_APP_URL="http://localhost:3000"`.
3. Prisma Schema Update (coordinated with `explorer_survey_ba_2` findings):
   - Add models `User`, `Session`, `Account`, `Verification`.
   - Add 1:1 relation between `User` and `Profile`.
   - Run `npx prisma generate`.
4. Create Core Files:
   - `src/lib/auth.ts`
   - `src/lib/auth-client.ts`
   - `src/lib/session.ts`
   - `src/app/api/auth/[...all]/route.ts`

### Phase 2: Frontend & UI Refactor
1. `src/app/layout.tsx`: Remove `<ClerkProvider>`.
2. `src/middleware.ts`: Replace with Better Auth cookie verification.
3. `src/components/Navbar.tsx`: Replace Clerk with `useSession` and custom Sign Out button.
4. `src/app/login/page.tsx`: Replace Clerk `<SignIn />` with custom Tailwind login form.
5. `src/app/admin/dashboard/page.tsx`: Replace `useClerk().signOut()` with Better Auth `signOut()`.
6. `src/app/dashboard/page.tsx`: Replace `useClerk().signOut()` with Better Auth `signOut()`.
7. `src/app/teacher/dashboard/page.tsx`: Replace `useClerk().signOut()` with Better Auth `signOut()`.

### Phase 3: API Route Handlers Refactor
1. Refactor 38 session-checking routes to use `getServerSession()` or `auth.api.getSession({ headers: await headers() })`.
2. Refactor 6 provisioning/deletion routes (`register`, `add-teacher`, `add-student`, `approve-teacher-application`, `delete-user`, `delete-student`) to use Better Auth server API and Prisma transactions.

### Phase 4: Verification Checks
1. **Search Verification**:
   Ensure exactly 0 matches for `clerk` (case-insensitive) in `src/`:
   ```bash
   grep -ri "clerk" src/
   ```
   *Expected count: 0*.
2. **Build Verification**:
   ```bash
   npm run build
   ```
   *Expected result: Zero TypeScript errors, zero lint errors, build completed successfully.*
3. **Database Test**:
   ```bash
   node test-db.mjs
   ```
   *Expected result: Neon database connectivity verified.*
