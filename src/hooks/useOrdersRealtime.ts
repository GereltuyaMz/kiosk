"use client";

import { useEffect, useCallback } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Order } from "@/lib/admin/orders/types";

type UseOrdersRealtimeOptions = {
  tenantId: string;
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
  onRefresh: () => void;
  enabled?: boolean;
};

export const useOrdersRealtime = ({
  tenantId,
  onNewOrder,
  onOrderUpdate,
  onRefresh,
  enabled = true,
}: UseOrdersRealtimeOptions) => {
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Order>) => {
      if (payload.eventType === "INSERT" && payload.new) {
        const newOrder = payload.new as Order;
        toast.success(`New order #${newOrder.order_number} received!`);
        onNewOrder?.(newOrder);
        onRefresh();
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const updatedOrder = payload.new as Order;
        onOrderUpdate?.(updatedOrder);
        onRefresh();
      }
    },
    [onNewOrder, onOrderUpdate, onRefresh]
  );

  useEffect(() => {
    if (!enabled || !tenantId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`orders-${tenantId}`)
      .on<Order>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `tenant_id=eq.${tenantId}`,
        },
        handleChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, enabled, handleChange]);
};
