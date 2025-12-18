"use client";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/admin/orders/types";

type OrderStatusBadgeProps = {
  status: OrderStatus;
  size?: "sm" | "default";
};

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  PREPARING: {
    label: "Preparing",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  READY: {
    label: "Ready",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

export const OrderStatusBadge = ({
  status,
  size = "default",
}: OrderStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={`${config.className} ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}
    >
      {config.label}
    </Badge>
  );
};
