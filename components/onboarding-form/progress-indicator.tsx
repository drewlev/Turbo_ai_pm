"use client"

import { motion } from "framer-motion"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="mb-8 space-y-2">
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-800">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-sm text-gray-400">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  )
}
