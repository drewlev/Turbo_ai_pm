import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server";

// Define public routes that don't need auth at all
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)", // Use (.*) to match any sub-paths, e.g., /sign-in/[[...sign-in]]
  "/sign-up(.*)", // Use (.*) to match any sub-paths, e.g., /sign-up/[[...sign-up]]
  "/api/webhooks/clerk",
]);

// Define protected routes using Clerk's createRouteMatcher
const isProtectedRoute = createRouteMatcher([
  "/app(.*)", // Protect all routes under /app
  "/chat(.*)", // Protect all routes under /chat
]);

// Define app routes that should be checked for onboarding
const isAppRoute = (pathname: string) => {
  return pathname.startsWith("/app/") || pathname === "/app";
};

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req) => {
  const pathname = req.nextUrl.pathname;
  console.log("Middleware started for path:", pathname);

  // Skip middleware for non-app routes and static files
  if (!isAppRoute(pathname) && !pathname.startsWith("/user-onboarding")) {
    console.log("Skipping middleware - not an app or onboarding route");
    return NextResponse.next();
  }

  // Get auth state first
  const { userId, sessionClaims } = await auth();
  console.log("Auth check:", {
    userId,
    sessionClaims,
    metadata: sessionClaims?.metadata,
    onboarded: sessionClaims?.metadata?.onboarded,
  });

  const isOnboarded = sessionClaims?.metadata?.onboarded === true;

  // If user is onboarded and trying to access onboarding page, redirect to app
  if (isOnboarded && pathname === "/user-onboarding") {
    console.log("User is onboarded, redirecting to app");
    const redirectUrl = new URL("/app", req.url);
    console.log("Redirect URL:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  // If user is not onboarded and trying to access app routes, redirect to onboarding
  if (!isOnboarded && isAppRoute(pathname)) {
    console.log("User is not onboarded, redirecting to onboarding");
    const redirectUrl = new URL("/user-onboarding", req.url);
    console.log("Redirect URL:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  // 1. Allow access to public routes immediately (after onboarding check)
  if (isPublicRoute(req)) {
    console.log("Public route detected, allowing access");
    return NextResponse.next();
  }

  // 2. Protect specific routes:
  // If the path is a protected route AND it's not a public route
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    console.log("Protected route detected, checking auth");
    auth.protect();
  }

  console.log("No redirect needed, proceeding with request");
  // If none of the above conditions trigger a redirect, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Only match app routes and onboarding
    "/app/:path*",
    "/user-onboarding",
  ],
};
