export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Order management will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}
