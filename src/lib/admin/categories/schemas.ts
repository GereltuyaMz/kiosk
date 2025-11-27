import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional()
    .nullable(),
  display_order: z
    .number()
    .int("Display order must be an integer")
    .min(1, "Display order must be 1 or greater"),
  image_url: z.string().url().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
