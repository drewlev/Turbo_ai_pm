"use server";
import { generateAIResponse } from "../ai";
import db from "@/app/db";
import {
  onboarding,
  onboardingFormQuestions,
  onboardingFormAnswers,
  onboardingQuestions,
} from "@/app/db/schema";
import type { OnboardingQuestion } from "@/components/onboarding-form/types";

type QAItem = {
  question: string;
  answer: string;
  type: OnboardingQuestion["type"];
};

type QAResponse = {
  qaItems: QAItem[];
};

type ProcessQAResult = {
  success: boolean;
  error?: string;
  data?: {
    questionsCreated: number;
    answersCreated: number;
  };
};

export async function parseQAText(rawText: string) {
  const systemPrompt = `You are an AI assistant specialized in parsing Q&A text into structured data. Your response MUST be a JSON object with a single key 'qaItems' containing an array of objects. Each object should have three keys:
  - 'question': The question text
  - 'answer': The answer text
  - 'type': The type of answer, which must be one of: 'text', 'email', 'url', or 'textarea'
  
  Rules for determining the type:
  - 'email': If the answer contains an email address
  - 'url': If the answer contains a URL or website
  - 'textarea': If the answer is longer than 100 characters or contains multiple sentences
  - 'text': For all other cases
  
  Example response format:
  {
    "qaItems": [
      {
        "question": "What is your company name?",
        "answer": "Acme Corp",
        "type": "text"
      },
      {
        "question": "What is your website?",
        "answer": "https://acmecorp.com",
        "type": "url"
      }
    ]
  }`;

  const response = await generateAIResponse<QAResponse>({
    systemPrompt,
    userPrompt: `Please parse the following Q&A text into structured data:\n\n${rawText}`,
    responseType: "qa",
  });

  return response;
}

export async function processQAAndCreateOnboarding(
  rawText: string,
  projectId: number
): Promise<ProcessQAResult> {
  try {
    // Step 1: Parse the Q&A text using AI
    const parseResult = await parseQAText(rawText);
    if (!parseResult.success || !parseResult.data) {
      return {
        success: false,
        error: parseResult.error || "Failed to parse Q&A text",
      };
    }

    // Step 2: Get or create onboarding record
    const [onboardingRecord] = await db
      .insert(onboarding)
      .values({
        projectId,
        slug: `onboarding-${projectId}-${Date.now()}`,
        status: "pending",
      })
      .returning();

    if (!onboardingRecord) {
      return {
        success: false,
        error: "Failed to create onboarding record",
      };
    }

    // Step 3: Process each Q&A item
    let questionsCreated = 0;
    let answersCreated = 0;

    for (let i = 0; i < parseResult.data.qaItems.length; i++) {
      const item = parseResult.data.qaItems[i];

      // Create or get existing question
      const [question] = await db
        .insert(onboardingFormQuestions)
        .values({
          type: item.type,
          label: item.question,
          placeholder: `Enter your ${item.type} here...`,
          required: true,
        })
        .onConflictDoUpdate({
          target: [onboardingFormQuestions.label],
          set: {
            type: item.type,
          },
        })
        .returning();

      if (!question) {
        continue;
      }
      questionsCreated++;

      // Link question to onboarding with order
      await db
        .insert(onboardingQuestions)
        .values({
          onboardingId: onboardingRecord.id,
          questionId: question.id,
          order: i + 1,
        })
        .onConflictDoUpdate({
          target: [
            onboardingQuestions.onboardingId,
            onboardingQuestions.questionId,
          ],
          set: {
            order: i + 1,
          },
        });

      // Create answer
      const [answer] = await db
        .insert(onboardingFormAnswers)
        .values({
          onboardingId: onboardingRecord.id,
          questionId: question.id,
          answer: item.answer,
        })
        .onConflictDoUpdate({
          target: [
            onboardingFormAnswers.onboardingId,
            onboardingFormAnswers.questionId,
          ],
          set: {
            answer: item.answer,
          },
        })
        .returning();

      if (answer) {
        answersCreated++;
      }
    }

    return {
      success: true,
      data: {
        questionsCreated,
        answersCreated,
      },
    };
  } catch (error) {
    console.error("Error processing Q&A:", error);
    return {
      success: false,
      error: "Failed to process Q&A",
    };
  }
}
