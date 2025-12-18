"use client";

import type { OrderItem } from "@/lib/admin/orders/types";

type OrderItemsListProps = {
  items: OrderItem[];
};

export const OrderItemsList = ({ items }: OrderItemsListProps) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Items</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × ₮
                  {Number(item.base_price).toLocaleString()}
                </p>
              </div>
              <p className="text-sm font-semibold">
                ₮{Number(item.total_price).toLocaleString()}
              </p>
            </div>

            {item.options.length > 0 && (
              <div className="space-y-1 pl-2 border-l-2 border-muted">
                {item.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground">
                      {option.type === "VARIANT"
                        ? option.name
                        : `+ ${option.name}`}
                      {option.value && `: ${option.value}`}
                    </span>
                    {Number(option.price) > 0 && (
                      <span className="font-medium">
                        +₮{Number(option.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
