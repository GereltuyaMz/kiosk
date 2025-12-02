"use client";

import { useState, useEffect, useTransition } from "react";
import { CategoryProducts } from "@/components/kiosk/CategoryProducts";
import type { Category } from "@/lib/admin/categories/types";
import type { Product } from "@/lib/admin/products/types";

export default function KioskPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/kiosk/categories"),
        fetch(`/api/kiosk/products?categoryId=${selectedCategoryId || ""}`),
      ]);

      const categoriesData = await catRes.json();
      const productsData = await prodRes.json();

      if (categoriesData?.success) setCategories(categoriesData.data);
      if (productsData?.success) setProducts(productsData.data);
    });
  }, [selectedCategoryId]);

  return (
    <CategoryProducts
      categories={categories}
      products={products}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={setSelectedCategoryId}
      isLoading={isPending}
    />
  );
}
