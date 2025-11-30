-- =============================================
-- PRODUCT ADDONS TABLE
-- =============================================

-- Add-ons (e.g., "Extra Cheese", "Bacon", "Avocado")
create table product_addons (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null check (length(name) <= 100),
  price numeric(10,2) not null default 0 check (price >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_product_addons_product_sort on product_addons(product_id, sort_order);

-- Unique constraint: prevent duplicate addon names per product
create unique index idx_product_addons_unique_name on product_addons(product_id, lower(name));

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

create trigger update_product_addons_updated_at before update on product_addons
  for each row execute function update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
alter table product_addons enable row level security;

-- Product Add-ons: Verify tenant ownership via products table

create policy "Users can view product addons in their tenant"
  on product_addons for select
  using (
    exists (
      select 1 from products
      where products.id = product_addons.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can insert product addons"
  on product_addons for insert
  with check (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from products
      where products.id = product_addons.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can update product addons"
  on product_addons for update
  using (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from products
      where products.id = product_addons.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can delete product addons"
  on product_addons for delete
  using (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from products
      where products.id = product_addons.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );
