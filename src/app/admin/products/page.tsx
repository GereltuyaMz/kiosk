import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import { getProducts } from "@/lib/admin/products/actions";
import { getCategories } from "@/lib/admin/categories/actions";
import { ProductsTable } from "@/components/admin/products/ProductsTable";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [productsResult, categoriesResult] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  if (!productsResult.success) {
    return <div>Error: {productsResult.error}</div>;
  }

  if (!categoriesResult.success) {
    return <div>Error: {categoriesResult.error}</div>;
  }

  return (
    <div className="space-y-6">
      <ProductsTable
        products={productsResult.data}
        categories={categoriesResult.data}
      />
    </div>
  );
}
