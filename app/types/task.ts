import { TaskWithAssigneesType } from "@/app/actions/tasks";
import { ColumnDef } from "@tanstack/react-table";
import { looms } from "@/app/db/schema";

type Loom = typeof looms.$inferSelect;

export type UITask = {
  id: string;
  title: string;
  dueDate?: string;
  status: string;
  priority?: string;
  description?: string | null;
  assignedTo?: {
    label: string;
    url: string;
    id: number;
  }[];
  projectId?: number;
  loomUrl?: Loom[];
};

export function transformTasksForUI(tasks: TaskWithAssigneesType[]): UITask[] {
  return tasks.map((task) => ({
    id: task.id.toString(),
    title: task.title,
    dueDate: task.dueDate?.toISOString() || undefined,
    status: task.status,
    priority: task.priority,
    description: task.description,
    assignedTo: task.taskAssignees
      .map((ta) => ({
        label: ta.user.name || "",
        url: ta.user.id.toString(),
        id: ta.user.id,
      }))
      .filter((a) => a.label !== ""),
    projectId: task.projectId || undefined,
    loomUrl: task.looms,
  }));
}

export type TaskTableTask = UITask;

export interface TaskTableProps {
  tasks: TaskTableTask[];
  title: string;
  count: number;
  projects: {
    id: number;
    title: string;
    url: string;
  }[];
  columns?: ColumnDef<TaskTableTask>[];
}
