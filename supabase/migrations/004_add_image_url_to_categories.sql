-- =============================================
-- ADD IMAGE_URL TO CATEGORIES TABLE
-- =============================================

-- Add image_url column to categories table (nullable - optional field)
alter table categories add column image_url text;

-- Add comment explaining the column's purpose
comment on column categories.image_url is 'Optional URL to category image in Supabase Storage';
