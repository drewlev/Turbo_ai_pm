"use client";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useState } from "react";
// import { onboardUserCalendar } from "@/app/actions/automations/calendar-watch-renewal";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
// import { updateUserOnboardedStatus } from "@/app/actions/users";

export default function OnboardingPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  const handleConnectCalendar = async () => {
    if (!user) {
      setError("Please sign in to continue");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // This will trigger the Google OAuth flow and set up calendar watching
    //   await onboardUserCalendar();

      // Update the user's onboarded status
    //   await updateUserOnboardedStatus(true);

      // Redirect to dashboard or next onboarding step
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect calendar"
      );
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col items-center justify-center bg-[#121212] px-4 py-12 text-center text-white md:px-6">
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

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={handleConnectCalendar}
        disabled={isConnecting}
        className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-all hover:bg-blue-600 disabled:opacity-50"
      >
        {isConnecting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Connecting...
          </div>
        ) : (
          "Connect Google Calendar"
        )}
      </motion.button>

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
