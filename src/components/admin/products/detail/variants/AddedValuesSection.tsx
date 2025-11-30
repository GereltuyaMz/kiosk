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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableValueItem } from "./SortableValueItem";
import type { OptionValue } from "./types";

type AddedValuesSectionProps = {
  optionValues: OptionValue[];
  onRemove: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export const AddedValuesSection = ({
  optionValues,
  onRemove,
  onDragEnd,
}: AddedValuesSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Added Values ({optionValues.length})
      </label>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={optionValues.map(opt => opt.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {optionValues.map((value) => (
              <SortableValueItem
                key={value.id}
                id={value.id}
                value={value}
                onRemove={() => onRemove(value.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-muted-foreground">
        Drag to reorder • Click × to remove
      </p>
    </div>
  );
};
