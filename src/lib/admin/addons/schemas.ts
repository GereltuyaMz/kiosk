import { z } from "zod";

export const addonSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  price: z.number().min(0, "Price cannot be negative"),
});

export type AddonInput = z.infer<typeof addonSchema>;
