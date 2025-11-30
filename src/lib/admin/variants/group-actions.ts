"use server";

import { createClient } from "@/lib/supabase/server";
import { variantGroupSchema, variantGroupWithOptionsSchema, reorderListSchema, type VariantGroupInput, type VariantGroupWithOptionsInput, type ReorderList } from "./schemas";
import type { ProductVariant, ProductVariantWithOptions } from "./types";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";

export const getProductVariants = async (productId: string): Promise<ActionResult<ProductVariantWithOptions[]>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select(`
        *,
        options:variant_options(*)
      `)
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error("Failed to fetch variants");

    const variantsWithSortedOptions = variants.map(variant => ({
      ...variant,
      options: (variant.options || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
    }));

    return { success: true, data: variantsWithSortedOptions };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch variants") };
  }
};

export const createVariantGroup = async (productId: string, input: VariantGroupInput): Promise<ActionResult<ProductVariant>> => {
  try {
    await verifyAuthOrThrow();
    const validatedData = variantGroupSchema.parse(input);
    const supabase = await createClient();

    const { data: maxSort } = await supabase
      .from("product_variants")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: variant, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        name: validatedData.name,
        is_required: validatedData.is_required,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`A variant group named "${validatedData.name}" already exists for this product`);
      }
      throw new Error("Failed to create variant group");
    }

    return { success: true, data: variant };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to create variant group") };
  }
};

export const createVariantGroupWithOptions = async (productId: string, input: VariantGroupWithOptionsInput): Promise<ActionResult<ProductVariantWithOptions>> => {
  try {
    await verifyAuthOrThrow();
    const validatedData = variantGroupWithOptionsSchema.parse(input);
    const supabase = await createClient();

    const { data: maxSort } = await supabase
      .from("product_variants")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        name: validatedData.name,
        is_required: validatedData.is_required,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (variantError) {
      if (variantError.code === "23505") {
        throw new Error(`A variant group named "${validatedData.name}" already exists for this product`);
      }
      throw new Error("Failed to create variant group");
    }

    const optionsToInsert = validatedData.options.map((option, index) => ({
      variant_id: variant.id,
      name: option.name,
      price_modifier: option.price_modifier,
      sort_order: index,
    }));

    const { data: options, error: optionsError } = await supabase
      .from("variant_options")
      .insert(optionsToInsert)
      .select();

    if (optionsError) {
      await supabase.from("product_variants").delete().eq("id", variant.id);
      throw new Error("Failed to create variant options");
    }

    return { success: true, data: { ...variant, options: options || [] } };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to create variant group with options") };
  }
};

export const updateVariantGroup = async (variantId: string, input: VariantGroupInput): Promise<ActionResult<ProductVariant>> => {
  try {
    await verifyAuthOrThrow();
    const validatedData = variantGroupSchema.parse(input);
    const supabase = await createClient();

    const { data: variant, error } = await supabase
      .from("product_variants")
      .update({
        name: validatedData.name,
        is_required: validatedData.is_required,
      })
      .eq("id", variantId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(`A variant group named "${validatedData.name}" already exists for this product`);
      }
      throw new Error("Failed to update variant group");
    }

    return { success: true, data: variant };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to update variant group") };
  }
};

export const deleteVariantGroup = async (variantId: string): Promise<ActionResult<null>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);

    if (error) throw new Error("Failed to delete variant group");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to delete variant group") };
  }
};

export const reorderVariantGroups = async (productId: string, items: ReorderList): Promise<ActionResult<null>> => {
  try {
    await verifyAuthOrThrow();
    const validatedItems = reorderListSchema.parse(items);
    const supabase = await createClient();

    const updates = validatedItems.map(item =>
      supabase
        .from("product_variants")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id)
        .eq("product_id", productId)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);

    if (failed?.error) throw new Error("Failed to reorder variant groups");

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to reorder variant groups") };
  }
};
