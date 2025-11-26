export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage your menu items and pricing
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Product management will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}
