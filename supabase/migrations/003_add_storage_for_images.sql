-- =============================================
-- STORAGE RLS POLICIES FOR IMAGE UPLOADS
-- =============================================
-- Note: RLS is already enabled on storage.objects by default in Supabase

-- =============================================
-- PRODUCT IMAGES BUCKET POLICIES
-- =============================================

-- Users can view product images from their tenant
create policy "Users can view product images from their tenant"
  on storage.objects for select
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
  );

-- Admins can upload product images
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
    and public.get_current_user_role() = 'ADMIN'
  );

-- Admins can delete product images
create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
    and public.get_current_user_role() = 'ADMIN'
  );

-- =============================================
-- CATEGORY IMAGES BUCKET POLICIES
-- =============================================

-- Users can view category images from their tenant
create policy "Users can view category images from their tenant"
  on storage.objects for select
  using (
    bucket_id = 'category-images'
    and (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
  );

-- Admins can upload category images
create policy "Admins can upload category images"
  on storage.objects for insert
  with check (
    bucket_id = 'category-images'
    and (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
    and public.get_current_user_role() = 'ADMIN'
  );

-- Admins can delete category images
create policy "Admins can delete category images"
  on storage.objects for delete
  using (
    bucket_id = 'category-images'
    and (storage.foldername(name))[1] = public.get_current_user_tenant_id()::text
    and public.get_current_user_role() = 'ADMIN'
  );
