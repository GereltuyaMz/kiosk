"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadImage, getPublicUrl, type BucketName } from "@/lib/storage/upload";
import { getStorageUploadContext } from "@/lib/storage/actions";
import { cn } from "@/lib/utils";

type MultiImageUploadProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: BucketName;
  disabled?: boolean;
  label?: string;
  error?: string;
  maxImages?: number;
};

export const MultiImageUpload = ({
  value,
  onChange,
  bucket,
  disabled = false,
  label = "Images",
  error,
  maxImages = 5,
}: MultiImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = value.length < maxImages;

  const handleUpload = async (file: File) => {
    if (!canAddMore) {
      setUploadError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const contextResult = await getStorageUploadContext();
      if (!contextResult.success) {
        throw new Error(contextResult.error);
      }

      const path = await uploadImage(file, bucket, contextResult.data.tenantId);
      const url = getPublicUrl(path, bucket);

      onChange([...value, url]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading || !canAddMore) return;

      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [disabled, isUploading, canAddMore]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading && canAddMore) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
    setUploadError(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading && canAddMore) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative border rounded-lg overflow-hidden">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "cursor-wait",
            "hover:border-primary/50"
          )}
        >
          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-xs">
                <p className="font-medium">Add image ({value.length}/{maxImages})</p>
                <p className="text-muted-foreground">Drag & drop or click</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || isUploading || !canAddMore}
      />

      {(uploadError || error) && (
        <p className="text-sm text-red-600">{uploadError || error}</p>
      )}
    </div>
  );
};
