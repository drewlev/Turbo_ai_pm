"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import BackgroundPaths from "@/components/backgroundPaths";
import { Button } from "@/components/ui/button";

export default function CustomAuth() {
  const { signUp, isLoaded } = useSignUp();
  const [loading, setLoading] = useState(false);

  const handleOneClickAuth = async () => {
    if (!isLoaded) return;

    setLoading(true);

    try {
      // Start the OAuth flow with Google
      // redirectUrl: Where to send the user after Google authentication
      // redirectUrlComplete: Where to send the user after Clerk completes the sign-up
      await signUp!.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback", // First stop: our SSO callback page to handle the session
        redirectUrlComplete: "/app", // Final destination: our app's main page
      });
    } catch (err) {
      console.error("Auth error", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-[#181921] text-[#d2d3e0]">
      <BackgroundPaths />
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="mx-auto w-full max-w-md bg-background border shadow-md rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Welcome
          </h2>
          <p className="mb-6 text-muted-foreground">
            Continue with Google to get started
          </p>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleOneClickAuth}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Continue with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
}
