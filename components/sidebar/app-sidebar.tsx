"use server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NewTask from "@/components/new-task";
import { Clipboard, Map, UserPlus, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button"; // Import Button
import { NavMain } from "@/components/nav-main";
import { getActiveProjects } from "@/app/actions/projects";
import { getUsers } from "@/app/actions/users";
import { ClientSidebarMenu } from "./client-sidebar";

const projects = await getActiveProjects();
const listProjects = projects.map((project) => ({
  title: project.name,
  url: `/app/projects/${project.id}`,
  id: project.id,
}));

// users to view and assign tasks
const users = await getUsers();
const listUsers = users.map((user) => ({
  title: user.name || user.email,
  url: `/app/users/${user.id}`,
  id: user.id,
}));

console.log("listProjects", listProjects);

const data = {
  navMain: [
    {
      title: "Projects",
      url: "#",
      // isActive: true,
      items: listProjects,
    },
    {
      title: "Team",
      url: "#",
      // isActive: false,
      items: listUsers,
    },
  ],
};


export async function AppSidebar() {
  return (
    <Sidebar className="border-r border-[#2c2d3c] bg-[#181921] text-[#d2d3e0]">
      <SidebarHeader className="border-b border-[#2c2d3c]">
        <div className="p-4 flex items-center justify-between">
          <h1 className="font-semibold text-white">Turbo</h1>
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder.svg?height=24&width=24" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>

        <NewTask assignee={listUsers} projects={listProjects} />
        <ClientSidebarMenu />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavMain items={data.navMain} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-[#d2d3e0]">
              <UserPlus className="h-4 w-4" />
              <span>Invite people</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-[#d2d3e0]">
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
