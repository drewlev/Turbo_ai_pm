"use server"

import type { OnboardingQuestion, SubmitAnswersPayload } from "./types"

// Mock data for demonstration
const mockQuestions: OnboardingQuestion[] = [
  {
    id: 1,
    type: "text",
    label: "What's your name?",
    placeholder: "John Doe",
    required: true,
  },
  {
    id: 2,
    type: "email",
    label: "What's your email address?",
    placeholder: "john@example.com",
    required: true,
  },
  {
    id: 3,
    type: "text",
    label: "What's your role?",
    placeholder: "Software Engineer",
    required: true,
  },
  {
    id: 4,
    type: "url",
    label: "What's your website?",
    placeholder: "https://example.com",
    required: false,
  },
  {
    id: 5,
    type: "textarea",
    label: "Tell us a bit about yourself",
    placeholder: "I'm a software engineer with 5 years of experience...",
    required: false,
  },
]

export async function fetchQuestions(slug: string): Promise<OnboardingQuestion[]> {
  // In a real implementation, you would fetch questions from your database
  // based on the provided slug

  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return mockQuestions
}

export async function submitAnswers(payload: SubmitAnswersPayload): Promise<void> {
  // In a real implementation, you would save the answers to your database

  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  console.log("Submitted answers:", payload)

  // Return success (or you could return an ID or other data)
  return
}
