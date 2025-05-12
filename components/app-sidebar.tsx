"use server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NewTask from "@/components/new-task";
import {
  Clipboard,
  Map,
  UserPlus,
  HelpCircle,
  GalleryVerticalEnd,
  AudioWaveform,
} from "lucide-react";
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


const projects = await getActiveProjects();
const listProjects = projects.map((project) => ({
  title: project.name,
  url: `/app/projects/${project.id}`,
}));

console.log("listProjects", listProjects);

const data = {
  
  navMain: [
    {
      title: "Projects",
      url: "#",
      // icon: SquareTerminal,
      isActive: true,
      items: listProjects,
    },
    {
      title: "Team",
      url: "#",
      // icon: Users,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
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

        <NewTask />

        <SidebarMenu className="bg-[#181921]">
          <SidebarMenuItem>
            <SidebarMenuButton className="text-[#d2d3e0]">
              <Clipboard className="h-4 w-4" />
              <span>My Tasks</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-[#d2d3e0]">
              <Map className="h-4 w-4" />
              <span>Roadmaps</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavMain items={data.navMain} />
              </SidebarMenuItem>
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
