import { useState } from "react";
import { toast } from "sonner";
import {
  processQAAndCreateOnboarding,
  parseQAText,
} from "@/app/actions/automations/project-info";
import {
  updateQAItem,
  deleteQAItem,
  getProjectDetails,
} from "@/app/actions/projects";
import type { QAItem } from "@/app/types/project";

export function useQAManagement(projectId: number, initialQaItems: QAItem[]) {
  const [qaText, setQaText] = useState("");
  const [qaItems, setQaItems] = useState<QAItem[]>(initialQaItems);
  const [isParsing, setIsParsing] = useState(false);
  const [editingQAItem, setEditingQAItem] = useState<QAItem | null>(null);

  const handleParseQA = async () => {
    if (!qaText.trim()) {
      toast.error("Please enter some Q&A text to parse");
      return;
    }

    setIsParsing(true);
    try {
      const result = await processQAAndCreateOnboarding(qaText, projectId);
      if (result.success && result.data) {
        // Update the UI with the parsed Q&A items
        const parseResult = await parseQAText(qaText);
        if (parseResult.success && parseResult.data && result.data) {
          // Fetch the latest QA items after processing
          const projectDetails = await getProjectDetails(projectId);
          if (projectDetails) {
            setQaItems(projectDetails.qaItems);
          }
          toast.success(
            `Successfully created ${result.data.questionsCreated} questions and ${result.data.answersCreated} answers`
          );
        } else {
          toast.error(parseResult.error || "Failed to parse Q&A text");
        }
      } else {
        toast.error(result.error || "Failed to process Q&A");
      }
    } catch (error) {
      toast.error("Failed to process Q&A");
    } finally {
      setIsParsing(false);
    }
  };

  const handleEditQAItem = async (questionId: number, answer: string) => {
    try {
      const result = await updateQAItem(projectId, questionId, answer);
      if (result) {
        setQaItems((prev) =>
          prev.map((item) =>
            item.questionId === questionId ? { ...item, answer } : item
          )
        );
        toast.success("Q&A item updated successfully");
        setEditingQAItem(null);
      } else {
        toast.error("Failed to update Q&A item");
      }
    } catch (error) {
      toast.error("Failed to update Q&A item");
    }
  };

  const handleDeleteQAItem = async (questionId: number) => {
    try {
      const result = await deleteQAItem(projectId, questionId);
      if (result.success) {
        // Refresh the QA items list
        const projectDetails = await getProjectDetails(projectId);
        if (projectDetails) {
          setQaItems(projectDetails.qaItems);
        }
        toast.success("Q&A item deleted successfully");
      } else {
        toast.error("Failed to delete Q&A item");
      }
    } catch (error) {
      toast.error("Failed to delete Q&A item");
    }
  };

  return {
    qaText,
    setQaText,
    qaItems,
    editingQAItem,
    setEditingQAItem,
    handleParseQA,
    handleEditQAItem,
    handleDeleteQAItem,
    isParsing,
  };
}
