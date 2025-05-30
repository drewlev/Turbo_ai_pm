"use client";

import { StatusButton } from "@/components/tasks/status-button";
import { PriorityButton } from "@/components/tasks/components/priority-button";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateTask, createTaskAndAssign } from "@/app/actions/tasks";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { Combobox, Option } from "@/components/combobox";
import { AddLoom } from "@/components/tasks/components/add-loom";
import { z } from "zod";
import { TaskWithAssigneesType } from "@/app/actions/tasks";
import { AssigneeButton } from "@/components/assign-users-button";
import { useRouter } from "next/navigation";

const DateButton = ({
  date,
  onValueChange,
}: {
  date: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <DatePicker
      date={date ? new Date(date) : new Date()}
      onValueChange={(d: Date) => onValueChange(d.toISOString())}
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

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.string().min(1, "Priority is required"),
  projectId: z.number().min(1, "Project is required"),
  assigneeIds: z.array(z.number()).min(1, "At least one assignee is required"),
});

interface TaskFormProps {
  task: TaskWithAssigneesType | null;
  projects: { title: string; url: string; id: number }[];
  assigneeOptions: Option[];
  isNewTask: boolean;
}

export function TaskForm({
  task,
  projects,
  assigneeOptions,
  isNewTask,
}: TaskFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "TODO",
    priority: task?.priority || "",
    project: task?.projectId
      ? {
          url: task.projectId.toString(),
          id: task.projectId,
        }
      : null,
    assignees:
      task?.taskAssignees.map((ta) => ({
        url: ta.user.id.toString(),
        id: ta.user.id,
      })) || [],
    date: task?.dueDate?.toISOString() || "",
  });

  const projectOptions: Option[] = projects.map((project) => ({
    value: project.id.toString(),
    label: project.title,
  }));

  const handleSaveTask = async () => {
    try {
      const validatedData = taskFormSchema.parse({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        projectId: formData.project?.id || 0,
        assigneeIds: formData.assignees.map((a) => a.id),
      });

      const dueDate = formData.date ? new Date(formData.date) : undefined;

      if (isNewTask) {
        const result = await createTaskAndAssign({
          ...validatedData,
          dueDate,
          assigneeID: validatedData.assigneeIds,
        });

        if (result.success) {
          toast.success("Task created successfully!");
          router.push("/app");
        }
      } else if (task) {
        const result = await updateTask(task.id, {
          ...validatedData,
          dueDate,
          assigneeID: validatedData.assigneeIds,
        });

        if (result) {
          toast.success("Task updated successfully!");
          router.push("/app");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(`Failed to ${isNewTask ? "create" : "update"} task`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Task title"
          className="border-none bg-transparent text-2xl font-bold placeholder:text-gray-500 focus-visible:ring-0 p-0"
        />
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          placeholder="Add description..."
          className="border-none bg-transparent resize-none min-h-[100px] placeholder:text-gray-500 focus-visible:ring-0 p-0"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <PriorityButton
          priority={formData.priority}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, priority: value }))
          }
        />
        <AssigneeButton
          assigneeValue={formData.assignees}
          assigneeOptions={assigneeOptions}
          onValueChange={(value) => {
            const selectedIds = value;
            const selectedAssignees = selectedIds
              .map((id) => {
                return { url: id, id: parseInt(id) };
              })
              .filter((a): a is { url: string; id: number } => a !== null);
            setFormData((prev) => ({
              ...prev,
              assignees: selectedAssignees,
            }));
          }}
        />
        {!isNewTask && task && (
          <StatusButton
            status={formData.status}
            taskId={task.id}
            onStatusUpdated={(taskId, newStatus) => {
              setFormData((prev) => ({
                ...prev,
                status: newStatus,
              }));
            }}
          />
        )}
        <ProjectButton
          project={formData.project}
          projectOptions={projectOptions}
          onValueChange={(value) => {
            const option = projectOptions.find((opt) => opt.value === value);
            setFormData((prev) => ({
              ...prev,
              project: option ? { url: value, id: parseInt(value) } : null,
            }));
          }}
        />
        <DateButton
          date={formData.date}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, date: value }))
          }
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-[#2a2a2a]">
        {!isNewTask && task && (
          <div className="flex items-center">
            <AddLoom
              taskId={task.id}
              loomUrl={task.looms?.[0]?.loomUrl || ""}
            />
          </div>
        )}
        <div className="flex items-center gap-4">
          {/* <Button
            variant="outline"
            onClick={() => router.push("/app/tasks")}
            className="border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
          >
            Cancel
          </Button> */}
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveTask}
          >
            {isNewTask ? "Create Task" : "Update Task"}
          </Button>
        </div>
      </div>
    </div>
  );
}
