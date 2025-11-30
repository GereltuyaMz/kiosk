"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";
import type { Category } from "@/lib/admin/categories/types";
import type { Product } from "@/lib/admin/products/types";

export const getKioskCategories = async (): Promise<ActionResult<Category[]>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw new Error("Failed to fetch categories");

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch categories") };
  }
};

export const getKioskProducts = async (categoryId?: string | null): Promise<ActionResult<Product[]>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error) throw new Error("Failed to fetch products");

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch products") };
  }
};
