"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/actions";
import { categorySchema, type CategoryInput } from "./schemas";
import type { Category } from "./types";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";

export const getCategories = async (): Promise<ActionResult<Category[]>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("tenant_id", user.tenant_id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return {
        success: false,
        error: handleError(error, "Failed to fetch categories"),
      };
    }

    return { success: true, data: categories || [] };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "An unexpected error occurred"),
    };
  }
};

export const createCategory = async (
  input: CategoryInput
): Promise<ActionResult<Category>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const validatedData = categorySchema.parse(input);

    const supabase = await createClient();

    // Check for duplicate display_order
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("display_order", validatedData.display_order)
      .single();

    if (existing) {
      throw new Error(
        `Display order ${validatedData.display_order} is already in use`
      );
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        tenant_id: tenantId,
        name: validatedData.name,
        description: validatedData.description || null,
        display_order: validatedData.display_order,
      })
      .select()
      .single();

    if (error) {
      throw new Error("Failed to create category");
    }

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to create category"),
    };
  }
};

export const updateCategory = async (
  id: string,
  input: CategoryInput
): Promise<ActionResult<Category>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const validatedData = categorySchema.parse(input);

    const supabase = await createClient();

    // Check for duplicate display_order (excluding current category)
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("display_order", validatedData.display_order)
      .neq("id", id)
      .single();

    if (existing) {
      throw new Error(
        `Display order ${validatedData.display_order} is already in use`
      );
    }

    const { data: category, error } = await supabase
      .from("categories")
      .update({
        name: validatedData.name,
        description: validatedData.description || null,
        display_order: validatedData.display_order,
      })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      throw new Error("Failed to update category");
    }

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to update category"),
    };
  }
};

export const deleteCategory = async (
  id: string
): Promise<ActionResult<{ id: string }>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error("Failed to delete category");
    }

    revalidatePath("/admin/categories");
    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to delete category"),
    };
  }
};

export const toggleCategoryStatus = async (
  id: string
): Promise<ActionResult<Category>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: currentCategory, error: fetchError } = await supabase
      .from("categories")
      .select("is_active")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !currentCategory) {
      throw new Error("Category not found");
    }

    const { data: category, error: updateError } = await supabase
      .from("categories")
      .update({ is_active: !currentCategory.is_active })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError) {
      throw new Error("Failed to toggle category status");
    }

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to toggle category status"),
    };
  }
};
