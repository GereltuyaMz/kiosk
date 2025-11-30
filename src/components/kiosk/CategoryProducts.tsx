"use client";

import { Button } from "@/components/ui/button";
import { Coffee, Menu, Flower } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import type { Category } from "@/lib/admin/categories/types";
import type { Product } from "@/lib/admin/products/types";
import { LoadingProducts } from "./shared";

type CategoryProductsProps = {
  categories: Category[];
  products: Product[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isLoading: boolean;
};

export const CategoryProducts = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  isLoading,
}: CategoryProductsProps) => {
  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategoryId)?.name || "All Products";

  return (
    <div className="flex h-full bg-neutral-50">
      <div className="flex w-[160px] flex-col gap-3 bg-white p-6 shadow-[4px_0_24px_rgba(0,0,0,0.08)]">
        {/* All Products Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all duration-200",
            "hover:bg-neutral-100 active:scale-95",
            selectedCategoryId === null
              ? "bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 shadow-md"
              : "bg-white text-neutral-600"
          )}
        >
          <div
            className={cn(
              "transition-colors",
              selectedCategoryId === null ? "text-pink-600" : "text-neutral-500"
            )}
          >
            <Menu className="h-8 w-8" />
          </div>
          <span
            className={cn(
              "text-center text-sm font-semibold leading-tight",
              selectedCategoryId === null ? "text-pink-600" : "text-neutral-700"
            )}
          >
            All
          </span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all duration-200",
              "hover:bg-neutral-100 active:scale-95",
              selectedCategoryId === category.id
                ? "bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 shadow-md"
                : "bg-white text-neutral-600"
            )}
          >
            {category.image_url ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "transition-colors",
                  selectedCategoryId === category.id
                    ? "text-pink-600"
                    : "text-neutral-500"
                )}
              >
                <Flower className="h-8 w-8" />
              </div>
            )}
            <span
              className={cn(
                "text-center text-sm font-semibold leading-tight",
                selectedCategoryId === category.id
                  ? "text-pink-600"
                  : "text-neutral-700"
              )}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-white px-12 py-8 shadow-sm">
          <div>
            <h1 className="text-5xl font-bold capitalize text-neutral-900">
              {selectedCategoryName}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-10">
          {/* Product Grid */}
          {isLoading ? (
            <LoadingProducts />
          ) : products.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-xl text-neutral-500">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8 pb-32">
              {products.map((product) => {
                const imageUrl =
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : "/placeholder.svg";

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-3xl bg-white transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col items-center gap-3 p-6">
                      <h3 className="text-center text-2xl font-bold text-neutral-900">
                        {product.name}
                      </h3>
                      <Button className="h-12 gap-2 rounded-full bg-neutral-100 px-6 text-lg font-bold text-neutral-900 hover:bg-neutral-200">
                        <span className="text-pink-600">+</span>
                        {formatPrice(Number(product.base_price))}₮
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
