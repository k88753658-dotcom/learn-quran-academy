import { NextResponse, type NextRequest } from "next/server";

// Public marketing and informational route prefixes
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
];

// Protected route prefixes that strictly require active session authentication
const protectedRoutePrefixes = [
  "/dashboard",
  "/teacher",
  "/admin",
];

function isPublicRoute(pathname: string): boolean {
  // Always permit Better Auth API endpoints
  if (pathname.startsWith("/api/auth")) {
    return true;
  }

  // Exact root match
  if (pathname === "/") {
    return true;
  }

  // Exact or subpath match for login and register
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return true;
  }
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return true;
  }

  // Explicit disambiguation for teacher public vs portal paths:
  // /teachers and /teach are public marketing pages
  // /teacher is the protected instructor portal
  if (pathname === "/teachers" || pathname.startsWith("/teachers/")) {
    return true;
  }
  if (pathname === "/teach" || pathname.startsWith("/teach/")) {
    return true;
  }

  // Check remaining public route prefixes
  for (const prefix of publicRoutePrefixes) {
    if (
      prefix === "/" ||
      prefix === "/login" ||
      prefix === "/register" ||
      prefix === "/teachers" ||
      prefix === "/teach"
    ) {
      continue;
    }
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return true;
    }
  }

  return false;
}

function isProtectedRoute(pathname: string): boolean {
  // Explicitly avoid marking /teachers or /teach as protected
  if (pathname === "/teachers" || pathname.startsWith("/teachers/")) {
    return false;
  }
  if (pathname === "/teach" || pathname.startsWith("/teach/")) {
    return false;
  }

  for (const prefix of protectedRoutePrefixes) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return true;
    }
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Whitelist public routes from session inspection
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Inspect session token cookies (standard HTTP and production __Secure- variants)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // 3. Gate protected routes when no session token is present
  if (isProtectedRoute(pathname) && !sessionToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callbackUrl = encodeURIComponent(pathname + search);
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Default: unauthenticated access to non-public API routes returns 401
  if (!sessionToken && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
