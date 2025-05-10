"use client";

import { useSignIn, useSignUp, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BackgroundPaths from "@/components/backgroundPaths";
// import { FcGoogle } from "react-icons/fc";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { isSignedIn, isLoaded } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    console.log("Auth state changed:", { isLoaded, isSignedIn });
  }, [isLoaded, isSignedIn]);

  console.log("isSignedIn", isSignedIn, isSignUp);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (signIn) {
        console.log("Attempting to sign in with email:", email);
        await signIn.create({
          strategy: "email_code",
          identifier: email,
        });
        setIsSignUp(false);
        setShowCodeInput(true);
      }
    } catch (err) {
      console.log("Sign in failed, attempting sign up", err);
      try {
        if (signUp) {
          await signUp.create({ emailAddress: email });
          await signUp.prepareEmailAddressVerification();
          setIsSignUp(true);
          setShowCodeInput(true);
        }
      } catch (signUpErr) {
        console.error("Sign up failed", signUpErr);
        setError("Failed to process your email. Please try again.");
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
      if (isSignUp && signUp) {
        const result = await signUp.attemptEmailAddressVerification({ code });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          router.push("/app");
        }
      } else if (!isSignUp && signIn) {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
                  <h1 className="text-2xl font-bold">Welcome back To </h1>
                  <p className="text-balance text-muted-foreground">
                    {showCodeInput
                      ? "Enter your verification code"
                      : "Sign in with your email"}
                  </p>
                </div>

                {!showCodeInput ? (
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
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div> */}

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending code..." : "Continue"}
                      </Button>
                    </form>
                  </>
                ) : (
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Enter verification code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                  </form>
                )}

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <div className="text-center text-sm">
                  Don&apos;t have an account? No worries!
                  <br />
                  Just enter your email to get started.
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
