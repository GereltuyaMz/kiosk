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

const getPageTitle = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/admin") return "Dashboard";

  const lastSegment = segments[segments.length - 1];
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
};

export const Header = () => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const isHome = pathname === "/admin";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center  bg-gray-50 px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {isHome ? (
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
          {!isHome && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-blue-600">
                  {pageTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};
