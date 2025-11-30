import type { Database } from "@/types/database";

export type ProductAddon = Database["public"]["Tables"]["product_addons"]["Row"];
export type ProductAddonInsert = Database["public"]["Tables"]["product_addons"]["Insert"];
export type ProductAddonUpdate = Database["public"]["Tables"]["product_addons"]["Update"];
