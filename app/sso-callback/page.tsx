"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    handleRedirectCallback({ redirectUrl: window.location.href });
  }, [handleRedirectCallback]);

  return null;
}
