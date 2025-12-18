"use client";

import { useState, useCallback } from "react";
import { OrdersTableView } from "./OrdersTableView";
import { OrderDetailsSheet } from "./OrderDetailsSheet";
import { getOrders } from "@/lib/admin/orders/actions";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import type { Order, DateFilter, OrderStatus } from "@/lib/admin/orders/types";

type OrdersTableProps = {
  initialOrders: Order[];
  initialTotalPages: number;
  tenantId: string;
};

export const OrdersTable = ({
  initialOrders,
  initialTotalPages,
  tenantId,
}: OrdersTableProps) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    const result = await getOrders({
      dateFilter,
      customDateRange: dateFilter === "custom" ? customDateRange : undefined,
      statusFilter,
      searchQuery,
      page: currentPage,
    });

    if (result.success) {
      setOrders(result.data.orders);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  }, [dateFilter, customDateRange, statusFilter, searchQuery, currentPage]);

  useOrdersRealtime({
    tenantId,
    onRefresh: fetchOrders,
    enabled: true,
  });

  const handleDateFilterChange = async (value: DateFilter) => {
    setDateFilter(value);
    setCurrentPage(1);

    // Don't fetch if custom is selected but no date range yet
    if (value === "custom") {
      return;
    }

    setIsLoading(true);
    const result = await getOrders({
      dateFilter: value,
      statusFilter,
      searchQuery,
      page: 1,
    });

    if (result.success) {
      setOrders(result.data.orders);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  };

  const handleCustomDateRangeChange = async (range: { from: Date; to: Date }) => {
    setCustomDateRange(range);
    setCurrentPage(1);
    setIsLoading(true);

    const result = await getOrders({
      dateFilter: "custom",
      customDateRange: range,
      statusFilter,
      searchQuery,
      page: 1,
    });

    if (result.success) {
      setOrders(result.data.orders);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  };

  const handleStatusFilterChange = async (value: OrderStatus | "all") => {
    setStatusFilter(value);
    setCurrentPage(1);
    setIsLoading(true);

    const result = await getOrders({
      dateFilter,
      customDateRange: dateFilter === "custom" ? customDateRange : undefined,
      statusFilter: value,
      searchQuery,
      page: 1,
    });

    if (result.success) {
      setOrders(result.data.orders);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setIsLoading(true);

    const result = await getOrders({
      dateFilter,
      customDateRange: dateFilter === "custom" ? customDateRange : undefined,
      statusFilter,
      searchQuery,
      page,
    });

    if (result.success) {
      setOrders(result.data.orders);
      setTotalPages(result.data.totalPages);
    }
    setIsLoading(false);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleOrderUpdated = () => {
    fetchOrders();
  };

  return (
    <>
      <OrdersTableView
        orders={orders}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
        customDateRange={customDateRange}
        onCustomDateRangeChange={handleCustomDateRangeChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onViewOrder={handleViewOrder}
        onRefresh={fetchOrders}
        isLoading={isLoading}
      />

      <OrderDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
      />
    </>
  );
};
