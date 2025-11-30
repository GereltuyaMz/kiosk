"use server";

import { createClient } from "@/lib/supabase/server";
import { variantOptionSchema, reorderListSchema, type VariantOptionInput, type ReorderList } from "./schemas";
import type { VariantOption } from "./types";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";

export const createVariantOption = async (variantId: string, input: VariantOptionInput): Promise<ActionResult<VariantOption>> => {
  try {
    await verifyAuthOrThrow();
    const validatedData = variantOptionSchema.parse(input);
    const supabase = await createClient();

    const { data: maxSort } = await supabase
      .from("variant_options")
      .select("sort_order")
      .eq("variant_id", variantId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: option, error } = await supabase
      .from("variant_options")
      .insert({
        variant_id: variantId,
        name: validatedData.name,
        price_modifier: validatedData.price_modifier,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`An option named "${validatedData.name}" already exists in this variant group`);
      }
      throw new Error("Failed to create variant option");
    }

    return { success: true, data: option };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to create variant option") };
  }
};

export const updateVariantOption = async (optionId: string, input: VariantOptionInput): Promise<ActionResult<VariantOption>> => {
  try {
    await verifyAuthOrThrow();
    const validatedData = variantOptionSchema.parse(input);
    const supabase = await createClient();

    const { data: option, error } = await supabase
      .from("variant_options")
      .update({
        name: validatedData.name,
        price_modifier: validatedData.price_modifier,
      })
      .eq("id", optionId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`An option named "${validatedData.name}" already exists in this variant group`);
      }
      throw new Error("Failed to update variant option");
    }

    return { success: true, data: option };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to update variant option") };
  }
};

export const deleteVariantOption = async (optionId: string): Promise<ActionResult<null>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { error } = await supabase
      .from("variant_options")
      .delete()
      .eq("id", optionId);

    if (error) throw new Error("Failed to delete variant option");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to delete variant option") };
  }
};

export const reorderVariantOptions = async (variantId: string, items: ReorderList): Promise<ActionResult<null>> => {
  try {
    await verifyAuthOrThrow();
    const validatedItems = reorderListSchema.parse(items);
    const supabase = await createClient();

    const updates = validatedItems.map(item =>
      supabase
        .from("variant_options")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id)
        .eq("variant_id", variantId)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);

    if (failed?.error) throw new Error("Failed to reorder variant options");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to reorder variant options") };
  }
};
