import { z } from "zod";

export const variantGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").trim(),
  is_required: z.boolean().optional().default(false),
});

export type VariantGroupInput = z.infer<typeof variantGroupSchema>;

export const variantOptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").trim(),
  price_modifier: z.number().min(-99999.99, "Price modifier must be at least -99999.99").max(99999.99, "Price modifier must be at most 99999.99"),
});

export type VariantOptionInput = z.infer<typeof variantOptionSchema>;

export const reorderItemSchema = z.object({
  id: z.string().uuid(),
  sort_order: z.number().int().min(0),
});

export const reorderListSchema = z.array(reorderItemSchema);

export type ReorderItem = z.infer<typeof reorderItemSchema>;
export type ReorderList = z.infer<typeof reorderListSchema>;

export const variantGroupWithOptionsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").trim(),
  is_required: z.boolean().optional().default(false),
  options: z.array(
    z.object({
      name: z.string().min(1, "Option value cannot be empty").trim(),
      price_modifier: z.number().min(-99999.99, "Price modifier must be at least -99999.99").max(99999.99, "Price modifier must be at most 99999.99"),
    })
  ).min(1, "At least one option value is required"),
});

export type VariantGroupWithOptionsInput = z.infer<typeof variantGroupWithOptionsSchema>;
