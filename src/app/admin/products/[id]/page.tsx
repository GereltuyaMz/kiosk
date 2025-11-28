import { redirect } from "next/navigation";
import { getProduct } from "@/lib/admin/products/actions";
import { getCategories } from "@/lib/admin/categories/actions";
import { ProductDetailView } from "@/components/admin/products/ProductDetailView";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const [productResult, categoriesResult] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!productResult.success || !productResult.data) {
    redirect("/admin/products");
  }

  if (!categoriesResult.success) {
    redirect("/admin/products");
  }

  return (
    <ProductDetailView
      product={productResult.data}
      categories={categoriesResult.data}
    />
  );
}
