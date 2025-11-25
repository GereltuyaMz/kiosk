# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-tenant kiosk platform for restaurants, cafés, bars, and fast food businesses. The system consists of three main interfaces running on the same Next.js application:

- **Admin Panel** (`/admin`) - Merchants configure menus, categories, products, variants, add-ons, modifiers, branding, payment settings, and view orders
- **Kiosk UI** (`/kiosk`) - Customer-facing ordering interface with menu browsing, cart, dine-type selection, and QPay payment
- **Kitchen Display System** (`/kitchen`) - Kitchen manages orders with status workflow: NEW → PREPARING → READY → COMPLETED

The system uses **login-based authentication** to identify tenants (no device pairing).

## Tech Stack

- **Next.js 16** (App Router) with TypeScript
- **React 19** with React 19 DOM
- **Supabase** - Authentication, Database (PostgreSQL), Storage, Realtime subscriptions
- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **Shadcn UI** (New York style) - Pre-built component library
- **Radix UI** - Accessible UI primitives
- **React Hook Form** + **Zod** - Form validation
- **QPay** - Payment provider integration
- **Lucide React** - Icon library

## Development Commands

```bash
# Start development server (http://localhost:3000)
bun dev

# Build for production
bun run build

# Start production server
bun start

# Run linter
bun run lint

# Run type checking
bun run typecheck
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Geist fonts
│   └── page.tsx           # Home page
├── components/
│   └── ui/                # Shadcn UI components (pre-installed)
├── hooks/                 # Custom React hooks (e.g., use-mobile)
└── lib/
    └── utils.ts           # Utility functions (cn, etc.)
```

### Route Structure (To Be Implemented)

- `/admin` - Admin panel for merchants
- `/kiosk` - Customer-facing kiosk interface
- `/kitchen` - Kitchen display system

## Database Architecture

The system uses Supabase with a multi-tenant PostgreSQL schema:

### Core Tables

- `tenants` - Merchant organizations with branding (logo, theme)
- `merchant_users` - User accounts with roles: ADMIN, STAFF, KIOSK, KITCHEN
- `categories` - Menu categories (tenant-scoped)
- `products` - Menu items with base pricing (tenant-scoped)
- `product_variants` - Size/type variants (e.g., Small/Medium/Large) with price modifiers
- `variant_options` - Individual variant choices
- `product_addons` - Extra items (e.g., Extra Cheese) with fixed pricing
- `product_modifiers` - Customization groups (e.g., Sauce Selection) with multi-select support
- `modifier_options` - Individual modifier choices
- `orders` - Customer orders with dine type (EAT_IN/TAKE_OUT) and status
- `order_items` - Line items in orders
- `order_item_options` - Selected variants, addons, and modifiers for each item
- `payment_settings` - QPay API credentials per tenant
to see the full sql schema please see: `/kiosk_project_spec.md`

### Key Relationships

- All menu data (categories, products, variants, addons, modifiers) is **tenant-scoped** via `tenant_id`
- Products have optional `category_id` (nullable)
- Variants and options support **price modifiers** (delta from base price)
- Modifiers support **required** and **multi-select** flags
- Orders track payment status via `is_paid`, `payment_method`, `payment_reference`

## Configuration Files

- `tsconfig.json` - TypeScript with strict mode, path alias `@/*` maps to `./src/*`
- `components.json` - Shadcn UI config (New York style, RSC enabled)
- `eslint.config.mjs` - ESLint with Next.js recommended rules
- `next.config.ts` - Next.js configuration (default)
- `package.json` - Bun as package manager (see `bun.lock`)

## Development Notes

### Styling

- **Tailwind CSS 4** with CSS variables for theming
- Base color: `neutral`
- Dark mode support via `next-themes`
- Font system: Geist Sans + Geist Mono

### Authentication Flow

Users log in with email/password → System identifies `tenant_id` and `role` → Routes user to appropriate interface (admin/kiosk/kitchen)

### Realtime Features

Orders should update in real-time across:
- Admin panel (live order list)
- Kitchen display (new orders appear instantly)

Use Supabase Realtime subscriptions on the `orders` table filtered by `tenant_id`.

### Payment Integration

QPay QR code flow:
1. Generate QR code via QPay API (merchant credentials from `payment_settings`)
2. Display QR to customer on kiosk
3. Poll QPay API for payment confirmation
4. On success → Create order in `orders` table with `is_paid=true`
5. Order appears in kitchen display

## MVP Phases

### Week 1 - Admin Panel
- Login system
- Categories CRUD
- Products CRUD
- Variants/Add-ons/Modifiers management
- Branding & Payment settings

### Week 2 - Kiosk & KDS Structure
- Kiosk login
- Load tenant menu
- Category → Product → Cart flow
- Dine-type selection
- KDS login & 3-column layout
- Realtime setup

### Week 3 - Payment & Integration
- QPay QR integration
- Payment polling
- Order creation on payment success
- End-to-end testing

## Important Implementation Details

- **Multi-tenancy**: Always filter queries by `tenant_id` from authenticated user
- **Order Numbers**: Use `order_number` serial field for display (not UUID)
- **Price Calculation**: Base price + variant modifiers + addon prices
- **Soft Deletes**: Use `is_active` flag on products rather than hard deletes
- **Timestamps**: All tables have `created_at` and `updated_at` (update via triggers)

## Developer Preferences

1. Be concise and direct — write code and explanations only when necessary. Avoid filler or self-explaining comments.
2. Limit comments to logic that is complex, non-obvious, or needs future context.
3. Follow project conventions — match existing folder structure, naming, linting, and formatting. Don’t invent new patterns unless explicitly told.
4. Understand the current context before coding — analyze existing files, read nearby code, and infer intent from structure.
5. If uncertain, ask in chat — don’t make assumptions that change architecture or dependencies.
6. Think long-term — suggest scalable, maintainable patterns when relevant.

### Coding Style

- Use **arrow functions** and **named exports** for all React components.
- Limit files to **≤170 lines**; if longer, split into smaller components.
- Prefer **type** over **interface** in UI-related files (`components`, `pages`).
  - Exception: use `interface` if extending another type or describing an object shape more clearly.
- Maintain consistent **imports order** (React → libraries → local files).
- Always use **TypeScript strict mode** and explicit return types where possible.
- Keep component files self-contained — avoid unnecessary props drilling or global state unless required.
- Use clear, semantic naming for files and variables and specific (e.g., `LessonCard`, not `Card1`).
- Destructure imports when possible (eg. import { foo } from 'bar') and spread operators
- Be sure to typecheck when you’re done making a series of code changes, DO NOT UUSE ANY TYPE!!
<!-- - Make sure to use the `/src/types/database` that created based on supabase table, to limit repeated types in UI if possible -->
- If the function is gonna used 2+ places then make the function in `/src/lib/utils.ts` file
- Mobile-first approach: Start with mobile styles, add md: and lg: for larger screens
  - Reusable patterns: If you use the same responsive grid/layout 2+ times, extract it to /src/lib/utils.ts or a shared component
  - Test breakpoints: Common responsive issues happen at md (768px) and lg (1024px)
  - Typography scale: Use responsive text sizes (text-base md:text-lg lg:text-xl)
  - Spacing: Use responsive padding/margin (p-4 md:p-6 lg:p-8)
- If the imported component, function, hook and etc... not used anymore then delete the import
- Use DRY Principle, KISS principle, and Separation of Concerns on every code file
- Implement Barrel Exports for Better Import Organization

### Database structure

- Read the `/supabase/migrations/*` to understand the current database structure and what function we could use in the frontend, if it's not usable, then think about is the function need to implemented in supabase's function or trigger, the commented ones are not yet implemented one

### Added memories
- the database schema in /kiosk_project_spec.md is not defined yet, it can be changed when developing
- think twice when adding any policy in supabase database