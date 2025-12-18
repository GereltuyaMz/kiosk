import type { Database } from "@/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type VariantOption = {
  id: string;
  name: string;
  price_modifier: number;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  is_required: boolean;
  sort_order: number;
  options: VariantOption[];
};

export type ProductAddon = {
  id: string;
  name: string;
  price: number;
  sort_order: number;
};

export type ProductWithDetails = {
  product: Product;
  variants: ProductVariant[];
  addons: ProductAddon[];
};
