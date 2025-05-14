export interface OnboardingQuestion {
  id: number
  type: "text" | "email" | "url" | "textarea"
  label: string
  placeholder?: string
  required: boolean
}

export interface OnboardingAnswer {
  questionId: number
  answer: string
}

export interface SubmitAnswersPayload {
  slug: string
  answers: OnboardingAnswer[]
}
