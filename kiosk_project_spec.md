# Kiosk Project — MVP Phase 1 (3–4 Weeks)

## 1. Introduction

A multi-tenant kiosk platform consisting of:

- **Admin Panel** – merchants configure menu & settings.
- **Kiosk UI** – customer-facing ordering interface.
- **Kitchen Display System (KDS)** – kitchen manages orders.

All platforms run on the same website with separate routes:
/admin  
/kiosk  
/kitchen

System identifies tenants using **login-based authentication** (no device pairing).

## 2. Project Goal

Deliver a fully working self-service kiosk system usable by restaurants, cafés, bars, and fast food businesses, ready for demo and early real customers.

**End-to-end goal:**  
Merchant logs in → builds menu → kiosk takes paid orders → kitchen fulfills them.

## 3. Core Components

- **Admin Panel**

  - Categories
  - Products
  - Variants, Add-ons, Modifiers
  - Branding
  - Payment settings (QPay)
  - Live order list

- **Kiosk UI**

  - Customer-facing UI
  - Menu browsing, detail page
  - Cart & order customization
  - Dine-Type (Eat-in / Take-out)
  - QPay QR Payment
  - Success page

- **Kitchen (KDS)**
  - NEW → PREPARING → READY → COMPLETED
  - Realtime updates
  - Large order cards

## 4. MVP Phase 1 (3–4 Weeks)

### 4.1 Goal

Deliver a complete flow:
Admin → Kiosk → Payment → Kitchen → Admin (orders)

### 4.2 Requirements

- Merchant login system
- Multi-tenant menu management
- Customer ordering experience
- Kitchen order display
- QPay payment integration
- Realtime order updates

### 4.3 Features

- Admin CRUD for all menu data
- Kiosk product selection + order build
- Payment confirmation → create order
- KDS displays paid orders in real time

### 4.4 Tech Stack

- **Next.js (TypeScript)** – Frontend + API
- **Supabase** – Auth, DB, Storage, Realtime
- **TailwindCSS** – Styling
- **Shadcn UI** – Components
- **QPay** – Payment provider

## 5. Weekly Plan (Minimal + Direct)

### Week 1 — Admin Panel

- Login
- Categories CRUD
- Products CRUD
- Variants / Add-ons / Modifiers
- Branding & Payment settings

### Week 2 — Kiosk & KDS Structure

- Kiosk login
- Load tenant menu
- Category → Product → Cart flow
- Dine-type selection
- KDS login
- KDS 3-column layout (NEW / PREPARING / READY)
- Realtime setup

### Week 3 — Payment + Integration

- QPay QR
- Payment polling
- On success → create `order`
- KDS receives paid orders
- Admin sees live orders
- Polish & test

## 6. Basic UI Flows

### 6.1 Admin Panel Flow

Login → Dashboard → Categories → Products → Product Detail → Variants/Add-ons/Modifiers → Branding → Payment Settings → Orders

### 6.2 Kiosk Flow

Login → Category List → Product List → Product Detail → Cart → Dine-Type (Eat-in/Take-out) → QPay QR → Payment Success → Home

### 6.3 Kitchen Flow

Login → KDS Main View → NEW → PREPARING → READY → COMPLETED

---

## 7. Database Schema (Summary)

### Tenants

- id
- name
- logo/theme

### Merchant Users

- id
- tenant_id
- email/password
- role (ADMIN, KIOSK, KITCHEN)

### Menu

- categories
- products
- product_variants + variant_options
- product_addons
- product_modifiers + modifier_options

### Orders

- orders
- order_items
- order_item_options

### Payment

- payment_settings

---

## 8. Full SQL Schema

```sql
-- ENUM TYPES
create type dine_type_enum as enum ('EAT_IN', 'TAKE_OUT');
create type order_status_enum as enum ('NEW', 'PREPARING', 'READY', 'COMPLETED');

-- TENANTS
create table tenants (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    logo_url text,
    theme_color text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- USERS (Admin / Kiosk / Kitchen)
create table merchant_users (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    email text unique,
    password_hash text,
    role text not null check (role in ('ADMIN','STAFF','KIOSK','KITCHEN')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- MENU TABLES
create table categories (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name text not null,
    image_url text,
    sort_order int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table products (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    category_id uuid references categories(id) on delete set null,
    name text not null,
    description text,
    base_price numeric default 0,
    image_url text,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products(id) on delete cascade,
    name text not null,
    is_required boolean default false,
    sort_order int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table variant_options (
    id uuid primary key default gen_random_uuid(),
    variant_id uuid references product_variants(id) on delete cascade,
    name text not null,
    price_modifier numeric default 0,
    sort_order int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table product_addons (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products(id) on delete cascade,
    name text not null,
    price numeric default 0,
    max_quantity int default 1,
    sort_order int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table product_modifiers (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products(id) on delete cascade,
    name text not null,
    is_required boolean default false,
    is_multi_select boolean default false,
    sort_order int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table modifier_options (
    id uuid primary key default gen_random_uuid(),
    modifier_id uuid references product_modifiers(id) on delete cascade,
    name text not null,
    sort_order int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ORDERS (Kitchen + Kiosk)
create table orders (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,

    created_by uuid references merchant_users(id) on delete set null,
    order_number serial,

    dine_type dine_type_enum not null,
    status order_status_enum not null default 'NEW',

    is_paid boolean default false,
    payment_method text,
    payment_reference text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    product_id uuid not null,
    product_name text not null,
    quantity int not null,
    base_price numeric default 0,
    total_price numeric default 0,
    created_at timestamptz default now()
);

create table order_item_options (
    id uuid primary key default gen_random_uuid(),
    order_item_id uuid references order_items(id) on delete cascade,
    type text not null check (type in ('VARIANT','ADDON','MODIFIER')),
    name text not null,
    price numeric default 0,
    created_at timestamptz default now()
);

-- PAYMENT SETTINGS
create table payment_settings (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    qpay_merchant_id text,
    qpay_api_key text,
    qpay_secret_key text,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```
