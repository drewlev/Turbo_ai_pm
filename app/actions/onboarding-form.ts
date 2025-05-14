"use server";

import type {
  OnboardingQuestion,
  SubmitAnswersPayload,
} from "@/components/onboarding-form/types";
import db from "@/app/db";
import {
  onboarding,
  onboardingFormAnswers,
  onboardingQuestions,
} from "@/app/db/schema";
import type { OnboardingStatus } from "@/app/types/onboarding";
import { eq } from "drizzle-orm";

export async function getQuestionsBySlug(slug: string) {
  try {
    const onboardingForm = await db.query.onboarding.findFirst({
      where: eq(onboarding.slug, slug),
      with: {
        questions: {
          with: {
            question: true,
          },
        },
      },
    });

    if (!onboardingForm) {
      return null; // Or handle the case where the slug doesn't exist
    }

    // Extract the actual question data from the nested structure
    const questions = onboardingForm.questions.map((item) => item.question);

    return { questions, onboardingId: onboardingForm.id };
  } catch (error) {
    console.error("Error fetching questions by slug:", error);
    return null; // Or throw the error depending on your error handling strategy
  }
}

export async function submitAnswer(payload: {
  onboardingId: number;
  questionId: number;
  answer: string;
}): Promise<boolean> {
  try {
    console.log("Submitting answer:", payload);

    await db
      .insert(onboardingFormAnswers)
      .values({
        onboardingId: payload.onboardingId,
        questionId: payload.questionId,
        answer: payload.answer,
      })
      .onConflictDoUpdate({
        target: [
          onboardingFormAnswers.onboardingId,
          onboardingFormAnswers.questionId,
        ],
        set: {
          answer: payload.answer,
          updatedAt: new Date(),
        },
      });

    return true;
  } catch (error) {
    console.error("Failed to save answer:", error);
    return false;
  }
}

export async function updateOnboardingStatus(
  slug: string,
  status: OnboardingStatus
): Promise<number | undefined> {
  try {
    let onboardingRecord = await db
      .select({ id: onboarding.id })
      .from(onboarding)
      .where(eq(onboarding.slug, slug));

    if (!onboardingRecord && status === "opened") {
      // Create a new onboarding record if it doesn't exist and the status is "opened"
      const newRecord = await db
        .insert(onboarding)
        .values({ slug: slug, status: status })
        .returning({ id: onboarding.id });
      return newRecord[0].id;
    } else if (onboardingRecord) {
      await db
        .update(onboarding)
        .set({ status: status, updatedAt: new Date() })
        .where(eq(onboarding.id, onboardingRecord[0].id));
      return onboardingRecord[0].id;
    }
    return undefined; // Could not find or create the record
  } catch (error) {
    console.error("Failed to update onboarding status:", error);
    return undefined;
  }
}
