import type { Database } from "@/types/database";

export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type ProductVariantInsert = Database["public"]["Tables"]["product_variants"]["Insert"];
export type ProductVariantUpdate = Database["public"]["Tables"]["product_variants"]["Update"];

export type VariantOption = Database["public"]["Tables"]["variant_options"]["Row"];
export type VariantOptionInsert = Database["public"]["Tables"]["variant_options"]["Insert"];
export type VariantOptionUpdate = Database["public"]["Tables"]["variant_options"]["Update"];

export type ProductVariantWithOptions = ProductVariant & {
  options: VariantOption[];
};
