"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import type { OnboardingQuestion } from "./types"

interface SuccessScreenProps {
  answers: Record<string, string>
  questions: OnboardingQuestion[]
}

export function SuccessScreen({ answers, questions }: SuccessScreenProps) {
  // Map answers to questions for display
  const formattedAnswers = questions.map((question) => {
    const fieldName = `question_${question.id}`
    return {
      question: question.label,
      answer: answers[fieldName] || "Not provided",
    }
  })

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center md:px-6">
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
        Thank you!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8 max-w-md text-gray-400"
      >
        Your responses have been submitted successfully. We'll be in touch soon.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md rounded-xl bg-gray-800/50 p-6"
      >
        <h3 className="mb-4 text-xl font-medium">Your Responses</h3>
        <div className="space-y-4">
          {formattedAnswers.map((item, index) => (
            <div key={index} className="border-t border-gray-700 pt-3">
              <p className="text-sm font-medium text-gray-400">{item.question}</p>
              <p className="mt-1">{item.answer}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
