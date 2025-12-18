"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KioskMainLayout } from "@/components/kiosk/layout/MainLayout";
import { Coffee } from "lucide-react";
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
    return <OrderLoadingSkeleton />;
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

const OrderLoadingSkeleton = () => {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[100px] top-[20%] h-[400px] w-[400px] rounded-full bg-amber-100/50 blur-[100px]" />
        <div className="absolute -right-[100px] bottom-[20%] h-[350px] w-[350px] rounded-full bg-orange-100/40 blur-[80px]" />
      </div>

      {/* Header skeleton */}
      <div className="flex h-24 items-center justify-between border-b border-amber-200/60 bg-white/80 px-12 backdrop-blur-sm">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-md"
          style={{ animation: "scale-in 0.5s ease-out forwards" }}
        >
          <Coffee className="h-9 w-9 text-white" />
        </div>
        <div className="flex gap-2 rounded-xl border border-amber-200/60 bg-white/60 p-2">
          <div className="h-12 w-24 animate-pulse rounded-lg bg-amber-100/60" />
          <div className="h-12 w-24 animate-pulse rounded-lg bg-amber-50/60" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Category sidebar skeleton */}
        <div className="flex w-[200px] flex-col gap-5 border-r border-amber-200/60 bg-white/60 p-6 backdrop-blur-sm">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200/40 bg-white/80 p-6"
              style={{
                animation: "fade-up 0.5s ease-out forwards",
                animationDelay: `${0.1 + i * 0.1}s`,
                opacity: 0,
              }}
            >
              <div
                className="h-10 w-10 rounded-xl bg-amber-100/80"
                style={{
                  animation: "loading-shimmer 1.5s ease-in-out infinite",
                  background:
                    "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
              <div
                className="h-4 w-16 rounded-full bg-amber-100/60"
                style={{
                  animation: "loading-shimmer 1.5s ease-in-out infinite",
                  animationDelay: "0.2s",
                  background:
                    "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Products area skeleton */}
        <div className="flex flex-1 flex-col overflow-hidden px-16 py-12">
          {/* Category title skeleton */}
          <div
            className="mb-8 h-12 w-48 rounded-xl bg-amber-100/60"
            style={{
              animation:
                "fade-up 0.5s ease-out forwards, loading-shimmer 1.5s ease-in-out infinite",
              animationDelay: "0.2s",
              background:
                "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
              backgroundSize: "200% 100%",
            }}
          />

          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 gap-10">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border border-amber-200/40 bg-white/80 shadow-sm"
                style={{
                  animation: "card-lift 0.6s ease-out forwards",
                  animationDelay: `${0.3 + i * 0.1}s`,
                  opacity: 0,
                }}
              >
                {/* Image skeleton */}
                <div
                  className="aspect-square w-full bg-amber-50/80"
                  style={{
                    animation: "loading-shimmer 1.5s ease-in-out infinite",
                    background:
                      "linear-gradient(90deg, rgba(251,191,36,0.05) 0%, rgba(251,191,36,0.15) 50%, rgba(251,191,36,0.05) 100%)",
                    backgroundSize: "200% 100%",
                  }}
                />
                {/* Content skeleton */}
                <div className="flex flex-col items-center gap-4 border-t border-amber-200/40 p-8">
                  <div
                    className="h-6 w-32 rounded-full bg-amber-100/60"
                    style={{
                      animation: "loading-shimmer 1.5s ease-in-out infinite",
                      animationDelay: "0.3s",
                      background:
                        "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                  <div
                    className="h-14 w-36 rounded-full bg-amber-200/40"
                    style={{
                      animation: "loading-shimmer 1.5s ease-in-out infinite",
                      animationDelay: "0.4s",
                      background:
                        "linear-gradient(90deg, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.25) 50%, rgba(251,191,36,0.15) 100%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar skeleton */}
      <div className="flex items-center justify-between border-t border-amber-200/60 bg-white/80 px-16 py-6 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div
            className="h-12 w-12 rounded-xl bg-amber-100/60"
            style={{
              animation: "loading-shimmer 1.5s ease-in-out infinite",
              background:
                "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
              backgroundSize: "200% 100%",
            }}
          />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-12 rounded-full bg-amber-100/40" />
            <div className="h-6 w-24 rounded-full bg-amber-100/60" />
          </div>
        </div>
        <div
          className="h-16 w-36 rounded-xl bg-amber-100/60"
          style={{
            animation: "loading-shimmer 1.5s ease-in-out infinite",
            animationDelay: "0.2s",
            background:
              "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Loading indicator */}
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6"
        style={{ animation: "scale-in 0.6s ease-out forwards" }}
      >
        <div className="relative">
          <div
            className="h-20 w-20 rounded-full border-4 border-amber-200"
            style={{
              borderTopColor: "#d97706",
              animation: "rotate-slow 1s linear infinite",
            }}
          />
          <Coffee className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-amber-600" />
        </div>
        <p className="font-body text-xl font-medium text-amber-700">
          Preparing your menu...
        </p>
      </div>
    </div>
  );
};
