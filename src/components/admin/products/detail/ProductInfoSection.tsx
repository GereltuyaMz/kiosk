"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductVariantsCount } from "@/lib/admin/variants/group-actions";
import { getProductAddonsCount } from "@/lib/admin/addons/actions";

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
  const [variantsCount, setVariantsCount] = useState(0);
  const [addonsCount, setAddonsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);

      const [variantsResult, addonsResult] = await Promise.all([
        getProductVariantsCount(productId),
        getProductAddonsCount(productId),
      ]);

      if (variantsResult.success) {
        setVariantsCount(variantsResult.data);
      }
      if (addonsResult.success) {
        setAddonsCount(addonsResult.data);
      }

      setIsLoading(false);
    };

    fetchCounts();
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
            {isLoading ? (
              <Skeleton className="h-5 w-8 mt-1" />
            ) : (
              <p className="text-sm font-medium mt-1">{variantsCount}</p>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Add-ons</p>
            {isLoading ? (
              <Skeleton className="h-5 w-8 mt-1" />
            ) : (
              <p className="text-sm font-medium mt-1">{addonsCount}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
