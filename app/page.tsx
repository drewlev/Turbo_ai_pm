// import { LayoutGrid, List, ChevronDown } from "lucide-react";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Button } from "@/components/ui/button";
// import { TaskTable } from "@/components/table";
// import { KanbanBoard } from "@/components/kanban-board";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

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
  redirect("/app");
}
