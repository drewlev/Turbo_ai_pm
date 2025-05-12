"use client";

import { useSignIn, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BackgroundPaths from "@/components/backgroundPaths";
// import { FcGoogle } from "react-icons/fc";

export function LoginForm({
  setIsSignUp,
  className,
  ...props
}: React.ComponentProps<"div"> & { setIsSignUp: (isSignUp: boolean) => void }) {
  const { signIn } = useSignIn();
  const { isSignedIn, isLoaded } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/app");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (signIn) {
        await signIn.create({
          identifier: email,
          strategy: "email_code",
        });

        if (!signIn.supportedFirstFactors) {
          throw new Error("No supported first factors found");
        }

        const emailFactor = signIn.supportedFirstFactors.find(
          (factor) => factor.strategy === "email_code"
        );

        if (!emailFactor?.emailAddressId) {
          throw new Error("Email verification is not available");
        }

        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });

        setShowCodeInput(true);
      }
    } catch (err: any) {
      console.error("Sign in failed", err);

      // Check for user not found error
      if (
        err.errors?.some(
          (e: any) =>
            e.code === "form_identifier_not_found" ||
            e.message?.includes("identifier not found")
        )
      ) {
        // User doesn't exist, redirect to sign up
        router.push(`/sign-up?email=${encodeURIComponent(email)}`);
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (signIn) {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/app");
        }
      }
    } catch (err) {
      console.error("Code verification failed", err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (signIn) {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/app",
          redirectUrlComplete: "/app",
        });
      }
    } catch (err) {
      console.error("Google sign in failed", err);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative bg-[#181921] text-[#d2d3e0]">
      <BackgroundPaths />
      <div
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center",
          className
        )}
        {...props}
      >
        <Card className="overflow-hidden w-full max-w-md mx-auto">
          <CardContent className="grid p-0 md:grid-cols-1">
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome Back</h1>
                  <p className="text-balance text-muted-foreground">
                    {showCodeInput
                      ? "Enter your verification code"
                      : "Sign in to your account"}
                  </p>
                </div>

                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleSignIn}
                  >
                    {/* <FcGoogle className="h-5 w-5" /> */}
                    Continue with Google
                  </Button>

                  {/* <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase"></div>
                  </div> */}

                  {/* <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Sign In"}
                    </Button>
                  </form> */}
                </>

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Button
                    className="font-medium text-primary"
                    onClick={() => setIsSignUp(false)}
                  >
                    Sign in
                  </Button>
                </div>
                <div id="clerk-captcha" />
              </div>
            </div>
            <div className="relative hidden bg-muted md:block">
              <Image
                src="/placeholder.svg"
                alt="Image"
                fill
                className="object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
