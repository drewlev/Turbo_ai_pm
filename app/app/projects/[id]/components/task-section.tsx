"use server";

import { TaskWithAssigneesType } from "@/app/actions/tasks";
import { transformTasksForUI } from "@/app/types/task";
import { TaskTableClient } from "@/components/tasks/task-table-client";
import { KanbanBoard } from "@/components/kanban-board";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { List, LayoutGrid } from "lucide-react";
import { getActiveProjects } from "@/app/actions/projects";

export async function TasksSection({
  tasks,
}: {
  tasks: TaskWithAssigneesType[];
}) {
  const transformedTasks = transformTasksForUI(tasks);
  const activeProjects = await getActiveProjects();
  const projects = activeProjects.map((project) => ({
    id: project.id,
    title: project.name,
    url: project.id.toString(),
  }));

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center gap-2 justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Tasks
            </h2>
            <TabsList className="bg-[var(--background-dark)]">
              <TabsTrigger
                value="list"
                className="flex items-center gap-2 data-[state=active]:bg-gray-500"
              >
                <List className="h-4 w-4 text-white" />
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="flex items-center gap-2 data-[state=active]:bg-gray-500"
              >
                <LayoutGrid className="h-4 w-4 text-white" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list">
            <TaskTableClient
              tasks={transformedTasks}
              title="All Tasks"
              count={tasks.length}
              projects={projects}
            />
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
