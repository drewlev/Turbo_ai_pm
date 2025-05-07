import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TaskTable } from "@/components/table";
import { KanbanBoard } from "@/components/kanban-board";
const tasks = [
  {
    id: "task-1",
    title: "Todo",
    emoji: "👋",
    date: "12 Mar",
    assignedTo: {
      name: "User",
      avatar: "/placeholder.svg?height=24&width=24",
    },
  },
  {
    id: "task-2",
    title: "Welcome to Turbo AI PM",
    emoji: "👋",
    date: "12 Mar",
    assignedTo: {
      name: "User",
      avatar: "/placeholder.svg?height=24&width=24",
    },
  },
];

export default function TaskManagementApp() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#181921] text-[#d2d3e0]">
        <header className="h-14 border-b border-[#2c2d3c] flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2 text-[#858699]" />
            <Button
              variant="outline"
              className="h-8 px-3 text-sm bg-[#272832] border-[#4c4f6b] text-[#d2d3e0]"
            >
              <span className="mr-2">Sorted by Last published</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 px-3 text-sm bg-[#272832] border-[#4c4f6b] text-[#d2d3e0]"
            >
              <span className="mr-2">Filter</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#858699]"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#858699]"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-auto">
          <TaskTable tasks={tasks} title="Todo" count={tasks.length} />
          <KanbanBoard />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
