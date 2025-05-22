"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    // This component handles the OAuth callback from Google
    // It automatically:
    // 1. Processes the OAuth response
    // 2. Creates/updates the user session
    // 3. Redirects to the specified URLs based on whether it's a sign-in or sign-up
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/app" // Where to redirect after successful sign-in
      signUpForceRedirectUrl="/app" // Where to redirect after successful sign-up
    />
  );
}
