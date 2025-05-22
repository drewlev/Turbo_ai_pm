import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X, Trash2 } from "lucide-react";
import type { QAItem } from "@/app/types/project";

type QASectionProps = {
  qaText: string;
  setQaText: (text: string) => void;
  qaItems: QAItem[];
  editingQAItem: QAItem | null;
  setEditingQAItem: (item: QAItem | null) => void;
  onParseQA: () => void;
  onEditQAItem: (questionId: number, answer: string) => void;
  onDeleteQAItem: (questionId: number) => void;
  isParsing: boolean;
};

export function QASection({
  qaText,
  setQaText,
  qaItems,
  editingQAItem,
  setEditingQAItem,
  onParseQA,
  onEditQAItem,
  onDeleteQAItem,
  isParsing,
}: QASectionProps) {
  return (
    <Card className="bg-[var(--background-light)] border-[var(--border-dark)] p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">
            Q&A Management
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="qa-text"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              Paste Q&A Text
            </label>
            <Textarea
              id="qa-text"
              value={qaText}
              onChange={(e) => setQaText(e.target.value)}
              placeholder="Paste your Q&A text here..."
              className="min-h-[200px] bg-white/70 border-[var(--border-dark)] focus-visible:ring-blue-500"
            />
          </div>

          <Button
            onClick={onParseQA}
            disabled={!qaText.trim() || isParsing}
            className="bg-[var(--turbo-blue)] hover:bg-[var(--turbo-blue)]/90 text-[var(--text-primary)]"
          >
            {isParsing ? "Parsing..." : "Parse Q&A"}
          </Button>

          {qaItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Parsed Q&A Items ({qaItems.length})
              </h3>
              <div className="space-y-4">
                {qaItems.map((item) => (
                  <div
                    key={item.questionId}
                    className="bg-[var(--box-accent)] border border-[var(--border-dark)] rounded-lg p-4 group relative"
                  >
                    <div className="space-y-2">
                      <div className="font-medium text-[var(--text-primary)]">
                        {item.question}
                      </div>
                      {editingQAItem?.questionId === item.questionId ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingQAItem.answer}
                            onChange={(e) =>
                              setEditingQAItem({
                                ...editingQAItem,
                                answer: e.target.value,
                              })
                            }
                            className="bg-white/70 border-[var(--border-dark)] focus-visible:ring-blue-500"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-[var(--background)]"
                              onClick={() =>
                                onEditQAItem(
                                  item.questionId,
                                  editingQAItem.answer
                                )
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-[var(--background)]"
                              onClick={() => setEditingQAItem(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="text-sm text-[var(--text-secondary)]">
                            {item.answer}
                          </div>
                          <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]"
                              onClick={() => setEditingQAItem(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]"
                              onClick={() => onDeleteQAItem(item.questionId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
