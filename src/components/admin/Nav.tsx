"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { navigationItems, isActiveRoute } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

export const Nav = () => {
  const pathname = usePathname();

  return (
    <SidebarMenu className="px-3 py-4">
      {navigationItems.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);
        const Icon = item.icon;

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-blue-500" : "text-gray-500"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};
