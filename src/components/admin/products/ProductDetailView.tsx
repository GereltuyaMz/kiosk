"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateProduct, toggleProductStatus } from "@/lib/admin/products/actions";
import { productSchema, type ProductInput } from "@/lib/admin/products/schemas";
import type { Product } from "@/lib/admin/products/types";
import type { Category } from "@/lib/admin/categories/types";
import { BasicInfoSection } from "./detail/BasicInfoSection";
import { ProductDetailsSection } from "./detail/ProductDetailsSection";
import { ProductImageSection } from "./detail/ProductImageSection";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

type ProductDetailViewProps = {
  product: Product;
  categories: Category[];
};

export const ProductDetailView = ({ product, categories }: ProductDetailViewProps) => {
  const router = useRouter();
  const { setItems } = useBreadcrumb();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(product.is_active);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      category_id: product.category_id || "",
      base_price: Number(product.base_price),
      display_order: product.display_order ?? undefined,
      images: product.images || [],
    },
  });

  const activeCategories = categories.filter((c) => c.is_active);

  useEffect(() => {
    setItems([
      { label: "Products", href: "/admin/products" },
      { label: product.name },
    ]);

    return () => {
      setItems([]);
    };
  }, [product.name, setItems]);

  const onSubmit = async (data: ProductInput) => {
    setIsSubmitting(true);
    try {
      const result = await updateProduct(product.id, data);
      if (result.success) {
        toast.success("Product updated successfully");
        reset(data);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (checked: boolean) => {
    setIsTogglingStatus(true);
    try {
      const result = await toggleProductStatus(product.id);
      if (result.success) {
        setIsActive(checked);
        toast.success(`Product ${checked ? "activated" : "deactivated"}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <BasicInfoSection
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
            />

            <ProductImageSection
              value={watch("images") || []}
              onChange={(urls) => setValue("images", urls, { shouldDirty: true })}
              disabled={isSubmitting}
            />
          </div>
          <div className="row-span-1">

          <ProductDetailsSection
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            categories={activeCategories}
            basePrice={watch("base_price")}
            onBasePriceChange={(value) => setValue("base_price", value, { shouldDirty: true })}
            isActive={isActive}
            onStatusToggle={handleStatusToggle}
            isTogglingStatus={isTogglingStatus}
          />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Variants</h2>
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Variants management coming soon
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Add size and type variations (e.g., Small, Medium, Large)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Add-ons</h2>
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Add-ons management coming soon
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Add extra items (e.g., Extra Cheese, Bacon)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Modifiers</h2>
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Modifiers management coming soon
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Add customization options (e.g., Sauce Selection, Cooking Level)
            </p>
          </div>
        </div>
      </form>

      {isDirty && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            size="lg"
            className="shadow-lg cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
};
