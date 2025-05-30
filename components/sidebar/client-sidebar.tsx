"use client";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "../ui/sidebar";
import { Clipboard } from "lucide-react";
import { commonStyles } from "@/styles/common";
export const ClientSidebarMenu = () => {
  const router = useRouter();

  return (
    <SidebarMenu className="px-2">
      <SidebarMenuItem>
        <SidebarMenuButton
          className={commonStyles.nav.button}
          onClick={() => router.push("/app")} // Use onClick here
        >
          <Clipboard className="h-4 w-4" />
          <span>My Tasks</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        {/* <SidebarMenuButton className="text-[#d2d3e0]">
                <Map className="h-4 w-4" />
                <span>Roadmaps</span>
              </SidebarMenuButton> */}
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
