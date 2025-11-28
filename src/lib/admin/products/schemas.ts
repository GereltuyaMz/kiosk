import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).trim().optional().nullable(),
  category_id: z.string().uuid("Please select a category"),
  base_price: z.number().min(0, "Price must be 0 or greater"),
  display_order: z
    .number()
    .int()
    .min(1, "Display order must be 1 or greater")
    .optional()
    .nullable(),
  images: z.array(z.string().url()).max(5, "Maximum 5 images allowed").optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
