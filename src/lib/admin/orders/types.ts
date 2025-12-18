export type OrderStatus = "NEW" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type DineType = "EAT_IN" | "TAKE_OUT";
export type ReceiptType = "INDIVIDUAL" | "ORGANIZATION";

export type Order = {
  id: string;
  tenant_id: string;
  order_number: number;
  dine_type: DineType;
  status: OrderStatus;
  receipt_type: ReceiptType;
  total_amount: number;
  is_paid: boolean;
  payment_method: string | null;
  payment_reference: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  ebarimt_id: string | null;
  ebarimt_lottery: string | null;
  ebarimt_qr_data: string | null;
  ebarimt_response: Record<string, unknown> | null;
  ebarimt_error: string | null;
  ebarimt_created_at: string | null;
};

export type OrderInsert = Omit<Order, "id" | "created_at" | "updated_at">;
export type OrderUpdate = Partial<OrderInsert>;

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  base_price: number;
  total_price: number;
  options: OrderItemOption[];
};

export type OrderItemOption = {
  id: string;
  order_item_id: string;
  type: "VARIANT" | "ADDON" | "MODIFIER";
  name: string;
  value: string | null;
  price: number;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type DateFilter = "today" | "yesterday" | "last7days" | "thisMonth" | "custom";

export type OrderFilters = {
  dateFilter: DateFilter;
  customDateRange?: {
    from: Date;
    to: Date;
  };
  statusFilter: OrderStatus | "all";
  searchQuery: string;
  page: number;
  pageSize: number;
};

export type OrdersResponse = {
  orders: Order[];
  totalCount: number;
  totalPages: number;
};
