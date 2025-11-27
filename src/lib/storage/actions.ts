"use server";

import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";
import { createClient } from "@/lib/supabase/server";

export async function getStorageUploadContext(): Promise<
  ActionResult<{
    tenantId: string;
  }>
> {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    return { success: true, data: { tenantId } };
  } catch (error) {
    return { success: false, error: handleError(error, "Unauthorized") };
  }
}

export async function deleteProductImage(
  imageUrl: string
): Promise<ActionResult<null>> {
  try {
    await verifyAuthOrThrow();

    if (!imageUrl) return { success: true, data: null };

    const pathMatch = imageUrl.match(/\/object\/public\/product-images\/(.+)$/);
    if (!pathMatch) throw new Error("Invalid image URL");

    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("product-images")
      .remove([pathMatch[1]]);

    if (error) throw error;
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to delete image"),
    };
  }
}

export async function deleteCategoryImage(
  imageUrl: string
): Promise<ActionResult<null>> {
  try {
    await verifyAuthOrThrow();

    if (!imageUrl) return { success: true, data: null };

    const pathMatch = imageUrl.match(
      /\/object\/public\/category-images\/(.+)$/
    );
    if (!pathMatch) throw new Error("Invalid image URL");

    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("category-images")
      .remove([pathMatch[1]]);

    if (error) throw error;
    return { success: true, data: null };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to delete image"),
    };
  }
}
