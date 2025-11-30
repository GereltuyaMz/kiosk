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
import { createAddon, updateAddon } from "@/lib/admin/addons/actions";
import type { ProductAddon } from "@/lib/admin/addons/types";

type AddonInput = {
  name: string;
  price: number;
};

type AddonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon?: ProductAddon;
  productId: string;
  onSuccess: () => void;
};

export const AddonDialog = ({
  open,
  onOpenChange,
  addon,
  productId,
  onSuccess,
}: AddonDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(addon);

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<AddonInput>({
      defaultValues: {
        name: "",
        price: 0,
      },
    });

  const addonName = watch("name");
  const addonPrice = watch("price");

  useEffect(() => {
    if (addon) {
      reset({
        name: addon.name,
        price: Number(addon.price),
      });
    } else {
      reset({
        name: "",
        price: 0,
      });
    }
  }, [addon, reset, open]);

  const onSubmit = async (data: AddonInput) => {
    setIsSubmitting(true);
    try {
      const result =
        isEdit && addon
          ? await updateAddon(addon.id, data)
          : await createAddon(productId, data);

      if (result.success) {
        toast.success(
          isEdit ? "Add-on updated successfully" : "Add-on created successfully"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEdit ? "Edit Add-on" : "Add New Add-on"}</DialogTitle>
          <DialogDescription className="text-sm">
            {isEdit
              ? "Update add-on details."
              : "Add extra items customers can add to their order (e.g., Extra Cheese, Bacon)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField label="Name *" htmlFor="name">
            <Input
              id="name"
              placeholder="e.g., Extra Cheese, Bacon"
              {...register("name")}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Price *" htmlFor="price">
            <PriceInput
              id="price"
              value={addonPrice}
              onChange={(value) => setValue("price", value)}
              disabled={isSubmitting}
              placeholder="0.00"
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
            <Button
              type="submit"
              disabled={isSubmitting || !addonName?.trim() || addonPrice <= 0}
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
