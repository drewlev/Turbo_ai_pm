"use server";
import Link from "next/link";
import NewTask from "@/components/tasks/new-task";
import { Settings } from "lucide-react";
import { commonStyles } from "@/styles/common";
import Image from "next/image";
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
import { getUserContext, getUsers } from "@/app/actions/users";
import { ClientSidebarMenu } from "./client-sidebar";

export async function AppSidebar() {
  const userContext = await getUserContext();
  const projects = await getActiveProjects(
    userContext.userId,
    userContext.role
  );
  const listProjects = (projects || []).map((project) => ({
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

  const navData = {
    owner: {
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
      allowCreateProject: true,
    },
    designer: {
      navMain: [
        {
          title: "Projects",
          url: "#",
          items: listProjects,
        },
      ],
      allowCreateProject: false,
    },
  };

  const data =
    navData[userContext.role as keyof typeof navData] || navData.designer;

  return (
    <Sidebar className={commonStyles.sidebar.container} key={Date.now()}>
      <SidebarHeader className={commonStyles.sidebar.header}>
        <div className="p-4 flex items-center justify-between">
          <img
            src="https://n1v74cls2c.ufs.sh/f/XAC5NGVjIxRTYhUMGHSw8eLErn3Wl7d4y1oRp0IUNQMJtGT5"
            alt="Turbo"
            width="100"
            height="100"
          />
          <UserButton />
        </div>

        <NewTask />
        <ClientSidebarMenu />
      </SidebarHeader>

      <SidebarContent className={commonStyles.sidebar.content}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavMain items={data.navMain} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={commonStyles.sidebar.footer}>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/app/settings"
              className="flex items-center gap-2 pointer-cursor"
            >
              <SidebarMenuButton className={commonStyles.nav.button}>
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
