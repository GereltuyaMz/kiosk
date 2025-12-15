import { z } from "zod";

export const ebarimtSettingsSchema = z.object({
  ebarimt_merchant_tin: z
    .string()
    .trim()
    .min(1, "Merchant TIN is required")
    .max(14, "TIN must be 11 or 14 digits")
    .regex(/^\d+$/, "TIN must contain only numbers"),
  ebarimt_pos_no: z
    .string()
    .trim()
    .min(1, "POS number is required"),
  ebarimt_branch_no: z
    .string()
    .trim()
    .max(3, "Branch number must be 3 digits or less"),
  ebarimt_district_code: z
    .string()
    .trim()
    .min(1, "District code is required")
    .max(4, "District code must be 4 digits")
    .regex(/^\d{4}$/, "District code must be 4 digits"),
  ebarimt_client_id: z
    .string()
    .trim()
    .min(1, "Client ID is required"),
  ebarimt_client_secret: z
    .string()
    .trim()
    .min(1, "Client Secret is required"),
  ebarimt_is_active: z.boolean(),
  ebarimt_env: z.enum(["staging", "production"]),
});

export type EbarimtSettingsInput = z.infer<typeof ebarimtSettingsSchema>;
