"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/admin/products/types";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : "/placeholder-product.png";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative h-[180px] bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-base line-clamp-2 min-h-[48px] text-gray-900">
            {product.name}
          </h3>

          <p className="text-2xl font-bold text-blue-600">
            ₮{formatPrice(Number(product.base_price))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
