# Authentication Setup Instructions

## Step 1: Run the Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content from `/supabase/migrations/001_initial_schema.sql`
4. Click **Run** to execute the migration

This will create:
- `tenants` table
- `merchant_users` table (linked to Supabase Auth)
- `categories` table
- `products` table
- All RLS policies
- Demo tenant with ID: `a7f3e8c9-4b2d-4f1a-9c3e-8d5b7f9e2a1c`

## Step 2: Create Test Admin User

### 2.1 Create user in Supabase Auth

Go to **Authentication** > **Users** in Supabase Dashboard, click **Add User**, then enter:
- **Email:** admin@demo.com
- **Password:** admin123
- Click **Create User**

**IMPORTANT:** Copy the UUID of the newly created user (you'll see it in the users list)

### 2.2 Link user to merchant_users table

Go back to **SQL Editor** and run this command (replace `YOUR_AUTH_USER_UUID` with the actual UUID you copied):

```sql
insert into merchant_users (id, tenant_id, email, full_name, role)
values (
  '08979cb4-a0ca-42b2-9ef4-47fd36b0d1cb',  -- Replace this with the actual auth user UUID
  'a7f3e8c9-4b2d-4f1a-9c3e-8d5b7f9e2a1c',
  'admin@demo.com',
  'Demo Admin',
  'ADMIN'
);
```

## Step 3: Test Login

1. Run `bun dev` to start the development server
2. Navigate to `http://localhost:3000/login`
3. Login with:
   - **Email:** admin@demo.com
   - **Password:** admin123
4. You should be redirected to `/admin` dashboard

## Troubleshooting

If login fails:
- Check that the user exists in **Authentication** > **Users**
- Verify the user is linked in `merchant_users` table (SQL Editor: `select * from merchant_users`)
- Check that the `id` in `merchant_users` matches the auth user's UUID
- Ensure the user's `is_active` is `true`
