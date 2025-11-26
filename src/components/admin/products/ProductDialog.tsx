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
  productSchema,
  type ProductInput,
} from "@/lib/admin/products/schemas";
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
  const [priceDisplay, setPriceDisplay] = useState("");
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      base_price: 0,
      display_order: undefined,
    },
  });

  useEffect(() => {
    if (product) {
      const price = Number(product.base_price);
      reset({
        name: product.name,
        description: product.description || "",
        category_id: product.category_id || "",
        base_price: price,
        display_order: product.display_order ?? undefined,
      });
      setPriceDisplay(formatPriceForInput(price));
    } else {
      reset({
        name: "",
        description: "",
        category_id: "",
        base_price: 0,
        display_order: undefined,
      });
      setPriceDisplay("");
    }
  }, [product, reset]);

  const formatPriceForInput = (value: number): string => {
    if (!value && value !== 0) return "";
    return value.toLocaleString("en-US");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");

    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      setPriceDisplay(rawValue ? parseFloat(rawValue).toLocaleString("en-US") : "");
      setValue("base_price", parseFloat(rawValue) || 0);
    }
  };

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
    } catch (error) {
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
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Cheeseburger"
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
              placeholder="Describe this product..."
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
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              {...register("category_id")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              {activeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-red-600">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_price">Base Price</Label>
            <Input
              id="base_price"
              type="text"
              placeholder="0"
              value={priceDisplay}
              onChange={handlePriceChange}
            />
            {errors.base_price && (
              <p className="text-sm text-red-600">
                {errors.base_price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order (Optional)</Label>
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
                }
              })}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to sort by creation date
            </p>
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
