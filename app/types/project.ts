import {
  projects,
  clients,
  onboarding,
  onboardingFormAnswers,
  onboardingFormQuestions,
} from "@/app/db/schema";
import { InferSelectModel } from "drizzle-orm";

// Base types from schema
export type Project = InferSelectModel<typeof projects>;
export type Client = InferSelectModel<typeof clients>;
export type Onboarding = InferSelectModel<typeof onboarding>;
export type OnboardingFormAnswer = InferSelectModel<
  typeof onboardingFormAnswers
>;
export type OnboardingFormQuestion = InferSelectModel<
  typeof onboardingFormQuestions
>;

// Transformed types for UI
export type TransformedClient = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  linkedinUrl: string | null;
  avatar: string;
};

export type ProjectInfo = {
  projectName: string;
  websiteUrl: string | null;
  description: string;
};

export type QAItem = {
  questionId: number;
  question: string;
  answer: string;
  type: "text" | "email" | "url" | "textarea";
};

// Dynamic return type for getProjectDetails
export type ProjectDetails = {
  project: Project;
  clients: TransformedClient[];
  qaItems: QAItem[];
};

export type SettingsSectionProps = {
  projectDetails: ProjectDetails;
};

export type NewClient = {
  name: string;
  email: string;
  linkedinUrl: string;
  role: string;
};
