"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ProductAddon } from "@/lib/admin/addons/types";
import { deleteAddon } from "@/lib/admin/addons/actions";
import { AddonDialog } from "./AddonDialog";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type AddonItemProps = {
  addon: ProductAddon;
  productId: string;
  onUpdate: () => void;
  disabled?: boolean;
};

export const AddonItem = ({
  addon,
  productId,
  onUpdate,
  disabled,
}: AddonItemProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: addon.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${addon.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAddon(addon.id);

      if (result.success) {
        toast.success("Add-on deleted");
        onUpdate();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete add-on");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{addon.name}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditDialogOpen(true)}
                  disabled={disabled || isDeleting}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Badge className="bg-green-50 text-green-700">
                +{formatPrice(Number(addon.price))}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={disabled || isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AddonDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        addon={addon}
        productId={productId}
        onSuccess={onUpdate}
      />
    </>
  );
};
