"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createTask } from "@/app/actions/tasks";
import {
  X,
  MoreHorizontal,
  Paperclip,
  MessageSquare,
  Users,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Combobox, Option } from "@/components/combbox";
import { cn } from "@/lib/utils";

type Assignee = {
  label: string;
  url: string;
  id: number;
};

const StackedInitials = ({ assignees }: { assignees: Assignee[] }) => {
  if (!assignees || assignees.length === 0) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // For single assignee - simple circle with initials
  if (assignees.length === 1) {
    const initials = getInitials(assignees[0].label);
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          "w-6 h-6",
          "rounded-full",
          "bg-blue-600 text-white",
          "text-xs font-semibold"
        )}
      >
        {initials}
      </div>
    );
  }

  // For multiple assignees - overlapping circles
  return (
    <div className="flex -space-x-2 rtl:space-x-reverse">
      {assignees.slice(0, 2).map((assignee, idx) => (
        <div
          key={assignee.id}
          className={cn(
            "flex items-center justify-center rounded-full text-xs font-semibold border-[1.5px] border-[#121212]",
            idx === 0 ? "bg-blue-600 text-white" : "bg-green-600 text-white",
            "w-6 h-6"
          )}
          style={{ zIndex: 10 - idx }}
        >
          {getInitials(assignee.label)}
        </div>
      ))}
      {assignees.length > 2 && (
        <div
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-white text-xs font-semibold border-[1.5px] border-[#121212]"
          style={{ zIndex: 8 }}
        >
          +{assignees.length - 2}
        </div>
      )}
    </div>
  );
};

const low = <span className="mr-1 bg-green-500 rounded-full w-2 h-2"></span>;

const medium = (
  <span className="mr-1 bg-yellow-500 rounded-full w-2 h-2"></span>
);

const high = <span className="mr-1 bg-red-500 rounded-full w-2 h-2"></span>;

const priorityOptions: Option[] = [
  { value: "high", label: "High", icon: high },
  { value: "medium", label: "Medium", icon: medium },
  { value: "low", label: "Low", icon: low },
];

export default function TaskModal({
  open,
  onOpenChange,
  assignee,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignee: { title: string; url: string; id: number }[];
  projects: { title: string; url: string; id: number }[];
}) {
  const [createMore, setCreateMore] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [project, setProject] = useState<{ url: string; id: number } | null>(
    null
  );
  const [assigneeValue, setAssigneeValue] = useState<
    { url: string; id: number }[]
  >([]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setCreateMore(false);
      setPriority("");
      setProject(null);
      setAssigneeValue([]);
    }
  }, [open]);

  const assigneeOptions: Option[] = assignee.map((user) => ({
    value: user.id.toString(),
    label: user.title,
  }));

  const projectOptions: Option[] = projects.map((project) => ({
    value: project.id.toString(),
    label: project.title,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-[#121212] text-white border-[#2a2a2a] [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Create New Task</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-sm">New Task</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-[#2a2a2a]">
              {/* <Maximize2 className="w-4 h-4 text-gray-400" /> */}
            </button>
            <DialogClose asChild>
              <button className="p-1 rounded hover:bg-[#2a2a2a]">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="border-none bg-transparent text-lg font-medium placeholder:text-gray-500 focus-visible:ring-0 p-0"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            className="border-none bg-transparent resize-none min-h-[100px] placeholder:text-gray-500 focus-visible:ring-0 p-0"
          />
        </div>

        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex flex-wrap gap-2 mb-4">
            <Combobox
              options={priorityOptions}
              value={priority}
              onValueChange={(value) => setPriority(value as string)}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                >
                  {priority ? (
                    <>
                      {
                        priorityOptions.find((opt) => opt.value === priority)
                          ?.icon
                      }
                      <span>
                        {
                          priorityOptions.find((opt) => opt.value === priority)
                            ?.label
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">···</span> Priority
                    </>
                  )}
                </Button>
              }
            />
            <Combobox
              options={assigneeOptions}
              value={assigneeValue.map((a) => a.id.toString())}
              multiSelect={true}
              onValueChange={(value) => {
                const selectedIds = value as string[];
                const selectedAssignees = selectedIds
                  .map((id) => {
                    const option = assigneeOptions.find(
                      (opt) => opt.value === id
                    );
                    return option ? { url: id, id: parseInt(id) } : null;
                  })
                  .filter((a): a is { url: string; id: number } => a !== null);
                setAssigneeValue(selectedAssignees);
              }}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                >
                  {assigneeValue.length > 0 ? (
                    <>
                      <StackedInitials
                        assignees={assigneeValue.map((id) => ({
                          label:
                            assigneeOptions.find(
                              (opt) => opt.value === id.id.toString()
                            )?.label || "",
                          url: id.url,
                          id: id.id,
                        }))}
                      />
                      <span className="ml-2">
                        {assigneeValue.length === 1
                          ? assigneeOptions.find(
                              (opt) =>
                                opt.value === assigneeValue[0].id.toString()
                            )?.label
                          : `${assigneeValue.length} assignees`}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">
                        <Users className="w-3 h-3" />
                      </span>{" "}
                      Assignee
                    </>
                  )}
                </Button>
              }
            />
            <Combobox
              options={projectOptions}
              value={project?.id.toString() || ""}
              onValueChange={(value) => {
                const option = projectOptions.find(
                  (opt) => opt.value === (value as string)
                );
                setProject(
                  option
                    ? { url: value as string, id: parseInt(value as string) }
                    : null
                );
              }}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                >
                  {project ? (
                    <>
                      {
                        projectOptions.find(
                          (opt) => opt.value === project.id.toString()
                        )?.icon
                      }
                      <span>
                        {
                          projectOptions.find(
                            (opt) => opt.value === project.id.toString()
                          )?.label
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">◯</span> Project
                    </>
                  )}
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
            >
              <MessageSquare className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-2 text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-2">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                  className="data-[state=checked]:bg-blue-600"
                />
                <label htmlFor="create-more" className="text-sm text-gray-400">
                  Create more
                </label>
              </div> */}
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() =>
                  createTask([
                    {
                      title,
                      description,
                      priority,
                      projectId: project?.id,
                      assigneeID: assigneeValue.map((a) => a.id),
                    },
                  ])
                }
              >
                Create Task
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
