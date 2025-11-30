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
import type { ProductAddon } from "@/lib/admin/addons/types";
import { reorderAddons } from "@/lib/admin/addons/actions";
import { AddonItem } from "./AddonItem";

type AddonListProps = {
  addons: ProductAddon[];
  productId: string;
  onUpdate: () => void;
};

export const AddonList = ({ addons, productId, onUpdate }: AddonListProps) => {
  const [items, setItems] = useState(addons);
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

      const result = await reorderAddons(productId, reorderData);

      if (result.success) {
        toast.success("Add-ons reordered");
        onUpdate();
      } else {
        toast.error(result.error);
        setItems(addons);
      }
    } catch {
      toast.error("Failed to reorder add-ons");
      setItems(addons);
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
      <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((addon) => (
            <AddonItem
              key={addon.id}
              addon={addon}
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
