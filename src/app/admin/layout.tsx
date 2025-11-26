import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col bg-gray-50 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
