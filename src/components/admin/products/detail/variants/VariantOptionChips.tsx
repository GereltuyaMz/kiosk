"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Pencil, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  ProductVariantWithOptions,
  VariantOption,
} from "@/lib/admin/variants/types";
import { reorderVariantOptions } from "@/lib/admin/variants/option-actions";
import { deleteVariantOption } from "@/lib/admin/variants/option-actions";
import { VariantOptionDialog } from "./VariantOptionDialog";
import { formatPrice } from "@/lib/utils";

type VariantOptionChipsProps = {
  variant: ProductVariantWithOptions;
  onUpdate: () => void;
};

type SortableChipProps = {
  option: VariantOption;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const SortableChip = ({
  option,
  onEdit,
  onDelete,
  disabled,
}: SortableChipProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priceModifier = Number(option.price_modifier);
  const showPrice = priceModifier !== 0;
  const priceText =
    priceModifier > 0 ? `+${priceModifier}` : `-${Math.abs(priceModifier)}`;

  return (
    <div ref={setNodeRef} style={style} className="inline-block">
      <Badge variant="secondary" className="px-1 py-1 gap-3">
        <div
          className="cursor-grab active:cursor-grabbing touch-none flex items-center gap-2 px-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{option.name}</span>
          {showPrice && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                priceModifier > 0
                  ? "text-green-700 bg-green-50"
                  : "text-orange-700 bg-orange-50"
              }`}
            >
              +{formatPrice(Number(priceText))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 pl-1 border-l">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="hover:bg-muted rounded p-1 transition-colors"
            disabled={disabled}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="hover:bg-muted rounded p-1 text-red-600 transition-colors"
            disabled={disabled}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </Badge>
    </div>
  );
};

export const VariantOptionChips = ({
  variant,
  onUpdate,
}: VariantOptionChipsProps) => {
  const [items, setItems] = useState(variant.options);
  const [isReordering, setIsReordering] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    VariantOption | undefined
  >();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    setIsReordering(true);
    try {
      const reorderData = newItems.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      const result = await reorderVariantOptions(variant.id, reorderData);

      if (result.success) {
        toast.success("Options reordered");
        onUpdate();
      } else {
        toast.error(result.error);
        setItems(variant.options);
      }
    } catch {
      toast.error("Failed to reorder options");
      setItems(variant.options);
    } finally {
      setIsReordering(false);
    }
  };

  const handleEdit = (option: VariantOption) => {
    setSelectedOption(option);
    setEditDialogOpen(true);
  };

  const handleDelete = async (option: VariantOption) => {
    if (!confirm(`Delete option "${option.name}"?`)) return;

    try {
      const result = await deleteVariantOption(option.id);

      if (result.success) {
        toast.success("Option deleted");
        onUpdate();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to delete option");
    }
  };

  if (items.length === 0) {
    return (
      <>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">No options yet.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Option
          </Button>
        </div>

        <VariantOptionDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          variantId={variant.id}
          variantName={variant.name}
          onSuccess={onUpdate}
        />
      </>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((o) => o.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap items-center gap-2">
            {items.map((option) => (
              <SortableChip
                key={option.id}
                option={option}
                onEdit={() => handleEdit(option)}
                onDelete={() => handleDelete(option)}
                disabled={isReordering}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              disabled={isReordering}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </SortableContext>
      </DndContext>

      <VariantOptionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        variantId={variant.id}
        variantName={variant.name}
        onSuccess={onUpdate}
      />

      <VariantOptionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        variantOption={selectedOption}
        variantId={variant.id}
        variantName={variant.name}
        onSuccess={onUpdate}
      />
    </>
  );
};
