import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Folder,
  Package,
  ShoppingBag,
  Settings,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Folder,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const isActiveRoute = (pathname: string, href: string): boolean => {
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};
