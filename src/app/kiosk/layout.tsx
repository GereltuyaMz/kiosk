import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import "./layout.css";

export default async function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "KIOSK" && user.role !== "ADMIN" && user.role !== "STAFF") {
    redirect("/login");
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">{children}</div>
  );
}
