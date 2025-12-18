"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  verifyAuthOrThrow,
  handleError,
  type ActionResult,
} from "@/lib/admin/utils";
import { getDateRange } from "./utils";
import type {
  Order,
  OrderWithItems,
  OrderFilters,
  OrdersResponse,
  OrderStatus,
  OrderItem,
} from "./types";

const DEFAULT_PAGE_SIZE = 20;

export const getOrders = async (
  filters: Partial<OrderFilters> = {}
): Promise<ActionResult<OrdersResponse>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const {
      dateFilter = "today",
      customDateRange,
      statusFilter = "all",
      searchQuery = "",
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
    } = filters;

    const dateRange =
      dateFilter === "custom" && customDateRange
        ? customDateRange
        : getDateRange(dateFilter);

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId)
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (searchQuery) {
      const orderNum = parseInt(searchQuery.replace("#", ""), 10);
      if (!isNaN(orderNum)) {
        query = query.eq("order_number", orderNum);
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: orders, error, count } = await query;

    if (error) throw new Error("Failed to fetch orders");

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        orders: orders || [],
        totalCount,
        totalPages,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to fetch orders"),
    };
  }
};

export const getOrderWithDetails = async (
  orderId: string
): Promise<ActionResult<OrderWithItems>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("tenant_id", tenantId)
      .single();

    if (orderError || !order) {
      return { success: false, error: "Order not found" };
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
        id,
        order_id,
        product_id,
        product_name,
        quantity,
        base_price,
        total_price
      `
      )
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (itemsError) throw new Error("Failed to fetch order items");

    const items: OrderItem[] = [];

    for (const item of orderItems || []) {
      const { data: options } = await supabase
        .from("order_item_options")
        .select("id, order_item_id, type, name, value, price")
        .eq("order_item_id", item.id);

      items.push({
        ...item,
        options: options || [],
      });
    }

    return {
      success: true,
      data: {
        ...order,
        items,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to fetch order details"),
    };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<ActionResult<Order>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) throw new Error("Failed to update order status");

    revalidatePath("/admin/orders");
    return { success: true, data: order };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to update order status"),
    };
  }
};

export const cancelOrder = async (
  orderId: string
): Promise<ActionResult<Order>> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !existingOrder) {
      return { success: false, error: "Order not found" };
    }

    if (existingOrder.status === "COMPLETED") {
      return { success: false, error: "Cannot cancel a completed order" };
    }

    if (existingOrder.status === "CANCELLED") {
      return { success: false, error: "Order is already cancelled" };
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", orderId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) throw new Error("Failed to cancel order");

    revalidatePath("/admin/orders");
    return { success: true, data: order };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to cancel order"),
    };
  }
};

export const getOrderStats = async (
  dateFilter: OrderFilters["dateFilter"] = "today"
): Promise<
  ActionResult<{
    total: number;
    new: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }>
> => {
  try {
    const { tenantId } = await verifyAuthOrThrow();
    const supabase = await createClient();

    const dateRange = getDateRange(dateFilter);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("status, total_amount, is_paid")
      .eq("tenant_id", tenantId)
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString());

    if (error) throw new Error("Failed to fetch order stats");

    const stats = {
      total: orders?.length || 0,
      new: orders?.filter((o) => o.status === "NEW").length || 0,
      preparing: orders?.filter((o) => o.status === "PREPARING").length || 0,
      ready: orders?.filter((o) => o.status === "READY").length || 0,
      completed: orders?.filter((o) => o.status === "COMPLETED").length || 0,
      cancelled: orders?.filter((o) => o.status === "CANCELLED").length || 0,
      totalRevenue:
        orders
          ?.filter((o) => o.is_paid)
          .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
    };

    return { success: true, data: stats };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, "Failed to fetch order stats"),
    };
  }
};
