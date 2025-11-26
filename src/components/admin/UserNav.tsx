"use client";

import { LogOut, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";
import { useAuth } from "@/hooks/use-auth";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export const UserNav = () => {
  const { merchantUser, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="mt-1 h-2 w-16 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  const initials = merchantUser?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="h-auto w-full justify-between p-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
              {initials}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">
                {merchantUser?.full_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {merchantUser?.role}
              </span>
            </div>
          </div>
          <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">
            {merchantUser?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
