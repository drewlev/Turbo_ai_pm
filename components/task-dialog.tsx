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
import { createTask, createTaskAndAssign } from "@/app/actions/tasks";
import { toast } from "sonner";
import { StackedInitials } from "@/components/stacked-avatars";

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
import { z } from "zod";

type Assignee = {
  label: string;
  url: string;
  id: number;
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

const PriorityButton = ({
  priority,
  onValueChange,
}: {
  priority: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <Combobox
      options={priorityOptions}
      value={priority}
      onValueChange={(value) => onValueChange(value as string)}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
        >
          {priority ? (
            <>
              {priorityOptions.find((opt) => opt.value === priority)?.icon}
              <span>
                {priorityOptions.find((opt) => opt.value === priority)?.label}
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
  );
};

const AssigneeButton = ({
  assigneeValue,
  assigneeOptions,
  onValueChange,
}: {
  assigneeValue: { url: string; id: number }[];
  assigneeOptions: Option[];
  onValueChange: (value: string[]) => void;
}) => {
  return (
    <Combobox
      options={assigneeOptions}
      value={assigneeValue.map((a) => a.id.toString())}
      multiSelect={true}
      onValueChange={(value) => {
        const selectedIds = value as string[];
        const selectedAssignees = selectedIds
          .map((id) => {
            const option = assigneeOptions.find((opt) => opt.value === id);
            return option ? { url: id, id: parseInt(id) } : null;
          })
          .filter((a): a is { url: string; id: number } => a !== null);
        onValueChange(selectedIds);
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
                      (opt) => opt.value === assigneeValue[0].id.toString()
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
  );
};

const ProjectButton = ({
  project,
  projectOptions,
  onValueChange,
}: {
  project: { url: string; id: number } | null;
  projectOptions: Option[];
  onValueChange: (value: string) => void;
}) => {
  return (
    <Combobox
      options={projectOptions}
      value={project?.id.toString() || ""}
      onValueChange={(value) => {
        const option = projectOptions.find(
          (opt) => opt.value === (value as string)
        );
        onValueChange(value as string);
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
  );
};

const TaskForm = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}) => {
  return (
    <div className="p-4 space-y-4">
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Task title"
        className="border-none bg-transparent text-lg font-medium placeholder:text-gray-500 focus-visible:ring-0 p-0"
      />
      <Textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Add description..."
        className="border-none bg-transparent resize-none min-h-[100px] placeholder:text-gray-500 focus-visible:ring-0 p-0"
      />
    </div>
  );
};

const TaskActions = ({
  onCreateTask,
  title,
  description,
  priority,
  project,
  assigneeValue,
}: {
  onCreateTask: () => void;
  title: string;
  description: string;
  priority: string;
  project: { url: string; id: number } | null;
  assigneeValue: { url: string; id: number }[];
}) => {
  return (
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
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onCreateTask}
        >
          Create Task
        </Button>
      </div>
    </div>
  );
};

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  projectId: z.number().min(1, "Project is required"),
  assigneeIds: z.array(z.number()).min(1, "At least one assignee is required"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

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

  const handleCreateTask = () => {
    try {
      const formData: TaskFormData = {
        title,
        description,
        priority,
        projectId: project?.id || 0,
        assigneeIds: assigneeValue.map((a) => a.id),
      };

      const validatedData = taskFormSchema.parse(formData);

      createTaskAndAssign({
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        projectId: validatedData.projectId,
        assigneeID: validatedData.assigneeIds,
      });

      toast.success("Task created successfully!");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join("\n");
        toast.error(errorMessages);
      } else {
        toast.error("Failed to create task");
      }
    }
  };

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
            <DialogClose asChild>
              <button className="p-1 rounded hover:bg-[#2a2a2a]">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </DialogClose>
          </div>
        </div>

        <TaskForm
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />

        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex flex-wrap gap-2 mb-4">
            <PriorityButton priority={priority} onValueChange={setPriority} />
            <AssigneeButton
              assigneeValue={assigneeValue}
              assigneeOptions={assigneeOptions}
              onValueChange={(value) => {
                const selectedIds = value;
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
            />
            <ProjectButton
              project={project}
              projectOptions={projectOptions}
              onValueChange={(value) => {
                const option = projectOptions.find(
                  (opt) => opt.value === value
                );
                setProject(option ? { url: value, id: parseInt(value) } : null);
              }}
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

          <TaskActions
            onCreateTask={handleCreateTask}
            title={title}
            description={description}
            priority={priority}
            project={project}
            assigneeValue={assigneeValue}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
