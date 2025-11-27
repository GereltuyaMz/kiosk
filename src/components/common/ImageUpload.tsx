"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadImage, getPublicUrl, type BucketName } from "@/lib/storage/upload";
import { getStorageUploadContext } from "@/lib/storage/actions";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket: BucketName;
  disabled?: boolean;
  label?: string;
  error?: string;
};

export const ImageUpload = ({
  value,
  onChange,
  bucket,
  disabled = false,
  label = "Image",
  error,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const contextResult = await getStorageUploadContext();
      if (!contextResult.success) {
        throw new Error(contextResult.error);
      }

      const path = await uploadImage(file, bucket, contextResult.data.tenantId);
      const url = getPublicUrl(path, bucket);

      onChange(url);
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

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [disabled, isUploading]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {value && !isUploading ? (
        <div className="relative border rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "cursor-wait",
            !value && !isUploading && "hover:border-primary/50"
          )}
        >
          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Drag & drop image here</p>
                <p className="text-muted-foreground">or click to browse</p>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP (max 10MB)
              </p>
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
        disabled={disabled || isUploading}
      />

      {(uploadError || error) && (
        <p className="text-sm text-red-600">{uploadError || error}</p>
      )}
    </div>
  );
};
