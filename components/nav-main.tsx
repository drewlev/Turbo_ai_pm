"use client";

import { ChevronRight, type LucideIcon, Plus } from "lucide-react";
import { useState } from "react";
import ProjectModal from "./project-dialog";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  return (
    <>
      <SidebarGroup>
        {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible" // This class is important for targeting
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="
                      hover:bg-[var(--hover)] hover:text-white
                      data-[state=open]:hover:bg-[var(--hover)] data-[state=open]:hover:text-white
                      focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
                      active:bg-[var(--hover)] active:text-white
                      tap-highlight-transparent
                    "
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent
                  className="
                    overflow-hidden transition-all duration-300 ease-in-out
                    data-[state=closed]:animate-slide-up
                    data-[state=open]:animate-slide-down
                  "
                >
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className="hover:bg-[var(--hover)] hover:text-white
                          hover:bg-[var(--hover)] hover:text-white
                          data-[state=open]:hover:bg-[var(--hover)] data-[state=open]:hover:text-white
                          focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
                          active:bg-[var(--hover)] active:text-white
                          tap-highlight-transparent"
                        >
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    {item.title === "Projects" && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          onClick={() => setIsProjectModalOpen(true)}
                          className=" flex text-white hover:bg-[var(--hover)] hover:text-white
                          hover:bg-[var(--hover)] hover:text-white
                          data-[state=open]:hover:bg-[var(--hover)] data-[state=open]:hover:text-white
                          focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent
                          active:bg-[var(--hover)] active:text-white
                          tap-highlight-transparent
                          "
                        >
                          <span className="">
                            <Plus fill="currentColor" size={16} />
                          </span>
                          <span>Create New</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <ProjectModal
        open={isProjectModalOpen}
        onOpenChange={setIsProjectModalOpen}
      />
    </>
  );
}
