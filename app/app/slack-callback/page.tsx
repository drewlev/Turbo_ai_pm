"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { assignSlackUser } from "@/app/actions/slack";

type Status = "loading" | "success" | "error";

function SlackCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleSlackCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || !state) {
        setStatus("error");
        setErrorMessage("Missing required parameters from Slack");
        return;
      }

      try {
        // Here you would typically exchange the code for a token
        // and get the Slack user ID. For now, we'll use a mock ID

        // Assign the Slack user to the user in our database
        await assignSlackUser(code, state);

        setStatus("success");

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push("/app"); // Adjust this to your desired redirect path
        }, 2000);
      } catch (error) {
        console.error("Error processing Slack callback:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    };

    handleSlackCallback();
  }, [searchParams, router]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Processing Slack Integration
            </h1>
            <p className="text-gray-600">
              Please wait while we complete the setup...
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </>
        );
      case "success":
        return (
          <>
            <h1 className="text-2xl font-bold mb-4 text-green-600">Success!</h1>
            <p className="text-gray-600">
              Slack integration completed successfully.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Redirecting you to the dashboard...
            </p>
          </>
        );
      case "error":
        return (
          <>
            <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
            <p className="text-gray-600">{errorMessage}</p>
            <button
              onClick={() => router.push("/app")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Return to onboarding
            </button>
          </>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
}

export default function SlackCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          </div>
        </div>
      }
    >
      <SlackCallbackContent />
    </Suspense>
  );
}
