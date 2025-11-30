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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import type { ProductVariantWithOptions } from "@/lib/admin/variants/types";
import { reorderVariantGroups } from "@/lib/admin/variants/group-actions";
import { VariantGroupItem } from "./VariantGroupItem";

type VariantGroupListProps = {
  variants: ProductVariantWithOptions[];
  productId: string;
  onUpdate: () => void;
};

export const VariantGroupList = ({
  variants,
  productId,
  onUpdate,
}: VariantGroupListProps) => {
  const [items, setItems] = useState(variants);
  const [isReordering, setIsReordering] = useState(false);

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

      const result = await reorderVariantGroups(productId, reorderData);

      if (result.success) {
        toast.success("Variant groups reordered");
        onUpdate();
      } else {
        toast.error(result.error);
        setItems(variants);
      }
    } catch {
      toast.error("Failed to reorder variant groups");
      setItems(variants);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((v) => v.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {items.map((variant) => (
            <VariantGroupItem
              key={variant.id}
              variant={variant}
              productId={productId}
              onUpdate={onUpdate}
              disabled={isReordering}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
