"use client";
import type React from "react";
import { Card } from "@/components/ui/card";
import { TaskWithAssigneesType } from "@/app/actions/tasks";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateLoomTranscript } from "@/app/actions/loom";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function LoomEmbed({ url }: { url: string }) {
  const videoId = url.split("/share/")[1]?.split("?")[0];

  if (!videoId) {
    return <div>Invalid Loom URL</div>;
  }

  const embedUrl = `https://www.loom.com/embed/${videoId}`;
  const iframeCode = `<iframe src="${embedUrl}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>`;

  return (
    <div
      style={{ position: "relative", width: "100%", paddingBottom: "56.25%" }}
    >
      <div dangerouslySetInnerHTML={{ __html: iframeCode }} />
    </div>
  );
}

export function DeliverablesFeed({
  tasks,
  gridCols = 2,
}: {
  tasks: TaskWithAssigneesType[];
  gridCols?: 1 | 2 | 3 | 4;
}) {
  const [selectedLoom, setSelectedLoom] = useState<{
    id: number;
    taskId: number;
    transcript: string | null;
  } | null>(null);
  const [transcripts, setTranscripts] = useState<Record<number, string>>({});

  const handleTaskClick = (
    taskId: number,
    loomId: number,
    currentTranscript: string | null
  ) => {
    setSelectedLoom({ id: loomId, taskId, transcript: currentTranscript });
    if (currentTranscript) {
      setTranscripts((prev) => ({ ...prev, [loomId]: currentTranscript }));
    }
  };

  const handleTranscriptChange = (loomId: number, value: string) => {
    setTranscripts((prev) => ({ ...prev, [loomId]: value }));
  };

  const handleSaveTranscript = async (loomId: number) => {
    try {
      const result = await updateLoomTranscript(loomId, transcripts[loomId]);
      if (result.success) {
        toast.success("Transcript saved successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error saving transcript", error);
      toast.error("Failed to save transcript");
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
        {gridCols === 1 ? "Loom Transcript" : "Recent Deliverables"}
      </h2>

      <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`}>
        {tasks.map((task) => {
          const loom = task.looms?.[0];
          if (!loom) return null;

          console.log({ loom });
          return (
            <Dialog key={task.id}>
              <DialogTrigger asChild>
                <Card
                  className="overflow-hidden bg-[var(--background-dark)] border-[var(--border-dark)] cursor-pointer"
                  onClick={() =>
                    handleTaskClick(task.id, loom.id, loom.transcript)
                  }
                >
                  <div className="aspect-video bg-[var(--border-dark)] relative">
                    <LoomEmbed url={loom.loomUrl} />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-[var(--text-primary)]">
                        {task.title}
                      </h3>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {task.dueDate?.toLocaleDateString()}
                      </span>
                    </div>
                    {loom.transcript && (
                      <div className="text-sm text-[var(--text-secondary)]">
                        <ScrollArea className="h-[100px] scrollbar-hidden">
                          {loom.transcript}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </Card>
              </DialogTrigger>
              {selectedLoom?.id === loom.id && (
                <DialogContent className="max-w-3xl bg-[var(--background-dark)] border-[var(--border-dark)] text-[var(--text-primary)]">
                  <DialogHeader>
                    <DialogTitle>Loom Transcript</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="aspect-video bg-[var(--border-dark)] relative">
                      <LoomEmbed url={loom.loomUrl} />
                    </div>
                    <div className="mt-4">
                      {/* <AddLoom
                        taskId={task.id}
                        loomUrl={loom.loomUrl}
                        onLoomAdded={(newUrl) => {
                          toast.success("Loom video updated successfully!");
                          // Optionally refresh the page or update the UI
                          window.location.reload();
                        }}
                        onLoomDeleted={() => {
                          toast.success("Loom video deleted successfully!");
                          // Optionally refresh the page or update the UI
                          window.location.reload();
                        }}
                      /> */}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Transcript</h4>
                        <Button
                          size="sm"
                          onClick={() => handleSaveTranscript(loom.id)}
                          className="flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                      </div>
                      <ScrollArea className="h-[200px] border-[var(--border-dark)] rounded-md">
                        <Textarea
                          value={transcripts[loom.id] || ""}
                          onChange={(e) =>
                            handleTranscriptChange(loom.id, e.target.value)
                          }
                          placeholder="Add or edit transcript..."
                          className="w-full h-full bg-[var(--background-darker)] text-[var(--text-primary)] border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </ScrollArea>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          );
        })}
      </div>
    </section>
  );
}
