import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import { getOrders } from "@/lib/admin/orders/actions";
import { OrdersTable } from "@/components/admin/orders";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getOrders({ dateFilter: "today" });

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <OrdersTable
        initialOrders={result.data.orders}
        initialTotalPages={result.data.totalPages}
        tenantId={user.tenant_id}
      />
    </div>
  );
}
