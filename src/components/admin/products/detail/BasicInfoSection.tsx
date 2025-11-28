import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProductInput } from "@/lib/admin/products/schemas";

type BasicInfoSectionProps = {
  register: UseFormRegister<ProductInput>;
  errors: FieldErrors<ProductInput>;
  isSubmitting: boolean;
};

export const BasicInfoSection = ({
  register,
  errors,
  isSubmitting,
}: BasicInfoSectionProps) => {
  return (
    <Card className="py-4 px-3 rounded-md gap-3 shadow-none">
      <h2 className="text-lg font-semibold">Basic Information</h2>
      <Separator />
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
      </div>
    </Card>
  );
};
