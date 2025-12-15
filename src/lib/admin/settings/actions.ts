"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/actions";
import {
  ebarimtSettingsSchema,
  type EbarimtSettingsInput,
} from "./schemas";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";

type PaymentSettings = {
  id: string;
  tenant_id: string;
  ebarimt_merchant_tin: string | null;
  ebarimt_pos_no: string | null;
  ebarimt_branch_no: string | null;
  ebarimt_district_code: string | null;
  ebarimt_client_id: string | null;
  ebarimt_client_secret: string | null;
  ebarimt_is_active: boolean;
  ebarimt_env: "staging" | "production";
};

export const getEbarimtSettings = async (): Promise<
  ActionResult<PaymentSettings | null>
> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: settings, error } = await supabase
      .from("payment_settings")
      .select(
        `
        id,
        tenant_id,
        ebarimt_merchant_tin,
        ebarimt_pos_no,
        ebarimt_branch_no,
        ebarimt_district_code,
        ebarimt_client_id,
        ebarimt_client_secret,
        ebarimt_is_active,
        ebarimt_env
      `
      )
      .eq("tenant_id", user.tenant_id)
      .single();

    if (error && error.code !== "PGRST116") {
      return {
        success: false,
        error: handleError(error, "Failed to fetch eBarimt settings"),
      };
    }

    return { success: true, data: settings || null };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "An unexpected error occurred"),
    };
  }
};

export const saveEbarimtSettings = async (
  input: EbarimtSettingsInput
): Promise<ActionResult<PaymentSettings>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const validatedData = ebarimtSettingsSchema.parse(input);

    const supabase = await createClient();

    // Upsert payment settings
    const { data, error } = await supabase
      .from("payment_settings")
      .upsert(
        {
          tenant_id: tenantId,
          ebarimt_merchant_tin: validatedData.ebarimt_merchant_tin,
          ebarimt_pos_no: validatedData.ebarimt_pos_no,
          ebarimt_branch_no: validatedData.ebarimt_branch_no,
          ebarimt_district_code: validatedData.ebarimt_district_code,
          ebarimt_client_id: validatedData.ebarimt_client_id,
          ebarimt_client_secret: validatedData.ebarimt_client_secret,
          ebarimt_is_active: validatedData.ebarimt_is_active,
          ebarimt_env: validatedData.ebarimt_env,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "tenant_id",
        }
      )
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: handleError(error, "Failed to save eBarimt settings"),
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to save eBarimt settings"),
    };
  }
};
