"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { List, LayoutGrid } from "lucide-react";
import { TaskTable } from "@/components/table";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskWithAssigneesType } from "@/app/actions/tasks";
import { transformTasksForUI } from "@/app/types/task";

export function TasksSection({ tasks }: { tasks: TaskWithAssigneesType[] }) {
  const transformedTasks = transformTasksForUI(tasks);

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
            <TaskTable
              tasks={transformedTasks}
              title="All Tasks"
              count={tasks.length}
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

function KanbanColumn({
  title,
  count,
  status,
}: {
  title: string;
  count: number;
  status: string;
}) {
  let tasks: Task[] = [];

  if (status === "todo") tasks = todoTasks;
  if (status === "in-progress") tasks = inProgressTasks;
  if (status === "done") tasks = doneTasks;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
        <Badge
          variant="outline"
          className="text-xs bg-[var(--background-dark)] text-[var(--text-secondary)] border-[var(--border-accent)]"
        >
          {count}
        </Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="p-3 shadow-sm bg-[var(--background-dark)] border-[var(--border-dark)]">
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-sm text-[var(--text-primary)]">
          {task.title}
        </div>
        <StatusDot status={task.status} />
      </div>
      <div className="flex justify-between items-center mt-2">
        <Avatar className="h-6 w-6 border border-[var(--border-dark)]">
          <AvatarImage
            src={task.assignee.avatar || "/placeholder.svg"}
            alt={task.assignee.name}
          />
          <AvatarFallback>{task.assignee.initials}</AvatarFallback>
        </Avatar>
        <Badge
          variant="outline"
          className="text-xs border-[var(--border-accent)] text-[var(--text-secondary)]"
        >
          {task.dueDate}
        </Badge>
      </div>
    </Card>
  );
}

function StatusDot({ status }: { status: string }) {
  let color = "bg-[var(--text-secondary)]";

  if (status === "todo") color = "bg-[var(--text-secondary)]";
  if (status === "in-progress") color = "bg-[var(--border-accent)]";
  if (status === "done") color = "bg-[var(--text-primary)]";

  return <div className={`w-2 h-2 rounded-full ${color}`} />;
}

// Sample data
type Task = {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  assignee: {
    name: string;
    initials: string;
    avatar: string;
  };
};

const todoTasks: Task[] = [
  {
    id: "1",
    title: "Create user flow diagrams",
    status: "todo",
    dueDate: "May 15",
    assignee: {
      name: "Alex Kim",
      initials: "AK",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "2",
    title: "Finalize color palette",
    status: "todo",
    dueDate: "May 16",
    assignee: {
      name: "Taylor Swift",
      initials: "TS",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "3",
    title: "Review competitor websites",
    status: "todo",
    dueDate: "May 18",
    assignee: {
      name: "Jordan Lee",
      initials: "JL",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
];

const inProgressTasks: Task[] = [
  {
    id: "4",
    title: "Design homepage mockup",
    status: "in-progress",
    dueDate: "May 14",
    assignee: {
      name: "Morgan Chen",
      initials: "MC",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "5",
    title: "Create mobile wireframes",
    status: "in-progress",
    dueDate: "May 17",
    assignee: {
      name: "Riley Johnson",
      initials: "RJ",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
];

const doneTasks: Task[] = [
  {
    id: "6",
    title: "Kickoff meeting",
    status: "done",
    dueDate: "May 1",
    assignee: {
      name: "Jamie Smith",
      initials: "JS",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "7",
    title: "Gather requirements",
    status: "done",
    dueDate: "May 3",
    assignee: {
      name: "Casey Wong",
      initials: "CW",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "8",
    title: "Create sitemap",
    status: "done",
    dueDate: "May 5",
    assignee: {
      name: "Alex Kim",
      initials: "AK",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "9",
    title: "Client approval of wireframes",
    status: "done",
    dueDate: "May 10",
    assignee: {
      name: "Morgan Chen",
      initials: "MC",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
];
