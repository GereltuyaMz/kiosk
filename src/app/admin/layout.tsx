import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";

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

  return <div className="min-h-screen bg-neutral-50">{children}</div>;
}
