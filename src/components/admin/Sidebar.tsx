"use client";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Nav } from "./Nav";
import { UserNav } from "./UserNav";

export const Sidebar = () => {
  return (
    <ShadcnSidebar variant="sidebar">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <span className="text-lg font-bold text-white">K</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Kiosk Admin</span>
            <span className="text-xs text-muted-foreground">
              Restaurant POS
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <Nav />
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <UserNav />
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
