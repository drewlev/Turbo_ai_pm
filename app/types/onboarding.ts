export type OnboardingStatus =
  | "opened"
  | "completed"
  | `completed_question_${number}`;
