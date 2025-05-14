"use client"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

export function AlreadyCompletedScreen() {
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
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20"
      >
        <CheckCircle className="h-12 w-12 text-green-500" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-3 text-3xl font-bold md:text-4xl"
      >
        Form Complete
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-md text-gray-400"
      >
        This form has been completed. If you have anything you’d like to change or update, please email us at{" "}
        <a href="mailto:shane@turbodesign.co" className="text-white underline">
          shane@turbodesign.co
        </a>.
      </motion.p>
    </div>
  )
}
