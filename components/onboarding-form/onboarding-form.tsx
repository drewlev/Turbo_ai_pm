"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { QuestionStep } from "./question-step";
import { SuccessScreen } from "./success-screen";
import { ProgressIndicator } from "./progress-indicator";
import {
  getQuestionsBySlug,
  submitAnswer,
} from "@/app/actions/onboarding-form";
import type { OnboardingQuestion } from "./types";

interface OnboardingFormProps {
  slug: string;
}

export function OnboardingForm({ slug }: OnboardingFormProps) {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [onboardingId, setOnboardingId] = useState<number | null>(null);
  const methods = useForm({
    mode: "onSubmit",
  });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getQuestionsBySlug(slug);
        console.log("Questions:", data);
        if (data) {
          setQuestions(
            data.questions.map((q) => ({
              ...q,
              placeholder: q.placeholder ?? undefined,
            }))
          );
          setOnboardingId(data.onboardingId);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load questions:", error);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [slug]);

  const currentQuestion = questions[currentStep];

  // Create dynamic schema for current question
  useEffect(() => {
    if (currentQuestion) {
      const fieldName = `question_${currentQuestion.id}`;
      console.log("Creating schema for question:", currentQuestion);
      console.log("Field name:", fieldName);

      let validationSchema;
      if (currentQuestion.type === "email") {
        validationSchema = currentQuestion.required
          ? z
              .string()
              .email("Please enter a valid email")
              .min(1, `${currentQuestion.label} is required`)
          : z.string().email("Please enter a valid email").optional();
      } else {
        validationSchema = currentQuestion.required
          ? z.string().min(1, `${currentQuestion.label} is required`)
          : z.string().optional();
      }
      console.log("Created schema:", validationSchema);

      // Register the field with validation
      methods.register(fieldName, {
        required: currentQuestion.required,
        validate: (value) => {
          // For required fields, only check if empty
          if (currentQuestion.required && !value) {
            return `${currentQuestion.label} is required`;
          }

          // If field is empty and not required, allow it
          if (!value && !currentQuestion.required) {
            return true;
          }

          // Only validate format if there's a value
          if (value) {
            try {
              validationSchema.parse(value);
              return true;
            } catch (error) {
              return error instanceof z.ZodError
                ? error.errors[0].message
                : "Invalid input";
            }
          }

          return true;
        },
      });

      methods.clearErrors();
      methods.reset({ [fieldName]: allAnswers[fieldName] || "" });
      methods.setFocus(fieldName);
      setShowValidation(false);
    }
  }, [currentQuestion, methods, allAnswers]);

  const handleNext = methods.handleSubmit(async (data) => {
    setShowValidation(true);
    console.log("Form submission attempt - Current data:", data);
    console.log("Form validation state:", methods.formState);
    console.log("Current question:", currentQuestion);

    // Save current answer
    const fieldName = `question_${currentQuestion.id}`;
    const updatedAnswers = { ...allAnswers, [fieldName]: data[fieldName] };
    console.log("Updated answers:", updatedAnswers);
    setAllAnswers(updatedAnswers);

    // Save to database
    if (onboardingId == null) {
      throw new Error("Onboarding ID is missing");
    }

    try {
      const success = await submitAnswer({
        onboardingId,
        questionId: currentQuestion.id,
        answer: data[fieldName],
      });

      if (!success) throw new Error("Failed to submit answer");

      if (currentStep < questions.length - 1) {
        // Move to next question
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsComplete(true);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  });

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleInputChange = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setShowValidation(false);

      const value = event.target.value;
      const fieldName = `question_${currentQuestion.id}`;

      // Only update local state
      const updatedAnswers = { ...allAnswers, [fieldName]: value };
      setAllAnswers(updatedAnswers);
    },
    [currentQuestion, allAnswers]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121212] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen flex-col bg-[#121212] text-white">
        {!isComplete ? (
          <div className="flex flex-1 flex-col px-4 py-8 md:px-6">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={questions.length}
            />

            <div className="relative flex flex-1 items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-md"
                >
                  {currentQuestion && (
                    <QuestionStep
                      question={currentQuestion}
                      onNext={handleNext}
                      onBack={handleBack}
                      showBack={currentStep > 0}
                      isLast={currentStep === questions.length - 1}
                      isSubmitting={isSubmitting}
                      showValidation={showValidation}
                      onInputChange={handleInputChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <SuccessScreen answers={allAnswers} questions={questions} />
        )}
      </div>
    </FormProvider>
  );
}
