"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getProductAddons } from "@/lib/admin/addons/actions";
import type { ProductAddon } from "@/lib/admin/addons/types";
import { AddonDialog } from "./AddonDialog";
import { AddonList } from "./AddonList";

type AddonsSectionProps = {
  productId: string;
  onUpdate?: () => void;
};

export const AddonsSection = ({ productId, onUpdate }: AddonsSectionProps) => {
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAddons = async () => {
      setIsLoading(true);
      const result = await getProductAddons(productId);
      if (result.success) {
        setAddons(result.data);
      }
      setIsLoading(false);
    };

    fetchAddons();
  }, [productId]);

  const handleSuccess = () => {
    setIsLoading(true);
    getProductAddons(productId).then((result) => {
      if (result.success) {
        setAddons(result.data);
      }
      setIsLoading(false);
    });
    onUpdate?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add-ons</h2>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading add-ons...</p>
        </div>
      </div>
    );
  }

  if (addons.length === 0) {
    return (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add-ons</h2>
            <Button type="button" onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Add-on
            </Button>
          </div>
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No add-ons yet. Add one to get started.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Add extra items like &quot;Extra Cheese&quot;, &quot;Bacon&quot;, &quot;Avocado&quot;
            </p>
          </div>
        </div>

        <AddonDialog
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
          <h2 className="text-lg font-semibold">Add-ons</h2>
          <Button type="button" onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Add-on
          </Button>
        </div>

        <AddonList addons={addons} productId={productId} onUpdate={handleSuccess} />
      </div>

      <AddonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        onSuccess={handleSuccess}
      />
    </>
  );
};
