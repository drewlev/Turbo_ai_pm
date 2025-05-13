"use client";

import { Button } from "./ui/button";
import { useState } from "react";
import { SquarePen } from "lucide-react";
import TaskModal from "./task-dialog";

export default function NewTask({
  assignee,
  projects,
}: {
  assignee: { title: string; url: string; id: number }[];
  projects: { title: string; url: string; id: number }[];
}) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  return (
    <div className="px-4 py-2">
      <Button
        variant="outline"
        className="w-full justify-start gap-2 bg-[var(--background-dark)] border-[var(--border-accent)] text-white"
        onClick={() => setTaskModalOpen(true)}
      >
        <SquarePen className="h-4 w-4" />
        New Task
      </Button>

      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        assignee={assignee}
        projects={projects}
      />
    </div>
  );
}
