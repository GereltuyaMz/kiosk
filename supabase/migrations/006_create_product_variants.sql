-- =============================================
-- PRODUCT VARIANTS TABLES
-- =============================================

-- Variant groups (e.g., "Size", "Type", "Crust")
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null check (length(name) <= 100),
  is_required boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_product_variants_product_sort on product_variants(product_id, sort_order);

-- Unique constraint: prevent duplicate variant group names per product
create unique index idx_product_variants_unique_name on product_variants(product_id, lower(name));

-- Variant options (e.g., "Small", "Medium", "Large")
create table variant_options (
  id uuid primary key default uuid_generate_v4(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  name text not null check (length(name) <= 100),
  price_modifier numeric(10,2) not null default 0 check (price_modifier >= -99999.99 and price_modifier <= 99999.99),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_variant_options_variant_sort on variant_options(variant_id, sort_order);

-- Unique constraint: prevent duplicate option names per variant group
create unique index idx_variant_options_unique_name on variant_options(variant_id, lower(name));

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================

create trigger update_product_variants_updated_at before update on product_variants
  for each row execute function update_updated_at_column();

create trigger update_variant_options_updated_at before update on variant_options
  for each row execute function update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
alter table product_variants enable row level security;
alter table variant_options enable row level security;

-- Product Variants: Verify tenant ownership via products table

create policy "Users can view product variants in their tenant"
  on product_variants for select
  using (
    exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can insert product variants"
  on product_variants for insert
  with check (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can update product variants"
  on product_variants for update
  using (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can delete product variants"
  on product_variants for delete
  using (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

-- Variant Options: Verify tenant ownership via product_variants → products

create policy "Users can view variant options in their tenant"
  on variant_options for select
  using (
    exists (
      select 1 from product_variants
      join products on products.id = product_variants.product_id
      where product_variants.id = variant_options.variant_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can insert variant options"
  on variant_options for insert
  with check (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from product_variants
      join products on products.id = product_variants.product_id
      where product_variants.id = variant_options.variant_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can update variant options"
  on variant_options for update
  using (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from product_variants
      join products on products.id = product_variants.product_id
      where product_variants.id = variant_options.variant_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Admins can delete variant options"
  on variant_options for delete
  using (
    public.get_current_user_role() = 'ADMIN'
    and exists (
      select 1 from product_variants
      join products on products.id = product_variants.product_id
      where product_variants.id = variant_options.variant_id
      and products.tenant_id = public.get_current_user_tenant_id()
    )
  );
