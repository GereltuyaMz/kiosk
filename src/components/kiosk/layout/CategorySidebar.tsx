"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/admin/categories/types";
import Image from "next/image";
import { Menu, Flower } from "lucide-react";

type CategorySidebarProps = {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
};

export const CategorySidebar = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySidebarProps) => {
  return (
    <aside className="flex w-40 flex-col gap-3 bg-white p-6 shadow-[4px_0_24px_rgba(0,0,0,0.08)]">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all duration-200",
          "hover:bg-neutral-100 active:scale-95",
          selectedCategoryId === null
            ? "bg-linear-to-br from-pink-100 to-purple-100 text-pink-600 shadow-md"
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

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all duration-200",
            "hover:bg-neutral-100 active:scale-95",
            selectedCategoryId === category.id
              ? "bg-linear-to-br from-pink-100 to-purple-100 text-pink-600 shadow-md"
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
    </aside>
  );
};
