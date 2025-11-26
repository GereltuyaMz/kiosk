import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import { getCategories } from "@/lib/admin/categories/actions";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";

export default async function CategoriesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getCategories();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your menu categories and organization
          </p>
        </div>
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error</h3>
            <p className="text-sm text-muted-foreground">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategoriesTable categories={result.data} />
    </div>
  );
}
