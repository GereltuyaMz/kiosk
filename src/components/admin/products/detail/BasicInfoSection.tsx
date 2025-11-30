import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, CategorySelect, PriceInput } from "@/components/common";
import { Card } from "@/components/ui/card";
import type { ProductInput } from "@/lib/admin/products/schemas";
import type { Category } from "@/lib/admin/categories/types";

type BasicInfoSectionProps = {
  register: UseFormRegister<ProductInput>;
  errors: FieldErrors<ProductInput>;
  isSubmitting: boolean;
  categories: Category[];
  basePrice: number;
  onBasePriceChange: (value: number) => void;
  isActive: boolean;
  onStatusChange: (value: string) => void;
  isTogglingStatus: boolean;
};

export const BasicInfoSection = ({
  register,
  errors,
  isSubmitting,
  categories,
  basePrice,
  onBasePriceChange,
  isActive,
  onStatusChange,
  isTogglingStatus,
}: BasicInfoSectionProps) => {
  return (
    <Card className="p-7 rounded-xl gap-3">
      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="e.g., Cheeseburger"
            {...register("name")}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <FormField label="Status" htmlFor="status">
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={onStatusChange}
              disabled={isTogglingStatus || isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>
    </Card>
  );
};
