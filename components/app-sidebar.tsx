"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Plus,
  Clipboard,
  Map,
  Grid3X3,
  Layers,
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

import { NavMain } from "@/components/nav-main";
import {
  Command,
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  Frame,
  PieChart,
} from "lucide-react";
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Projects",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Rally",
          url: "#",
        },
        {
          title: "Ramp",
          url: "#",
        },
        {
          title: "Jeep",
          url: "#",
        },
      ],
    },
    {
      title: "Team",
      url: "#",
      icon: Bot,
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

    //   {
    //     title: "Documentation",
    //     url: "#",
    //     icon: BookOpen,
    //     items: [
    //       {
    //         title: "Introduction",
    //         url: "#",
    //       },
    //       {
    //         title: "Get Started",
    //         url: "#",
    //       },
    //       {
    //         title: "Tutorials",
    //         url: "#",
    //       },
    //       {
    //         title: "Changelog",
    //         url: "#",
    //       },
    //     ],
    //   },
    //   {
    //     title: "Settings",
    //     url: "#",
    //     icon: Settings2,
    //     items: [
    //       {
    //         title: "General",
    //         url: "#",
    //       },
    //       {
    //         title: "Team",
    //         url: "#",
    //       },
    //       {
    //         title: "Billing",
    //         url: "#",
    //       },
    //       {
    //         title: "Limits",
    //         url: "#",
    //       },
    //     ],
    //   },
    // ],
    // projects: [
    //   {
    //     name: "Design Engineering",
    //     url: "#",
    //     icon: Frame,
    //   },
    //   {
    //     name: "Sales & Marketing",
    //     url: "#",
    //     icon: PieChart,
    //   },
    //   {
    //     name: "Travel",
    //     url: "#",
    //     icon: Map,
    //   },
  ],
};

export function AppSidebar() {
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

        <div className="px-4 py-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-[#272832] border-[#4c4f6b] text-white"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

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
