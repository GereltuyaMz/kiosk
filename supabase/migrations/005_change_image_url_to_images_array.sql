-- Migration: Change products.image_url (text) to products.images (text[])
-- This allows products to have multiple images instead of just one

-- Step 1: Add new images column as array
ALTER TABLE products ADD COLUMN images text[] DEFAULT '{}';

-- Step 2: Migrate existing image_url data to images array
-- If image_url exists, add it as the first element in the images array
UPDATE products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Step 3: Drop the old image_url column
ALTER TABLE products DROP COLUMN image_url;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN products.images IS 'Array of image URLs for the product (supports multiple images)';
