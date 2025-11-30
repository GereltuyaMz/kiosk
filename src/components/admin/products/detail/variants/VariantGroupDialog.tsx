"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common";
import { createVariantGroupWithOptions, updateVariantGroup } from "@/lib/admin/variants/group-actions";
import type { ProductVariant } from "@/lib/admin/variants/types";
import { OptionValueInputSection } from "./OptionValueInputSection";
import { AddedValuesSection } from "./AddedValuesSection";
import type { OptionValue } from "./types";

type VariantGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantGroup?: ProductVariant;
  productId: string;
  onSuccess: () => void;
};

export const VariantGroupDialog = ({
  open,
  onOpenChange,
  variantGroup,
  productId,
  onSuccess,
}: VariantGroupDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionValues, setOptionValues] = useState<OptionValue[]>([]);
  const [currentValue, setCurrentValue] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [optionError, setOptionError] = useState<string | null>(null);
  const isEdit = Boolean(variantGroup);

  const form = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = form;

  const groupName = watch("name");

  useEffect(() => {
    if (variantGroup) {
      reset({ name: variantGroup.name });
    } else {
      reset({ name: "" });
      setOptionValues([]);
      setCurrentValue("");
      setCurrentPrice(0);
      setOptionError(null);
    }
  }, [variantGroup, reset, open]);

  const handleAddValue = () => {
    const trimmedValue = currentValue.trim();

    if (!trimmedValue) {
      return;
    }

    if (optionValues.some(opt => opt.name === trimmedValue)) {
      setOptionError("This option value already exists");
      return;
    }

    const newOption: OptionValue = {
      id: `${trimmedValue}-${Date.now()}`,
      name: trimmedValue,
      price_modifier: currentPrice,
    };

    setOptionValues([...optionValues, newOption]);
    setCurrentValue("");
    setCurrentPrice(0);
    setOptionError(null);
  };

  const handleRemoveValue = (id: string) => {
    setOptionValues(optionValues.filter(opt => opt.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOptionValues((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    }
  };

  const handleValueChange = (value: string) => {
    setCurrentValue(value);
    setOptionError(null);
  };

  const resetDialog = () => {
    reset();
    setOptionValues([]);
    setCurrentValue("");
    setCurrentPrice(0);
    setOptionError(null);
  };

  const onSubmit = async (data: { name: string }) => {
    setIsSubmitting(true);
    try {
      const result = isEdit && variantGroup
        ? await updateVariantGroup(variantGroup.id, { name: data.name, is_required: false })
        : await createVariantGroupWithOptions(productId, {
            name: data.name,
            is_required: false,
            options: optionValues.map(opt => ({
              name: opt.name,
              price_modifier: opt.price_modifier,
            })),
          });

      if (result.success) {
        toast.success(
          isEdit ? "Variant group updated successfully" : "Variant group created successfully"
        );
        onOpenChange(false);
        resetDialog();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEdit ? "Edit Variant Group" : "Add Variant Group"}</DialogTitle>
          <DialogDescription className="text-sm">
            {isEdit
              ? "Update the variant group details."
              : "Create a new option group for your product. For example: Size, Ice Level, or Sugar Level."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField label="Option Group Name *" htmlFor="name">
            <Input
              id="name"
              placeholder="e.g., Size, Type, Crust"
              {...register("name")}
              disabled={isSubmitting}
            />
          </FormField>

          {!isEdit && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <OptionValueInputSection
                    currentValue={currentValue}
                    currentPrice={currentPrice}
                    isSubmitting={isSubmitting}
                    optionError={optionError}
                    onValueChange={handleValueChange}
                    onPriceChange={setCurrentPrice}
                    onAdd={handleAddValue}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>

              {optionValues.length > 0 && (
                <div className="space-y-3">
                  <AddedValuesSection
                    optionValues={optionValues}
                    onRemove={handleRemoveValue}
                    onDragEnd={handleDragEnd}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !groupName?.trim() ||
                (!isEdit && optionValues.length === 0)
              }
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Save Variant Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
