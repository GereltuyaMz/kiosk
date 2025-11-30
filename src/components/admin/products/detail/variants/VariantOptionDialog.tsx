"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { FormField, PriceInput } from "@/components/common";
import { createVariantOption, updateVariantOption } from "@/lib/admin/variants/option-actions";
import type { VariantOption } from "@/lib/admin/variants/types";

type VariantOptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantOption?: VariantOption;
  variantId: string;
  variantName: string;
  onSuccess: () => void;
};

type VariantOptionInput = {
  name: string;
  price_modifier: number;
};

export const VariantOptionDialog = ({
  open,
  onOpenChange,
  variantOption,
  variantId,
  variantName,
  onSuccess,
}: VariantOptionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(variantOption);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<VariantOptionInput>({
    defaultValues: {
      name: "",
      price_modifier: 0,
    },
  });

  const optionName = watch("name");

  useEffect(() => {
    if (variantOption) {
      reset({
        name: variantOption.name,
        price_modifier: Number(variantOption.price_modifier),
      });
    } else {
      reset({
        name: "",
        price_modifier: 0,
      });
    }
  }, [variantOption, reset]);

  const onSubmit = async (data: VariantOptionInput) => {
    setIsSubmitting(true);
    try {
      const result = isEdit && variantOption
        ? await updateVariantOption(variantOption.id, data)
        : await createVariantOption(variantId, data);

      if (result.success) {
        toast.success(
          isEdit ? "Option updated successfully" : "Option created successfully"
        );
        onOpenChange(false);
        reset();
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-3">
          <DialogTitle>{isEdit ? "Edit Option" : "Add Option"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update option in "${variantName}".`
              : `Add a new option to "${variantName}" (e.g., Small, Medium, Large).`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <FormField label="Name *" htmlFor="name">
            <Input
              id="name"
              placeholder="e.g., Small, Medium, Large"
              {...register("name")}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Price Modifier"
            htmlFor="price_modifier"
            hint="Use negative values for discounts (e.g., -1.00 for $1 off)"
          >
            <PriceInput
              id="price_modifier"
              value={watch("price_modifier")}
              onChange={(value) => setValue("price_modifier", value, { shouldValidate: true })}
              disabled={isSubmitting}
              placeholder="0.00"
              allowNegative
            />
          </FormField>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !optionName?.trim()}>
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
