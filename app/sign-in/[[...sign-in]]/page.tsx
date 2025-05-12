"use client";
// import { LoginForm } from "./_components/customSignIn";
import SignInPage from "./_components/customSignUp";
import { useState } from "react";

export default function Page() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex justify-center items-center h-screen">
      <SignInPage />
    </div>
  );
}
