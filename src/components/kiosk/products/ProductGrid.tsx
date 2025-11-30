"use client";

import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/admin/products/types";

type ProductGridProps = {
  products: Product[];
};

export const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-xl text-gray-500 font-medium">No products available</p>
          <p className="text-sm text-gray-400 mt-2">Please select a different category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
