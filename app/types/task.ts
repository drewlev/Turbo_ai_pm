import { TaskWithAssigneesType } from "@/app/actions/tasks";

export type UITask = {
  id: string;
  title: string;
  date?: string;
  status: string;
  assignedTo?: {
    label: string;
    url: string;
    id: number;
  }[];
};

export function transformTaskForUI(task: TaskWithAssigneesType): UITask {
  return {
    id: task.id.toString(),
    title: task.title,
    date: task.dueDate?.toISOString(),
    status: task.status,
    assignedTo: task.taskAssignees
      .map((ta) => ({
        label: ta.user.name || "",
        url: ta.user.id.toString(),
        id: ta.user.id,
      }))
      .filter((a) => a.label !== ""),
  };
}

export function transformTasksForUI(tasks: TaskWithAssigneesType[]): UITask[] {
  return tasks.map(transformTaskForUI);
}
