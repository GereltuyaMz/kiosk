"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

const getPageTitle = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/admin") return "Dashboard";

  const lastSegment = segments[segments.length - 1];
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
};

export const Header = () => {
  const pathname = usePathname();
  const { items: customItems } = useBreadcrumb();
  const isHome = pathname === "/admin";

  const hasCustomBreadcrumb = customItems.length > 0;

  const breadcrumbItems = hasCustomBreadcrumb
    ? customItems
    : isHome
    ? []
    : [{ label: getPageTitle(pathname) }];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center bg-gray-50 px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isHome && !hasCustomBreadcrumb ? (
              <BreadcrumbPage>
                <Home className="h-4 w-4" />
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href="/admin">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {breadcrumbItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.href && index < breadcrumbItems.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className={!item.href ? "text-blue-600" : ""}>
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};
