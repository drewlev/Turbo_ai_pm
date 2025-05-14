"use client";

import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingQuestion } from "./types";

interface QuestionStepProps {
  question: OnboardingQuestion;
  onNext: () => void;
  onBack: () => void;
  showBack: boolean;
  isLast: boolean;
  isSubmitting: boolean;
  showValidation: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: string
  ) => void;
}

export function QuestionStep({
  question,
  onNext,
  onBack,
  showBack,
  isLast,
  isSubmitting,
  showValidation,
  onInputChange,
}: QuestionStepProps) {
  const {
    register,
    formState: { errors, isValid },
  } = useFormContext();
  const fieldName = `question_${question.id}`;
  const error = errors[fieldName];

  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-2xl font-semibold md:text-3xl">{question.label}</h2>
      <div className="space-y-2">
        <p className="text-sm text-red-300">
          {question.required ? "Required*" : ""}
        </p>
        {question.type === "textarea" ? (
          <Textarea
            {...register(fieldName)}
            placeholder={question.placeholder || "Type your answer here..."}
            className="min-h-[120px] rounded-xl border-gray-700 bg-gray-800 p-4 text-lg focus:border-gray-600 focus:ring-gray-600"
            onChange={(e) => {
              register(fieldName).onChange(e);
              onInputChange(e, fieldName);
            }}
          />
        ) : (
          <Input
            {...register(fieldName)}
            type={question.type}
            placeholder={question.placeholder || "Type your answer here..."}
            className="h-12 rounded-xl border-gray-700 bg-gray-800 p-4 text-lg focus:border-gray-600 focus:ring-gray-600"
            onChange={(e) => {
              register(fieldName).onChange(e);
              onInputChange(e, fieldName);
            }}
          />
        )}

        {showValidation && error && (
          <p className="text-sm text-red-400">{error.message as string}</p>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        {showBack && (
          <Button
            type="button"
            onClick={onBack}
            variant="secondary"
            className="flex-1 rounded-xl py-6 text-lg"
          >
            Back
          </Button>
        )}

        <Button
          type="button"
          onClick={onNext}
          disabled={question.required && (!isValid || isSubmitting)}
          className={`flex-1 rounded-xl py-6 text-lg ${
            !showBack ? "w-full" : ""
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isLast ? (
            "Submit"
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );
}
