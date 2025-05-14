"use server";

import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TaskTableClient } from "@/components/tasks/task-table-client";
import { KanbanBoard } from "@/components/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTasks } from "@/app/actions/tasks";
import { transformTasksForUI } from "@/app/types/task";
import { getActiveProjects } from "@/app/actions/projects";

export default async function TaskManagementApp() {
  const tasks = await getTasks();
  const transformedTasks = transformTasksForUI(tasks);
  const activeProjects = await getActiveProjects();
  const projects = activeProjects.map((project) => ({
    id: project.id,
    title: project.name,
    url: project.id.toString(),
  }));

  return (
    <Tabs defaultValue="table" className="w-full gap-0">
      <header className="h-14 border-b border-[var(--border-dark)] flex items-center px-4 justify-between">
        {/* <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-2 text-[var(--text-secondary)]" />
          <Button
            variant="outline"
            className="h-8 px-3 text-sm bg-[var(--background-dark)] border-[var(--border-dark)] text-[var(--text-secondary)]"
          >
            <span className="mr-2">Sorted by Last published</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 px-3 text-sm bg-[var(--background-dark)] border-[var(--border-dark)] text-[var(--text-secondary)]"
          >
            <span className="mr-2">Filter</span>
          </Button>
        </div> */}
        <TabsList className="bg-[var(--background-dark)]">
          <TabsTrigger
            value="table"
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
      </header>

      <main className="flex h-[calc(100vh-3.5rem)] p-4 overflow-auto bg-[var(--background-dark)]">
        <TabsContent value="table">
          <TaskTableClient
            tasks={transformedTasks}
            title="Todo"
            count={tasks.length}
            projects={projects}
          />
        </TabsContent>
        <TabsContent value="kanban">
          <KanbanBoard />
        </TabsContent>
      </main>
    </Tabs>
  );
}
