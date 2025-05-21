"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { QuestionStep } from "./question-step";
import { SuccessScreen } from "./success-screen";
import { ProgressIndicator } from "./progress-indicator";
import {
  submitAnswer,
  updateOnboardingStatus,
} from "@/app/actions/onboarding-form";
import type { OnboardingQuestion } from "./types";

interface OnboardingFormProps {
  slug: string;
  onboardingId: number;
  questions: OnboardingQuestion[];
}

export function OnboardingForm({
  slug,
  onboardingId,
  questions: initialQuestions,
}: OnboardingFormProps) {
  const [questions] = useState(initialQuestions);
  const [currentStep, setCurrentStep] = useState(0);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  const methods = useForm({
    mode: "onSubmit",
  });

  const currentQuestion = questions[currentStep];

  // Create dynamic schema for current question
  useEffect(() => {
    if (currentQuestion) {
      const fieldName = `question_${currentQuestion.id}`;

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

      methods.register(fieldName, {
        required: currentQuestion.required,
        validate: (value) => {
          if (currentQuestion.required && !value) {
            return `${currentQuestion.label} is required`;
          }

          if (!value && !currentQuestion.required) return true;

          try {
            validationSchema.parse(value);
            return true;
          } catch (error) {
            return error instanceof z.ZodError
              ? error.errors[0].message
              : "Invalid input";
          }
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
    const fieldName = `question_${currentQuestion.id}`;
    const updatedAnswers = { ...allAnswers, [fieldName]: data[fieldName] };
    setAllAnswers(updatedAnswers);

    try {
      const success = await submitAnswer({
        onboardingId,
        questionId: currentQuestion.id,
        answer: data[fieldName],
      });

      if (!success) throw new Error("Failed to submit answer");

      await updateOnboardingStatus(
        slug,
        `completed_question_${currentStep + 1}`
      );

      if (currentStep < questions.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        await updateOnboardingStatus(slug, "completed");
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
      const updatedAnswers = { ...allAnswers, [fieldName]: value };
      setAllAnswers(updatedAnswers);
    },
    [currentQuestion, allAnswers]
  );

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
                      isSubmitting={false}
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
