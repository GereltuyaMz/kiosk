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
  image_url: z.string().url().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
