"use client";

import { useState, useEffect, useRef } from "react"; // Import useRef
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { saveTrackingKeywords } from "@/app/actions/settings/calendar-event-tracking";

interface MeetingKeywordsSettingsProps {
  initialKeywords: string[];
}

export default function MeetingKeywordsSettings({
  initialKeywords,
}: MeetingKeywordsSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  // Removed error and success state, as toast handles visual feedback
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [newKeyword, setNewKeyword] = useState("");

  const isInitialMount = useRef(true); // Ref to track the initial render

  useEffect(() => {
    // On the very first render, set the ref to false and return early.
    // This prevents handleSaveKeywords from being called on initial mount.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Call handleSaveKeywords only when the 'keywords' state actually changes
    // after the initial mount.
    handleSaveKeywords();
  }, [keywords]); // Dependency array: run effect when 'keywords' changes

  const handleSaveKeywords = async () => {
    setIsLoading(true);
    // Removed clearing error/success state as toast manages this

    try {
      await saveTrackingKeywords(keywords);
      toast.success("Keywords saved successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save tracking keywords.";
      toast.error(errorMessage);
      console.error("Save tracking keywords error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = () => {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword !== "" && !keywords.includes(trimmedKeyword)) {
      setKeywords([...keywords, trimmedKeyword]);
      setNewKeyword("");
    } else if (keywords.includes(trimmedKeyword)) {
      toast.error("Keyword already exists.");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
  };

  return (
    <div className="border border-[var(--border-dark)] rounded-lg p-4 bg-[var(--background-light)]">
      <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
        Meeting Title Tracking
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Define keywords in meeting titles to trigger AI analysis and task
        creation.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="newKeyword" className="text-[var(--text-primary)]">
            Add New Keyword
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="newKeyword"
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="e.g., Design Review, Sprint Planning"
              className="bg-[var(--input-dark)] border-[var(--border-dark)] text-[var(--text-primary)]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
            />
            <Button
              onClick={handleAddKeyword}
              className="bg-[var(--turbo-blue)] hover:bg-[var(--turbo-blue)]/90 text-[var(--text-primary)]"
              aria-label="Add keyword"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-[var(--text-primary)]">
            Current Tracking Keywords
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {keywords.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">
                No keywords added yet.
              </p>
            ) : (
              keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center bg-[#2a2a2a] text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-2 text-gray-400 hover:text-red-400 focus:outline-none"
                    aria-label={`Remove ${keyword}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
