-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role_enum as enum ('ADMIN', 'STAFF', 'KIOSK', 'KITCHEN');

-- =============================================
-- TENANTS TABLE
-- =============================================
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  theme_colors jsonb default '{"primary": "#000000", "secondary": "#ffffff"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- MERCHANT USERS TABLE
-- =============================================
-- Note: This table links to Supabase Auth (auth.users)
-- The id should match the user's auth.uid()
create table merchant_users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role_enum not null default 'STAFF',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_merchant_users_tenant_id on merchant_users(tenant_id);
create index idx_merchant_users_email on merchant_users(email);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_tenant_id on categories(tenant_id);
create index idx_categories_display_order on categories(display_order);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  base_price decimal(10,2) not null check (base_price >= 0),
  image_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_tenant_id on products(tenant_id);
create index idx_products_category_id on products(category_id);
create index idx_products_is_active on products(is_active);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers
create trigger update_tenants_updated_at before update on tenants
  for each row execute function update_updated_at_column();

create trigger update_merchant_users_updated_at before update on merchant_users
  for each row execute function update_updated_at_column();

create trigger update_categories_updated_at before update on categories
  for each row execute function update_updated_at_column();

create trigger update_products_updated_at before update on products
  for each row execute function update_updated_at_column();

-- =============================================
-- HELPER FUNCTIONS FOR RLS (AVOID CIRCULAR DEPENDENCIES)
-- =============================================

-- Get current user's tenant_id (bypasses RLS to avoid infinite recursion)
create or replace function public.get_current_user_tenant_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select tenant_id from merchant_users where id = auth.uid() limit 1;
$$;

-- Get current user's role (bypasses RLS to avoid infinite recursion)
create or replace function public.get_current_user_role()
returns user_role_enum
language sql
security definer
set search_path = public
stable
as $$
  select role from merchant_users where id = auth.uid() limit 1;
$$;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
alter table tenants enable row level security;
alter table merchant_users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;

-- Tenants: Users can only see their own tenant
create policy "Users can view their own tenant"
  on tenants for select
  using (id = public.get_current_user_tenant_id());

-- Merchant Users: Users can see users in their tenant
create policy "Users can view users in their tenant"
  on merchant_users for select
  using (
    id = auth.uid()
    or tenant_id = public.get_current_user_tenant_id()
  );

-- Categories: Tenant-scoped access
create policy "Users can view categories in their tenant"
  on categories for select
  using (tenant_id = public.get_current_user_tenant_id());

create policy "Admins can insert categories"
  on categories for insert
  with check (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

create policy "Admins can update categories"
  on categories for update
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

create policy "Admins can delete categories"
  on categories for delete
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

-- Products: Tenant-scoped access
create policy "Users can view products in their tenant"
  on products for select
  using (tenant_id = public.get_current_user_tenant_id());

create policy "Admins can insert products"
  on products for insert
  with check (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

create policy "Admins can update products"
  on products for update
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

create policy "Admins can delete products"
  on products for delete
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

-- =============================================
-- SEED DATA
-- =============================================

-- Insert test tenant
insert into tenants (id, name, theme_colors) values
  ('a7f3e8c9-4b2d-4f1a-9c3e-8d5b7f9e2a1c', 'Demo Restaurant', '{"primary": "#ef4444", "secondary": "#1f2937"}');

-- Note: To create the first admin user, you need to:
-- 1. Create user in Supabase Auth (via Dashboard or API)
-- 2. Then insert into merchant_users with matching ID
-- Example:
-- insert into merchant_users (id, tenant_id, email, full_name, role) values
--   ('auth-user-uuid-here', 'a7f3e8c9-4b2d-4f1a-9c3e-8d5b7f9e2a1c', 'admin@demo.com', 'Demo Admin', 'ADMIN');
