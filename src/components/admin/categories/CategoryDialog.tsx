"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  categorySchema,
  type CategoryInput,
} from "@/lib/admin/categories/schemas";
import { createCategory, updateCategory } from "@/lib/admin/categories/actions";
import type { Category } from "@/lib/admin/categories/types";

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSuccess: () => void;
};

export const CategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      display_order: 1,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
        display_order: category.display_order,
      });
    } else {
      reset({
        name: "",
        description: "",
        display_order: 0,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);

    try {
      const result =
        isEdit && category
          ? await updateCategory(category.id, data)
          : await createCategory(data);

      if (result.success) {
        toast.success(
          isEdit
            ? "Category updated successfully"
            : "Category created successfully"
        );
        onOpenChange(false);
        reset();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the category information below."
              : "Add a new category to organize your menu items."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Appetizers"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this category..."
              className="resize-none"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min="1"
              step="1"
              placeholder="1"
              {...register("display_order", { valueAsNumber: true })}
            />
            {errors.display_order && (
              <p className="text-sm text-red-600">
                {errors.display_order.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
