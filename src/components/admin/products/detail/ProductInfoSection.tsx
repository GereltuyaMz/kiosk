"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductVariants } from "@/lib/admin/variants/group-actions";
import type { ProductVariantWithOptions } from "@/lib/admin/variants/types";

type ProductInfoSectionProps = {
  productId: string;
  isActive: boolean;
  refreshKey?: number;
};

export const ProductInfoSection = ({
  productId,
  isActive,
  refreshKey,
}: ProductInfoSectionProps) => {
  const [variants, setVariants] = useState<ProductVariantWithOptions[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(true);

  useEffect(() => {
    const fetchVariants = async () => {
      setVariantsLoading(true);
      const result = await getProductVariants(productId);
      if (result.success) {
        setVariants(result.data);
      }
      setVariantsLoading(false);
    };

    fetchVariants();
  }, [productId, refreshKey]);

  return (
    <Card className="p-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Availability</p>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="mt-1 bg-green-100 text-green-800"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Variant Groups</p>
            {variantsLoading ? (
              <Skeleton className="h-5 w-8 mt-1" />
            ) : (
              <p className="text-sm font-medium mt-1">{variants.length}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
