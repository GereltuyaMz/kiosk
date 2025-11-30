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
import {
  FormField,
  CategorySelect,
  PriceInput,
  MultiImageUpload,
} from "@/components/common";
import { productSchema, type ProductInput } from "@/lib/admin/products/schemas";
import { createProduct, updateProduct } from "@/lib/admin/products/actions";
import type { Product } from "@/lib/admin/products/types";
import type { Category } from "@/lib/admin/categories/types";

type ProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories: Category[];
  onSuccess: () => void;
};

export const ProductDialog = ({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      base_price: 0,
      display_order: undefined,
      images: [],
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        category_id: product.category_id || "",
        base_price: Number(product.base_price),
        display_order: product.display_order ?? undefined,
        images: product.images || [],
      });
    } else {
      reset({
        name: "",
        description: "",
        category_id: "",
        base_price: 0,
        display_order: undefined,
        images: [],
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductInput) => {
    setIsSubmitting(true);

    try {
      const result =
        isEdit && product
          ? await updateProduct(product.id, data)
          : await createProduct(data);

      if (result.success) {
        toast.success(
          isEdit
            ? "Product updated successfully"
            : "Product created successfully"
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

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the product information below."
              : "Add a new product to your menu."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="e.g., Cheeseburger"
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
              placeholder="Describe this product..."
              className="resize-none"
              rows={3}
              {...register("description")}
            />
          </FormField>

          <MultiImageUpload
            value={watch("images") || []}
            onChange={(urls) => setValue("images", urls, { shouldDirty: true })}
            bucket="product-images"
            disabled={isSubmitting}
            maxImages={5}
          />

          <FormField
            label="Category"
            htmlFor="category_id"
            error={errors.category_id?.message}
          >
            <CategorySelect
              id="category_id"
              categories={activeCategories}
              {...register("category_id")}
            />
          </FormField>

          <FormField
            label="Base Price"
            htmlFor="base_price"
            error={errors.base_price?.message}
          >
            <PriceInput
              id="base_price"
              value={watch("base_price")}
              onChange={(value) => setValue("base_price", value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Display Order (Optional)"
            htmlFor="display_order"
            error={errors.display_order?.message}
            hint="Leave blank to sort by creation date"
          >
            <Input
              id="display_order"
              type="number"
              min="1"
              step="1"
              placeholder="Leave blank to sort by creation date"
              {...register("display_order", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return undefined;
                  }
                  const num = Number(value);
                  return isNaN(num) ? undefined : num;
                },
              })}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
