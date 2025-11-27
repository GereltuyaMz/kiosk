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
import { Button } from "@/components/ui/button";
import { FormField, ImageUpload } from "@/components/common";
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      display_order: 1,
      image_url: null,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
        display_order: category.display_order,
        image_url: category.image_url || null,
      });
    } else {
      reset({
        name: "",
        description: "",
        display_order: 0,
        image_url: null,
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
    } catch {
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
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="e.g., Appetizers"
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Description (Optional)"
            htmlFor="description"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              placeholder="Describe this category..."
              className="resize-none"
              rows={3}
              {...register("description")}
            />
          </FormField>

          <ImageUpload
            value={watch("image_url")}
            onChange={(url) => setValue("image_url", url)}
            bucket="category-images"
            disabled={isSubmitting}
            label="Category Image (Optional)"
            error={errors.image_url?.message}
          />

          <FormField
            label="Display Order"
            htmlFor="display_order"
            error={errors.display_order?.message}
          >
            <Input
              id="display_order"
              type="number"
              min="1"
              step="1"
              placeholder="1"
              {...register("display_order", { valueAsNumber: true })}
            />
          </FormField>

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
