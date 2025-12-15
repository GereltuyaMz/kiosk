-- =============================================
-- PAYMENT SETTINGS TABLE (QPay + eBarimt)
-- =============================================

create table payment_settings (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null unique references tenants(id) on delete cascade,

  -- QPay Settings
  qpay_merchant_id text,
  qpay_api_key text,
  qpay_secret_key text,
  qpay_is_active boolean default false,

  -- eBarimt Settings
  ebarimt_merchant_tin text,
  ebarimt_pos_no text,
  ebarimt_branch_no text default '000',
  ebarimt_district_code text,
  ebarimt_client_id text,
  ebarimt_client_secret text,
  ebarimt_is_active boolean default false,
  ebarimt_env text default 'staging' check (ebarimt_env in ('staging', 'production')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_payment_settings_tenant_id on payment_settings(tenant_id);

-- Trigger for updated_at
create trigger update_payment_settings_updated_at before update on payment_settings
  for each row execute function update_updated_at_column();

-- =============================================
-- ADD EBARIMT FIELDS TO ORDERS TABLE
-- =============================================

alter table orders
  add column ebarimt_id text,
  add column ebarimt_lottery text,
  add column ebarimt_qr_data text,
  add column ebarimt_response jsonb,
  add column ebarimt_error text,
  add column ebarimt_created_at timestamptz;

-- Index for looking up orders by eBarimt ID
create index idx_orders_ebarimt_id on orders(ebarimt_id);

-- =============================================
-- ADD CLASSIFICATION CODE TO PRODUCTS TABLE
-- =============================================

-- Classification code for eBarimt reporting
-- Default: 5610101 = Restaurant food service
alter table products
  add column classification_code bigint default 5610101;

comment on column products.classification_code is 'eBarimt classification code. Common: 5610101=Restaurants, 5610201=Catering, 5630001=Beverage serving';

-- =============================================
-- EBARIMT RETRY QUEUE TABLE
-- =============================================

create table ebarimt_retry_queue (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  request_payload jsonb not null,
  error_message text,
  retry_count int not null default 0,
  max_retries int not null default 5,
  next_retry_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_ebarimt_retry_queue_order_id on ebarimt_retry_queue(order_id);
create index idx_ebarimt_retry_queue_tenant_id on ebarimt_retry_queue(tenant_id);

-- Index for finding orders to retry (only pending retries)
create index idx_ebarimt_retry_pending
  on ebarimt_retry_queue(next_retry_at)
  where retry_count < max_retries;

-- Trigger for updated_at
create trigger update_ebarimt_retry_queue_updated_at before update on ebarimt_retry_queue
  for each row execute function update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
alter table payment_settings enable row level security;
alter table ebarimt_retry_queue enable row level security;

-- Payment Settings: Tenant-scoped access
create policy "Users can view payment settings in their tenant"
  on payment_settings for select
  using (tenant_id = public.get_current_user_tenant_id());

create policy "Admins can insert payment settings"
  on payment_settings for insert
  with check (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

create policy "Admins can update payment settings"
  on payment_settings for update
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

create policy "Admins can delete payment settings"
  on payment_settings for delete
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );

-- eBarimt Retry Queue: Tenant-scoped access
create policy "Users can view retry queue in their tenant"
  on ebarimt_retry_queue for select
  using (tenant_id = public.get_current_user_tenant_id());

create policy "System can insert into retry queue"
  on ebarimt_retry_queue for insert
  with check (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() in ('ADMIN', 'STAFF', 'KIOSK')
  );

create policy "System can update retry queue"
  on ebarimt_retry_queue for update
  using (tenant_id = public.get_current_user_tenant_id());

create policy "Admins can delete from retry queue"
  on ebarimt_retry_queue for delete
  using (
    tenant_id = public.get_current_user_tenant_id()
    and public.get_current_user_role() = 'ADMIN'
  );
