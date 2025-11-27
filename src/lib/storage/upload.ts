import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 10;

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp",
};

export type BucketName = "product-images" | "category-images";

async function validateFile(file: File): Promise<void> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
  }

  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    throw new Error(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
  }
}

async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch (error) {
    console.error("Image compression failed:", error);
    throw new Error("Failed to optimize image");
  }
}

export async function uploadImage(
  file: File,
  bucket: BucketName,
  tenantId: string
): Promise<string> {
  await validateFile(file);
  const compressed = await compressImage(file);

  const fileName = `${crypto.randomUUID()}.webp`;
  const filePath = `${tenantId}/${fileName}`;

  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, compressed, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return data.path;
}

export async function deleteImage(
  imageUrl: string,
  bucket: BucketName
): Promise<void> {
  if (!imageUrl) return;

  const pathMatch = imageUrl.match(/\/object\/public\/[^/]+\/(.+)$/);
  if (!pathMatch) throw new Error("Invalid image URL format");

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([pathMatch[1]]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export function getPublicUrl(path: string, bucket: BucketName): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
