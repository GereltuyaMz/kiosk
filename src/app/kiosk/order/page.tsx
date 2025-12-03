"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KioskMainLayout } from "@/components/kiosk/layout/MainLayout";
import type { Category } from "@/lib/admin/categories/types";
import type { Product } from "@/lib/admin/products/types";

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderType = searchParams.get("type") as "eatIn" | "takeOut" | null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/kiosk/categories"),
          fetch("/api/kiosk/products"),
        ]);

        const categoriesData = await catRes.json();
        const productsData = await prodRes.json();

        if (categoriesData?.success) {
          setCategories(categoriesData.data);
        }

        if (productsData?.success) {
          setAllProducts(productsData.data);
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOrderSuccess = (orderNumber: string) => {
    router.push(`/kiosk/success?orderNumber=${orderNumber}`);
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="text-2xl font-bold text-neutral-600">Loading...</p>
      </div>
    );
  }

  return (
    <KioskMainLayout
      orderType={orderType}
      categories={categories}
      products={allProducts}
      onOrderSuccess={handleOrderSuccess}
    />
  );
}
