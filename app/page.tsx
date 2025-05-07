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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <Tabs defaultValue="table" className="w-full">
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
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </header>

          <main className="flex-1 p-4 overflow-auto">
            <TabsContent value="table">
              <TaskTable tasks={tasks} title="Todo" count={tasks.length} />
            </TabsContent>
            <TabsContent value="kanban">
              <KanbanBoard />
            </TabsContent>
          </main>
        </Tabs>
      </SidebarInset>
    </SidebarProvider>
  );
}
