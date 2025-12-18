"use client";

import { Expand, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/common";
import { OrderFilter } from "./OrderFilter";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatOrderTime, formatOrderDate } from "@/lib/admin/orders/utils";
import type { Order, DateFilter, OrderStatus } from "@/lib/admin/orders/types";

type OrdersTableViewProps = {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (value: DateFilter) => void;
  customDateRange?: { from: Date; to: Date };
  onCustomDateRangeChange?: (range: { from: Date; to: Date }) => void;
  statusFilter: OrderStatus | "all";
  onStatusFilterChange: (value: OrderStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onViewOrder: (order: Order) => void;
  onRefresh: () => void;
  isLoading: boolean;
};

export const OrdersTableView = ({
  orders,
  totalPages,
  currentPage,
  onPageChange,
  dateFilter,
  onDateFilterChange,
  customDateRange,
  onCustomDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onViewOrder,
  onRefresh,
  isLoading,
}: OrdersTableViewProps) => {
  const getDineTypeLabel = (type: string) => {
    return type === "EAT_IN" ? "Dine In" : "Take Out";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="cursor-pointer"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <OrderFilter
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          customDateRange={customDateRange}
          onCustomDateRangeChange={onCustomDateRangeChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-sm text-muted-foreground">
                    No orders found for the selected filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {formatOrderDate(order.created_at)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatOrderTime(order.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm ${
                        order.dine_type === "EAT_IN"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {getDineTypeLabel(order.dine_type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₮{Number(order.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge
                      status={order.status as OrderStatus}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewOrder(order)}
                        title="View Details"
                        className="cursor-pointer"
                      >
                        <Expand className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
