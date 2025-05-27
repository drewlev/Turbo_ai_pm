"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { saveFirefliesApiKey } from "@/app/actions/fireflies";

interface FirefliesSettingsProps {
  webhookId: number;
  hasKey: boolean;
}

export default function FirefliesSettings({
  webhookId,
  hasKey,
}: FirefliesSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [firefliesApiKey, setFirefliesApiKey] = useState(
    hasKey ? "••••••••••••••••" : ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
      toast.error("Failed to copy link");
    }
  };

  const handleSaveFirefliesApiKey = async () => {
    if (!isEditing && firefliesApiKey === "••••••••••••••••") {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await saveFirefliesApiKey(firefliesApiKey);
      setSuccess("Successfully saved Fireflies API key!");
      setFirefliesApiKey("••••••••••••••••");
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save Fireflies API key"
      );
      console.error("Save Fireflies API key error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-[var(--border-dark)] rounded-lg p-4 bg-[var(--background-light)]">
      <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">
        Fireflies Integration
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Set up your Fireflies API key for meeting transcriptions
      </p>

      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="firefliesApiKey"
              className="text-[var(--text-primary)]"
            >
              Fireflies API Key
            </Label>
            <Input
              id="firefliesApiKey"
              type="password"
              value={firefliesApiKey}
              onFocus={() => {
                if (hasKey && !isEditing) {
                  setFirefliesApiKey("");
                  setIsEditing(true);
                }
              }}
              onChange={(e) => {
                setFirefliesApiKey(e.target.value);
                setIsEditing(true);
              }}
              onBlur={() => {
                if (firefliesApiKey === "" && hasKey) {
                  setFirefliesApiKey("••••••••••••••••");
                  setIsEditing(false);
                }
              }}
              placeholder="Enter your Fireflies API key"
              className="mt-1 bg-[var(--input-dark)] border-[var(--border-dark)] text-[var(--text-primary)]"
            />
          </div>
          <Button
            onClick={handleSaveFirefliesApiKey}
            disabled={isLoading}
            className="bg-[var(--turbo-blue)] hover:bg-[var(--turbo-blue)]/90 text-[var(--text-primary)]"
          >
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
        </div>

        <div>
          <h2 className="text-sm font-medium mb-2 text-[var(--text-primary)]">
            Fireflies webhook URL
          </h2>
          <div className="bg-[#2a2a2a] p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <code className="text-sm text-gray-300 break-all">
                {process.env.NEXT_PUBLIC_APP_URL}/{webhookId}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-[#3a3a3a]"
                onClick={() =>
                  copyToClipboard(process.env.NEXT_PUBLIC_APP_URL + "/uri")
                }
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
    </div>
  );
}
