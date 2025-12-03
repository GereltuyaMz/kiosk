-- =============================================
-- ENUM TYPES FOR ORDERS
-- =============================================

create type dine_type_enum as enum ('EAT_IN', 'TAKE_OUT');
create type order_status_enum as enum ('NEW', 'PREPARING', 'READY', 'COMPLETED');
create type receipt_type_enum as enum ('INDIVIDUAL', 'ORGANIZATION');

-- =============================================
-- ORDERS TABLE
-- =============================================

create table orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  created_by uuid references merchant_users(id) on delete set null,
  order_number int not null check (order_number >= 1 and order_number <= 300),

  dine_type dine_type_enum not null,
  status order_status_enum not null default 'NEW',
  receipt_type receipt_type_enum not null,

  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  is_paid boolean not null default false,
  payment_method text,
  payment_reference text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_orders_tenant_id on orders(tenant_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at desc);
create index idx_orders_order_number on orders(order_number);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null,
  product_name text not null check (length(product_name) <= 200),
  quantity int not null check (quantity > 0),
  base_price numeric(10,2) not null default 0 check (base_price >= 0),
  total_price numeric(10,2) not null default 0 check (total_price >= 0),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);

-- =============================================
-- ORDER ITEM OPTIONS TABLE
-- =============================================

create table order_item_options (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  type text not null check (type in ('VARIANT', 'ADDON', 'MODIFIER')),
  name text not null check (length(name) <= 100),
  value text check (length(value) <= 100),
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_order_item_options_order_item_id on order_item_options(order_item_id);
create index idx_order_item_options_type on order_item_options(type);

-- =============================================
-- FUNCTION TO GET NEXT ORDER NUMBER (1-300 with reset)
-- =============================================

create or replace function get_next_order_number(p_tenant_id uuid)
returns int
language plpgsql
as $$
declare
  v_last_order_number int;
  v_next_order_number int;
begin
  -- Get the last order number for this tenant
  select order_number into v_last_order_number
  from orders
  where tenant_id = p_tenant_id
  order by created_at desc
  limit 1;

  -- If no orders exist, start at 1
  if v_last_order_number is null then
    v_next_order_number := 1;
  -- If last order was 300, reset to 1
  elsif v_last_order_number >= 300 then
    v_next_order_number := 1;
  -- Otherwise increment by 1
  else
    v_next_order_number := v_last_order_number + 1;
  end if;

  return v_next_order_number;
end;
$$;

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================

create trigger update_orders_updated_at before update on orders
  for each row execute function update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_item_options enable row level security;

-- Orders: Tenant-scoped access
create policy "Users can view orders in their tenant"
  on orders for select
  using (tenant_id = public.get_current_user_tenant_id());

create policy "Kiosk and Staff users can insert orders"
  on orders for insert
  with check (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() in ('ADMIN', 'STAFF', 'KIOSK')
  );

create policy "Staff and Kitchen users can update orders"
  on orders for update
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() in ('ADMIN', 'STAFF', 'KITCHEN')
  );

create policy "Admins can delete orders"
  on orders for delete
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

-- Order Items: Access via orders table
create policy "Users can view order items in their tenant"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Users can insert order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.tenant_id = public.get_current_user_tenant_id()
    )
    and public.get_current_user_role() in ('ADMIN', 'STAFF', 'KIOSK')
  );

-- Order Item Options: Access via order_items table
create policy "Users can view order item options in their tenant"
  on order_item_options for select
  using (
    exists (
      select 1 from order_items
      join orders on orders.id = order_items.order_id
      where order_items.id = order_item_options.order_item_id
      and orders.tenant_id = public.get_current_user_tenant_id()
    )
  );

create policy "Users can insert order item options"
  on order_item_options for insert
  with check (
    exists (
      select 1 from order_items
      join orders on orders.id = order_items.order_id
      where order_items.id = order_item_options.order_item_id
      and orders.tenant_id = public.get_current_user_tenant_id()
    )
    and public.get_current_user_role() in ('ADMIN', 'STAFF', 'KIOSK')
  );
