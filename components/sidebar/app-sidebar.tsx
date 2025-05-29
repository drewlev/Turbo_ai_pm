"use server";
import Link from "next/link";
import NewTask from "@/components/tasks/new-task";
import { Settings } from "lucide-react";
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
import { NavMain } from "@/components/nav-main";
import { getActiveProjects } from "@/app/actions/projects";
import { getUsers } from "@/app/actions/users";
import { ClientSidebarMenu } from "./client-sidebar";

export async function AppSidebar() {
  const projects = await getActiveProjects();
  const listProjects = projects.map((project) => ({
    title: project.name,
    url: `/app/projects/${project.id}`,
    id: project.id,
  }));

  const users = await getUsers();
  const listUsers = users.map((user) => ({
    title: user.name || user.email,
    url: `/app/users/${user.id}`,
    id: user.id,
  }));

  const data = {
    navMain: [
      {
        title: "Projects",
        url: "#",
        items: listProjects,
      },
      {
        title: "Team",
        url: "#",
        items: listUsers,
      },
    ],
  };

  return (
    <Sidebar
      className="border-r border-[#2c2d3c] text-[#d2d3e0]"
      key={Date.now()}
    >
      <SidebarHeader className="border-b border-[#2c2d3c] bg-[var(--background-dark)]">
        <div className="p-4 flex items-center justify-between">
          <h1 className="font-semibold text-white">Turbo</h1>
          <UserButton />
        </div>

        <NewTask />
        <ClientSidebarMenu />
      </SidebarHeader>

      <SidebarContent className="bg-[var(--background-dark)]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavMain items={data.navMain} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[var(--background-dark)]">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton className="text-[#d2d3e0]">
              <UserPlus className="h-4 w-4" />
              <span>Invite people</span>
            </SidebarMenuButton> */}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link
              href="/app/settings"
              className="flex items-center gap-2 pointer-cursor"
            >
              <SidebarMenuButton className="flex items-center gap-2 text-[#d2d3e0]">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
