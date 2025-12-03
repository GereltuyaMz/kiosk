import type { Database } from "./database";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export type VariantOption = {
  id: string;
  variant_id: string;
  name: string;
  price_modifier: number;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  is_required: boolean;
  sort_order: number;
  options: VariantOption[];
};

export type ProductAddon = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  sort_order: number;
};

export type ProductDetails = Product & {
  variants: ProductVariant[];
  addons: ProductAddon[];
};

export type CartItemVariant = {
  variant_id: string;
  variant_name: string;
  option_id: string;
  option_name: string;
  price_modifier: number;
};

export type CartItemAddon = {
  addon_id: string;
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  product_id: string;
  name: string;
  base_price: number;
  image: string | null;
  quantity: number;
  variants: CartItemVariant[];
  addons: CartItemAddon[];
};

export type CreateOrderRequest = {
  dine_type: "EAT_IN" | "TAKE_OUT";
  receipt_type: "INDIVIDUAL" | "ORGANIZATION";
  payment_method: "qpay" | "card";
  total_amount: number;
  items: CartItem[];
};

export type CreateOrderResponse = {
  order_id: string;
  order_number: number;
};
