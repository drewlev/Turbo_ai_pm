"use server";

import { getTaskById, getAvailableAssignees } from "@/app/actions/tasks";
import { getActiveProjects } from "@/app/actions/projects";
import { TaskForm } from "./task-form";
import { DeliverablesFeed } from "@/components/deliverables-feed";
import { getTeamId } from "@/app/actions/users";
import { getUserContext } from "@/app/actions/users";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// ===== Page =====
export default async function TaskPage({ params }: PageProps) {
  const resolvedParams = await params;
  const isNewTask = resolvedParams.id === "new";
  const task = isNewTask
    ? null
    : await getTaskById(parseInt(resolvedParams.id));
  const { userId, role } = await getUserContext();
  const projects = await getActiveProjects(userId, role);
  const teamId = await getTeamId();
  if (!teamId) {
    throw new Error("Team ID not found");
  }
  const availableAssignees = await getAvailableAssignees(teamId);

  if (!isNewTask && !task) {
    return (
      <div className="min-h-screen bg-[var(--background-dark)] text-white p-8">
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

  console.log("assigneeOptions", assigneeOptions);

  return (
    <div className="min-h-screen bg-[var(--background-dark)] text-white p-8">
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
      <div className="w-1/2 mx-auto mt-10">
        <DeliverablesFeed gridCols={1} tasks={task ? [task] : []} />
      </div>
    </div>
  );
}
