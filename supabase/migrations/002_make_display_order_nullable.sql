-- Make display_order nullable in products table
-- This allows products to have optional custom ordering
-- Products without display_order will sort by created_at DESC

-- Remove NOT NULL constraint and default value
alter table products alter column display_order drop not null;
alter table products alter column display_order drop default;

-- Add partial unique constraint
-- Only enforces uniqueness when display_order is not NULL
-- Multiple products can have NULL display_order without conflict
create unique index unique_products_display_order_per_tenant
  on products(tenant_id, display_order)
  where display_order is not null;
