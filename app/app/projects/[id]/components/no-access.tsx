"use client";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
export function NoAccess() {
  const errorMessage = "You do not have permission to view this project.";
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20"
      >
        <Lock className="h-12 w-12 text-red-500" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-3 text-3xl font-bold md:text-4xl"
      >
        Access Denied
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 max-w-md text-red-400"
      >
        {errorMessage ||
          "You do not have permission to view this project."}
      </motion.p>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push("/app")}
        className="rounded-lg bg-red-500 px-6 py-3 font-medium text-white transition-all hover:bg-red-600"
      >
        Back to dashboard
      </motion.button>
    </div>
  );
}