"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  CreditCard,
  Clock,
  Utensils,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemsList } from "./OrderItemsList";
import { OrderActions, STATUS_FLOW } from "./OrderActions";
import {
  getOrderWithDetails,
  updateOrderStatus,
  cancelOrder,
} from "@/lib/admin/orders/actions";
import { formatOrderDateTime } from "@/lib/admin/orders/utils";
import { toast } from "sonner";
import type { Order, OrderWithItems, OrderStatus } from "@/lib/admin/orders/types";

type OrderDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onOrderUpdated: () => void;
};

export const OrderDetailsSheet = ({
  open,
  onOpenChange,
  order,
  onOrderUpdated,
}: OrderDetailsSheetProps) => {
  const [orderDetails, setOrderDetails] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!order?.id || !open) return;

      setLoading(true);
      const result = await getOrderWithDetails(order.id);

      if (result.success) {
        setOrderDetails(result.data);
      } else {
        toast.error(result.error);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [order?.id, open]);

  const handleStatusChange = async () => {
    if (!orderDetails) return;

    const nextStatus = STATUS_FLOW[orderDetails.status as OrderStatus];
    if (!nextStatus) return;

    setUpdating(true);
    const result = await updateOrderStatus(orderDetails.id, nextStatus);

    if (result.success) {
      toast.success(`Order status updated to ${nextStatus}`);
      setOrderDetails({ ...orderDetails, status: nextStatus });
      onOrderUpdated();
    } else {
      toast.error(result.error);
    }
    setUpdating(false);
  };

  const handleCancel = async () => {
    if (!orderDetails) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setUpdating(true);
    const result = await cancelOrder(orderDetails.id);

    if (result.success) {
      toast.success("Order cancelled");
      onOpenChange(false);
      onOrderUpdated();
    } else {
      toast.error(result.error);
    }
    setUpdating(false);
  };

  if (!order) return null;

  const currentStatus = (orderDetails?.status || order.status) as OrderStatus;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order #{order.order_number}
            </SheetTitle>
            <SheetDescription>View and manage order details</SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <OrderDetailsContent
              order={order}
              orderDetails={orderDetails}
              currentStatus={currentStatus}
              updating={updating}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

type OrderDetailsContentProps = {
  order: Order;
  orderDetails: OrderWithItems | null;
  currentStatus: OrderStatus;
  updating: boolean;
  onStatusChange: () => void;
  onCancel: () => void;
};

const OrderDetailsContent = ({
  order,
  orderDetails,
  currentStatus,
  updating,
  onStatusChange,
  onCancel,
}: OrderDetailsContentProps) => (
  <div className="space-y-5">
    {/* Status & Type */}
    <div className="flex items-center justify-between">
      <OrderStatusBadge status={currentStatus} />
      <div className="flex items-center gap-2 text-sm">
        {order.dine_type === "EAT_IN" ? (
          <>
            <Utensils className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600">Dine In</span>
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4 text-orange-600" />
            <span className="text-orange-600">Take Out</span>
          </>
        )}
      </div>
    </div>

    {/* Order Time */}
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="p-2 bg-background rounded-md">
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">Order Time</p>
        <p className="text-sm font-medium">
          {formatOrderDateTime(order.created_at)}
        </p>
      </div>
    </div>

    <Separator />

    {/* Order Items */}
    {orderDetails?.items && <OrderItemsList items={orderDetails.items} />}

    <Separator />

    {/* Total */}
    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
      <span className="font-medium">Total</span>
      <span className="text-lg font-bold">
        ₮{Number(order.total_amount).toLocaleString()}
      </span>
    </div>

    {/* Payment Info */}
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="p-2 bg-background rounded-md">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">Payment</p>
        <p className="text-sm font-medium">
          {order.is_paid ? "Paid" : "Unpaid"} via {order.payment_method || "N/A"}
        </p>
      </div>
    </div>

    {/* eBarimt Info */}
    {order.ebarimt_id && (
      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 space-y-2">
        <p className="text-xs text-green-700 dark:text-green-400 font-medium">
          eBarimt Receipt
        </p>
        <div className="text-xs text-green-600 dark:text-green-500 space-y-1">
          <p>ID: {order.ebarimt_id}</p>
          {order.ebarimt_lottery && <p>Lottery: {order.ebarimt_lottery}</p>}
        </div>
      </div>
    )}

    <Separator />

    {/* Actions */}
    <OrderActions
      currentStatus={currentStatus}
      updating={updating}
      onStatusChange={onStatusChange}
      onCancel={onCancel}
    />
  </div>
);
