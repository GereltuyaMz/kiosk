"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/admin/categories/types";
import Image from "next/image";

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
    <aside className="w-[200px] h-screen border-r bg-white overflow-y-auto">
      <div className="p-3 space-y-2">
        {/* All Products Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full min-h-[60px] rounded-xl px-4 py-3 text-left font-medium transition-all",
            "active:scale-[0.98]",
            selectedCategoryId === null
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
          )}
        >
          <span className="text-base">All Products</span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "w-full min-h-[60px] rounded-xl px-4 py-3 text-left font-medium transition-all",
              "flex items-center gap-3 active:scale-[0.98]",
              selectedCategoryId === category.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
            )}
          >
            {category.image_url && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-base line-clamp-2 flex-1">{category.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
