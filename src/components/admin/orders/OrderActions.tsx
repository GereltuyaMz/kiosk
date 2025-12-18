"use client";

import { ArrowRight, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/admin/orders/types";

type OrderActionsProps = {
  currentStatus: OrderStatus;
  updating: boolean;
  onStatusChange: () => void;
  onCancel: () => void;
};

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  NEW: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

const getNextStatusLabel = (status: OrderStatus): string | null => {
  const labels: Record<OrderStatus, string> = {
    NEW: "Start Preparing",
    PREPARING: "Mark Ready",
    READY: "Complete Order",
    COMPLETED: "",
    CANCELLED: "",
  };
  return labels[status] || null;
};

export const OrderActions = ({
  currentStatus,
  updating,
  onStatusChange,
  onCancel,
}: OrderActionsProps) => {
  const nextStatus = STATUS_FLOW[currentStatus];
  const nextStatusLabel = getNextStatusLabel(currentStatus);

  return (
    <div className="space-y-3">
      {nextStatus && nextStatusLabel && (
        <Button
          onClick={onStatusChange}
          disabled={updating}
          className="w-full cursor-pointer"
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2" />
          )}
          {nextStatusLabel}
        </Button>
      )}

      {currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED" && (
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={updating}
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Order
        </Button>
      )}
    </div>
  );
};

export { STATUS_FLOW };
