import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField, CategorySelect, PriceInput } from "@/components/common";
import { Card } from "@/components/ui/card";
import type { ProductInput } from "@/lib/admin/products/schemas";
import type { Category } from "@/lib/admin/categories/types";
import { Separator } from "@/components/ui/separator";

type ProductDetailsSectionProps = {
  register: UseFormRegister<ProductInput>;
  errors: FieldErrors<ProductInput>;
  isSubmitting: boolean;
  categories: Category[];
  basePrice: number;
  onBasePriceChange: (value: number) => void;
  isActive: boolean;
  onStatusToggle: (checked: boolean) => void;
  isTogglingStatus: boolean;
};

export const ProductDetailsSection = ({
  register,
  errors,
  isSubmitting,
  categories,
  basePrice,
  onBasePriceChange,
  isActive,
  onStatusToggle,
  isTogglingStatus,
}: ProductDetailsSectionProps) => {
  return (
    <Card className="py-4 px-3 rounded-md gap-3 shadow-none">
      <h2 className="text-lg font-semibold">Product Details</h2>
      <Separator />
      <div className="space-y-4">
        <FormField
          label="Category"
          htmlFor="category_id"
          error={errors.category_id?.message}
        >
          <CategorySelect
            id="category_id"
            categories={categories}
            {...register("category_id")}
            disabled={isSubmitting}
          />
        </FormField>

        <FormField
          label="Base Price"
          htmlFor="base_price"
          error={errors.base_price?.message}
        >
          <PriceInput
            id="base_price"
            value={basePrice}
            onChange={onBasePriceChange}
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
            disabled={isSubmitting}
          />
        </FormField>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={onStatusToggle}
              disabled={isTogglingStatus || isSubmitting}
            />
            <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
