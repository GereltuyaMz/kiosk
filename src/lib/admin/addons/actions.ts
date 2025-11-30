"use server";

import { createClient } from "@/lib/supabase/server";
import { addonSchema } from "./schemas";
import type { AddonInput } from "./schemas";
import type { ProductAddon } from "./types";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";

export const getProductAddons = async (productId: string): Promise<ActionResult<ProductAddon[]>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("product_addons")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error("Failed to fetch addons");

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch addons") };
  }
};

export const getProductAddonsCount = async (productId: string): Promise<ActionResult<number>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("product_addons")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);

    if (error) throw new Error("Failed to fetch addons count");

    return { success: true, data: count ?? 0 };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch addons count") };
  }
};

export const createAddon = async (productId: string, input: AddonInput): Promise<ActionResult<ProductAddon>> => {
  try {
    await verifyAuthOrThrow();
    const validatedData = addonSchema.parse(input);
    const supabase = await createClient();

    const { data: maxSort } = await supabase
      .from("product_addons")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: addon, error } = await supabase
      .from("product_addons")
      .insert({
        product_id: productId,
        name: validatedData.name,
        price: validatedData.price,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`An addon named "${validatedData.name}" already exists for this product`);
      }
      throw new Error("Failed to create addon");
    }

    return { success: true, data: addon };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to create addon") };
  }
};

export const updateAddon = async (addonId: string, input: AddonInput): Promise<ActionResult<ProductAddon>> => {
  try {
    await verifyAuthOrThrow();
    const validatedData = addonSchema.parse(input);
    const supabase = await createClient();

    const { data: addon, error } = await supabase
      .from("product_addons")
      .update({
        name: validatedData.name,
        price: validatedData.price,
      })
      .eq("id", addonId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`An addon named "${validatedData.name}" already exists for this product`);
      }
      throw new Error("Failed to update addon");
    }

    return { success: true, data: addon };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to update addon") };
  }
};

export const deleteAddon = async (addonId: string): Promise<ActionResult<null>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { error } = await supabase
      .from("product_addons")
      .delete()
      .eq("id", addonId);

    if (error) throw new Error("Failed to delete addon");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to delete addon") };
  }
};

export const reorderAddons = async (
  productId: string,
  reorderData: { id: string; sort_order: number }[]
): Promise<ActionResult<null>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const updates = reorderData.map(item =>
      supabase
        .from("product_addons")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id)
        .eq("product_id", productId)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);

    if (failed?.error) throw new Error("Failed to reorder addons");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to reorder addons") };
  }
};
