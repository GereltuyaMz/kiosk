"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getProductVariants } from "@/lib/admin/variants/group-actions";
import type { ProductVariantWithOptions } from "@/lib/admin/variants/types";
import { VariantGroupDialog } from "./VariantGroupDialog";
import { VariantGroupList } from "./VariantGroupList";

type VariantsSectionProps = {
  productId: string;
  onUpdate?: () => void;
};

export const VariantsSection = ({ productId, onUpdate }: VariantsSectionProps) => {
  const [variants, setVariants] = useState<ProductVariantWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoading(true);
      const result = await getProductVariants(productId);
      if (result.success) {
        setVariants(result.data);
      }
      setIsLoading(false);
    };

    fetchVariants();
  }, [productId]);

  const handleSuccess = () => {
    setIsLoading(true);
    getProductVariants(productId).then((result) => {
      if (result.success) {
        setVariants(result.data);
      }
      setIsLoading(false);
      onUpdate?.();
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variants</h2>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading variants...</p>
        </div>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Variants</h2>
            <Button type="button" onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Variant Group
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No variant groups yet. Add one to get started.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Create groups like &quot;Size&quot; or &quot;Type&quot;, then add options like &quot;Small&quot;, &quot;Medium&quot;, &quot;Large&quot;
            </p>
          </div>
        </div>

        <VariantGroupDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productId={productId}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variants</h2>
          <Button type="button" onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Variant Group
          </Button>
        </div>

        <VariantGroupList
          variants={variants}
          productId={productId}
          onUpdate={handleSuccess}
        />
      </div>

      <VariantGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        onSuccess={handleSuccess}
      />
    </>
  );
};
