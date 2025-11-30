"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ProductVariantWithOptions } from "@/lib/admin/variants/types";
import { deleteVariantGroup } from "@/lib/admin/variants/group-actions";
import { VariantGroupDialog } from "./VariantGroupDialog";
import { VariantOptionChips } from "./VariantOptionChips";

type VariantGroupItemProps = {
  variant: ProductVariantWithOptions;
  productId: string;
  onUpdate: () => void;
  disabled?: boolean;
};

export const VariantGroupItem = ({
  variant,
  productId,
  onUpdate,
  disabled,
}: VariantGroupItemProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${variant.name}"? This will also delete all its options.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteVariantGroup(variant.id);

      if (result.success) {
        toast.success("Variant group deleted");
        onUpdate();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete variant group");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group rounded-lg border bg-card p-4 space-y-3 transition-colors hover:border-primary"
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

          <div className="flex-1 flex items-center gap-2">
            <h3 className="font-medium">{variant.name}</h3>
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
            <p className="text-xs text-muted-foreground ml-auto">
              {variant.options.length} {variant.options.length === 1 ? "option" : "options"}
            </p>
          </div>

          <div className="flex items-center gap-2">
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

        <VariantOptionChips
          variant={variant}
          onUpdate={onUpdate}
        />
      </div>

      <VariantGroupDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        variantGroup={variant}
        productId={productId}
        onSuccess={onUpdate}
      />
    </>
  );
};
