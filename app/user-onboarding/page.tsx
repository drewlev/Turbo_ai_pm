"use client";
import { motion } from "framer-motion";
import { Calendar, Slack } from "lucide-react";
import { useState, useEffect } from "react";
import {
  onboardUserCalendar,
  checkCalendarConnectionStatus,
} from "@/app/actions/automations/calendar-watch-renewal";
import {
  onboardUserSlack,
  checkSlackConnectionStatus,
} from "@/app/actions/automations/slack-user-onboarding";
import { updateUserOnboardingStatus } from "@/app/actions/users";
import { createSlackOAuthUrl } from "@/app/actions/slack";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

type OnboardingStep = "calendar" | "slack" | "complete";

interface ConnectionStatus {
  status: "loading" | "success" | "error" | "user-input-required";
  message?: string;
  expiresAt?: Date;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("calendar");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const { session } = useClerk();
  const [calendarStatus, setCalendarStatus] = useState<ConnectionStatus>({
    status: "loading",
  });
  const [slackStatus, setSlackStatus] = useState<ConnectionStatus>({
    status: "loading",
  });

  // Check calendar status
  useEffect(() => {
    const checkCalendarStatus = async () => {
      if (!user || currentStep !== "calendar") return;

      try {
        const status = await checkCalendarConnectionStatus();
        if (status.connected) {
          setCalendarStatus({
            status: "success",
            message: "Calendar connected",
            expiresAt: status.expiresAt,
          });
          // Move to Slack step after a short delay
          setTimeout(() => setCurrentStep("slack"), 2000);
        } else {
          // Auto-connect if not connected
          handleConnectCalendar();
        }
      } catch (err) {
        setCalendarStatus({
          status: "error",
          message: "Failed to check calendar status",
        });
      }
    };

    checkCalendarStatus();
  }, [user, currentStep]);

  // Check Slack status
  useEffect(() => {
    const checkSlackStatus = async () => {
      if (!user || currentStep !== "slack") return;

      try {
        const status = await checkSlackConnectionStatus();
        console.log(status);
        if (status.connected) {
          setSlackStatus({
            status: "success",
            message: status.message,
          });
          // Move to complete step after a short delay
          setTimeout(() => setCurrentStep("complete"), 2000);
        }
        if (status.status === "user-input-required") {
          setSlackStatus({
            status: "user-input-required",
            message: status.message,
          });
        }
      } catch (err) {
        setSlackStatus({
          status: "error",
          message: "Failed to check Slack status",
        });
      }
    };

    checkSlackStatus();
  }, [user, currentStep]);

  const handleConnectCalendar = async () => {
    if (!user) {
      setError("Please sign in to continue");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const result = await onboardUserCalendar();

      if (result.success && result.watchDetails) {
        setCalendarStatus({
          status: "success",
          message: result.message,
          expiresAt: result.watchDetails.expiration,
        });
        // Move to Slack step after a short delay
        setTimeout(() => setCurrentStep("slack"), 2000);
      } else {
        setCalendarStatus({
          status: "error",
          message: result.error || "Failed to connect calendar",
        });
      }
    } catch (err) {
      setCalendarStatus({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to connect calendar",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectSlack = async () => {
    if (!user) {
      setError("Please sign in to continue");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Check if already connected
      const status = await checkSlackConnectionStatus();
      if (status.connected) {
        setSlackStatus({
          status: "success",
          message: status.message,
        });
        setTimeout(() => setCurrentStep("complete"), 2000);
        return;
      }

      // Initiate Slack OAuth flow
      const slackAuthUrl = await createSlackOAuthUrl();
      window.open(slackAuthUrl, "_blank");

      // Note: The actual connection will be handled by the OAuth callback
      // We'll check the status periodically
      const checkInterval = setInterval(async () => {
        const newStatus = await checkSlackConnectionStatus();
        if (newStatus.connected) {
          clearInterval(checkInterval);
          setSlackStatus({
            status: "success",
            message: newStatus.message,
          });
          setTimeout(() => setCurrentStep("complete"), 2000);
        }
      }, 2000); // Check every 2 seconds

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => clearInterval(checkInterval), 5 * 60 * 1000);
    } catch (err) {
      setSlackStatus({
        status: "error",
        message: "Failed to initiate Slack connection",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  console.log(slackStatus);

  const handleComplete = async () => {
    try {
      const result = await updateUserOnboardingStatus(true);
      if (result.success) {
        // Refresh the session to get updated metadata
        await session?.reload();
        router.push("/app");
      } else {
        setError("Failed to complete onboarding. Please try again.");
      }
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
    }
  };

  const renderCalendarStep = () => (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/20"
      >
        <Calendar className="h-12 w-12 text-blue-500" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-3 text-3xl font-bold md:text-4xl"
      >
        Connect Your Calendar
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 max-w-md text-gray-400"
      >
        We'll help you stay on top of your design reviews and kick-off meetings
        by connecting to your Google Calendar.
      </motion.p>

      <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          {calendarStatus.status === "loading" || isConnecting ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-lg font-medium text-gray-400">
                {isConnecting
                  ? "Connecting to your Google Calendar..."
                  : "Checking calendar status..."}
              </p>
            </div>
          ) : calendarStatus.status === "success" ? (
            <div className="text-green-500 text-lg font-semibold">
              <p>✓ {calendarStatus.message}</p>
              {calendarStatus.expiresAt && (
                <p className="text-sm text-gray-400 mt-2">
                  Connection expires:{" "}
                  {new Date(calendarStatus.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="text-red-500 text-lg font-semibold">
              <p>
                ✗{" "}
                {calendarStatus.message || "Failed to connect Google Calendar"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Please ensure you're signed in to Google and grant permissions.
              </p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleConnectCalendar}
                className="mt-4 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-all hover:bg-blue-600"
              >
                Try Again
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );

  const renderSlackStep = () => (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-500/20"
      >
        <Slack className="h-12 w-12 text-purple-500" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-3 text-3xl font-bold md:text-4xl"
      >
        Connect Your Slack
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 max-w-md text-gray-400"
      >
        Connect your Slack workspace to receive notifications and updates about
        your design reviews.
      </motion.p>

      <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          {slackStatus.status === "loading" || isConnecting ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <p className="text-lg font-medium text-gray-400">
                {isConnecting
                  ? "Connecting to Slack..."
                  : "Checking Slack status..."}
              </p>
            </div>
          ) : slackStatus.status === "success" ? (
            <div className="text-green-500 text-lg font-semibold">
              <p>✓ {slackStatus.message}</p>
            </div>
          ) : slackStatus.status === "user-input-required" ? (
            <div className="text-lg font-semibold">
              <p>{slackStatus.message || "Failed to connect Slack"}</p>
              <p className="text-sm text-gray-400 mt-2">
                Please ensure you're signed in to Slack and grant permissions to
                the correct workspace.
              </p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleConnectSlack}
                className="mt-4 rounded-lg bg-purple-500 px-6 py-3 font-medium text-white transition-all hover:bg-purple-600"
              >
                Connect Slack Workspace
              </motion.button>
            </div>
          ) : (
            <div className="text-red-500 text-lg font-semibold">
              <p>✗ {slackStatus.message || "Failed to connect Slack"}</p>
              <p className="text-sm text-gray-400 mt-2">
                Please ensure you're signed in to Slack and grant permissions.
              </p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleConnectSlack}
                className="mt-4 rounded-lg bg-purple-500 px-6 py-3 font-medium text-white transition-all hover:bg-purple-600"
              >
                Connect Slack Workspace
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );

  const renderCompleteStep = () => (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl"
        >
          ✓
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-3 text-3xl font-bold md:text-4xl"
      >
        All Set!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 max-w-md text-gray-400"
      >
        Your calendar and Slack workspace are connected. You're ready to start
        using Turbo Design.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleComplete}
        className="rounded-lg bg-green-500 px-6 py-3 font-medium text-white transition-all hover:bg-green-600"
      >
        Go to Dashboard
      </motion.button>
    </>
  );

  return (
    <div className="flex h-screen flex-1 flex-col items-center justify-center bg-[#121212] px-4 py-12 text-center text-white md:px-6">
      {currentStep === "calendar" && renderCalendarStep()}
      {currentStep === "slack" && renderSlackStep()}
      {currentStep === "complete" && renderCompleteStep()}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-sm text-gray-500"
      >
        Need help? Contact{" "}
        <a href="mailto:shane@turbodesign.co" className="text-white underline">
          shane@turbodesign.co
        </a>
      </motion.p>
    </div>
  );
}
