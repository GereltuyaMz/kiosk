import { getCurrentUser } from "@/lib/auth/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Package, Folder, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const user = await getCurrentUser();

  const stats = [
    {
      title: "Total Orders",
      value: "0",
      icon: ShoppingBag,
      description: "All time orders",
    },
    {
      title: "Products",
      value: "0",
      icon: Package,
      description: "Active menu items",
    },
    {
      title: "Categories",
      value: "0",
      icon: Folder,
      description: "Menu categories",
    },
    {
      title: "Revenue",
      value: "$0",
      icon: TrendingUp,
      description: "Total earnings",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.full_name || "Admin"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
