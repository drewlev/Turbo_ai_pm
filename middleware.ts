import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ClerkMiddlewareAuth } from "@clerk/nextjs/server";

console.log("Middleware file loaded");

// Define public routes that don't need auth at all
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)", // Use (.*) to match any sub-paths, e.g., /sign-in/[[...sign-in]]
  "/sign-up(.*)", // Use (.*) to match any sub-paths, e.g., /sign-up/[[...sign-up]]
  "/api/webhooks/clerk",
  "/api/qstash(.*)",
]);

// Define protected routes using Clerk's createRouteMatcher
const isProtectedRoute = createRouteMatcher([
  "/app(.*)", // Protect all routes under /app
  "/chat(.*)", // Protect all routes under /chat
  "/user-onboarding(.*)",
]);

// Define app routes that should be checked for onboarding
const isAppRoute = (pathname: string) => {
  return pathname.startsWith("/app/") || pathname === "/app";
};

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req) => {
  // console.log("Middleware executing for path:", req.nextUrl.pathname);

  const pathname = req.nextUrl.pathname;
  // console.log("Pathname:", pathname);
  // console.log("Is public route:", isPublicRoute(req));
  // console.log("Is protected route:", isProtectedRoute(req));

  // Get auth state first
  const { userId, sessionClaims } = await auth();
  // console.log("Auth state:", { userId, sessionClaims });

  // If user is signed in and trying to access sign-in, redirect to app
  if (userId && pathname.startsWith("/sign-in")) {
    console.log("User is signed in, redirecting to app");
    const signInUrl = new URL("/app", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If no user is found and trying to access protected routes, redirect to sign in
  if (!userId && isProtectedRoute(req)) {
    // console.log("No user found, redirecting to sign in");
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Skip middleware for non-app routes and static files
  if (!isAppRoute(pathname) && !pathname.startsWith("/user-onboarding")) {
    // console.log("Skipping middleware - not an app or onboarding route");
    return NextResponse.next();
  }

  const isOnboarded = sessionClaims?.metadata?.onboarded === true;
  // console.log("Onboarding status:", isOnboarded);

  // Allow Slack callback to proceed regardless of onboarding status
  if (pathname === "/app/slack-callback") {
    console.log("Allowing Slack callback - proceeding with request");
    return NextResponse.next();
  }

  // If user is onboarded and trying to access onboarding page, redirect to app
  if (isOnboarded && pathname === "/user-onboarding") {
    // console.log("User is onboarded, redirecting to app");
    const redirectUrl = new URL("/app", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is not onboarded and trying to access app routes, redirect to onboarding
  if (!isOnboarded && isAppRoute(pathname)) {
    // console.log("User is not onboarded, redirecting to onboarding");
    const redirectUrl = new URL("/user-onboarding", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // console.log("No redirect needed, proceeding with request");
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Only match app routes and onboarding
    "/app/:path*",
    "/user-onboarding",
    "/sign-in(.*)", // Add sign-in to matcher
  ],
};
