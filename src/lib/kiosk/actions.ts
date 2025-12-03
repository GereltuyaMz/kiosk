"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyAuthOrThrow, handleError, type ActionResult } from "@/lib/admin/utils";
import type { Category } from "@/lib/admin/categories/types";
import type { Product } from "@/lib/admin/products/types";
import type { ProductDetails, ProductVariant, VariantOption, CreateOrderRequest, CreateOrderResponse } from "@/types/kiosk";

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

export const getKioskProductDetails = async (productId: string): Promise<ActionResult<ProductDetails>> => {
  try {
    await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*, variant_options(*)")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (variantsError) throw new Error("Failed to fetch variants");

    const { data: addons, error: addonsError } = await supabase
      .from("product_addons")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (addonsError) throw new Error("Failed to fetch addons");

    type VariantWithOptions = {
      id: string;
      product_id: string;
      name: string;
      is_required: boolean;
      sort_order: number;
      variant_options: Array<{
        id: string;
        variant_id: string;
        name: string;
        price_modifier: number;
        sort_order: number;
        created_at: string;
        updated_at: string;
      }>;
    };

    const formattedVariants: ProductVariant[] = (variants as VariantWithOptions[] || []).map((variant) => ({
      id: variant.id,
      product_id: variant.product_id,
      name: variant.name,
      is_required: variant.is_required,
      sort_order: variant.sort_order,
      options: (variant.variant_options || [])
        .map((option) => ({
          id: option.id,
          variant_id: option.variant_id,
          name: option.name,
          price_modifier: option.price_modifier,
          sort_order: option.sort_order,
        }))
        .sort((a: VariantOption, b: VariantOption) => a.sort_order - b.sort_order),
    }));

    const productDetails: ProductDetails = {
      ...product,
      variants: formattedVariants,
      addons: (addons || []).map((addon) => ({
        id: addon.id,
        product_id: addon.product_id,
        name: addon.name,
        price: addon.price,
        sort_order: addon.sort_order,
      })),
    };

    return { success: true, data: productDetails };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to fetch product details") };
  }
};

export const createOrder = async (orderData: CreateOrderRequest): Promise<ActionResult<CreateOrderResponse>> => {
  try {
    const { user, tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: nextOrderNumber, error: orderNumError } = await supabase.rpc("get_next_order_number", {
      p_tenant_id: tenantId,
    });

    if (orderNumError) throw new Error("Failed to generate order number");

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        tenant_id: tenantId,
        created_by: user.id,
        order_number: nextOrderNumber,
        dine_type: orderData.dine_type,
        receipt_type: orderData.receipt_type,
        total_amount: orderData.total_amount,
        is_paid: true,
        payment_method: orderData.payment_method,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) throw new Error("Failed to create order");

    for (const item of orderData.items) {
      const itemTotalPrice =
        (item.base_price +
          item.variants.reduce((sum, v) => sum + v.price_modifier, 0) +
          item.addons.reduce((sum, a) => sum + a.price, 0)) *
        item.quantity;

      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.name,
          quantity: item.quantity,
          base_price: item.base_price,
          total_price: itemTotalPrice,
        })
        .select("id")
        .single();

      if (itemError || !orderItem) throw new Error("Failed to create order item");

      const options = [
        ...item.variants.map((v) => ({
          order_item_id: orderItem.id,
          type: "VARIANT",
          name: v.variant_name,
          value: v.option_name,
          price: v.price_modifier,
        })),
        ...item.addons.map((a) => ({
          order_item_id: orderItem.id,
          type: "ADDON",
          name: a.name,
          value: null,
          price: a.price,
        })),
      ];

      if (options.length > 0) {
        const { error: optionsError } = await supabase.from("order_item_options").insert(options);

        if (optionsError) throw new Error("Failed to create order item options");
      }
    }

    return {
      success: true,
      data: {
        order_id: order.id,
        order_number: order.order_number,
      },
    };
  } catch (error) {
    return { success: false, error: handleError(error, "Failed to create order") };
  }
};
