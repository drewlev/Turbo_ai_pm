"use server";

import { getTaskById, getAvailableAssignees } from "@/app/actions/tasks";
import { getActiveProjects } from "@/app/actions/projects";
import { TaskForm } from "./task-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskPage({ params }: PageProps) {
  const resolvedParams = await params;
  const isNewTask = resolvedParams.id === "new";
  const task = isNewTask
    ? null
    : await getTaskById(parseInt(resolvedParams.id));
  const projects = await getActiveProjects();
  const availableAssignees = await getAvailableAssignees();

  if (!isNewTask && !task) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
        </div>
      </div>
    );
  }

  const formattedProjects = projects.map((project) => ({
    title: project.name,
    url: `/app/projects/${project.id}`,
    id: project.id,
  }));

  const assigneeOptions = availableAssignees
    .filter(
      (user): user is typeof user & { name: string } => user.name !== null
    )
    .map((user) => ({
      value: user.id.toString(),
      label: user.name,
    }));

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {isNewTask ? "Create Task" : "Edit Task"}
          </h1>
          <div className="h-px bg-[#2a2a2a]" />
        </div>

        <TaskForm
          task={task || null}
          projects={formattedProjects}
          assigneeOptions={assigneeOptions}
          isNewTask={isNewTask}
        />
      </div>
    </div>
  );
}
