"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductInput } from "./schemas";
import type { Product } from "./types";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";
import { deleteProductImage } from "@/lib/storage/actions";

export const getProducts = async (): Promise<ActionResult<Product[]>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name)
      `)
      .eq("tenant_id", tenantId)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw new Error("Failed to fetch products");

    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch products") };
  }
};

export const getProduct = async (id: string): Promise<ActionResult<Product>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name)
      `)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch product") };
  }
};

export const createProduct = async (input: ProductInput): Promise<ActionResult<Product>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const validatedData = productSchema.parse(input);
    const supabase = await createClient();

    // Only check display_order uniqueness when it's provided (not null)
    if (validatedData.display_order != null) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("display_order", validatedData.display_order)
        .single();

      if (existing) {
        throw new Error(`Display order ${validatedData.display_order} is already in use`);
      }
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        tenant_id: tenantId,
        category_id: validatedData.category_id,
        name: validatedData.name,
        description: validatedData.description || null,
        base_price: validatedData.base_price,
        display_order: validatedData.display_order ?? null,
        images: validatedData.images || [],
      })
      .select()
      .single();

    if (error) throw new Error("Failed to create product");

    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to create product") };
  }
};

export const updateProduct = async (
  id: string,
  input: ProductInput
): Promise<ActionResult<Product>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const validatedData = productSchema.parse(input);
    const supabase = await createClient();

    // Only check display_order uniqueness when it's provided (not null)
    if (validatedData.display_order != null) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("display_order", validatedData.display_order)
        .neq("id", id)
        .single();

      if (existing) {
        throw new Error(`Display order ${validatedData.display_order} is already in use`);
      }
    }

    const { data: product, error } = await supabase
      .from("products")
      .update({
        category_id: validatedData.category_id,
        name: validatedData.name,
        description: validatedData.description || null,
        base_price: validatedData.base_price,
        display_order: validatedData.display_order ?? null,
        images: validatedData.images || [],
      })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) throw new Error("Failed to update product");

    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to update product") };
  }
};

export const deleteProduct = async (id: string): Promise<ActionResult<null>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: product } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) throw new Error("Failed to delete product");

    if (product?.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        await deleteProductImage(imageUrl);
      }
    }

    revalidatePath("/admin/products");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to delete product") };
  }
};

export const toggleProductStatus = async (id: string): Promise<ActionResult<Product>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("is_active")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError) throw new Error("Product not found");

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (updateError) throw new Error("Failed to update product status");

    revalidatePath("/admin/products");
    return { success: true, data: updatedProduct };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to toggle product status") };
  }
};
