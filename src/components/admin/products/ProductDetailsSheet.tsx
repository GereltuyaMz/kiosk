"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Package,
  DollarSign,
  ArrowUpDown,
  Calendar,
  Folder,
  FileText,
  Settings2,
  Plus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProductWithDetails } from "@/lib/admin/products/actions";
import type { Product, ProductVariant, ProductAddon } from "@/lib/admin/products/types";
import type { Category } from "@/lib/admin/categories/types";

type ProductDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
};

export const ProductDetailsSheet = ({
  open,
  onOpenChange,
  product,
  categories,
}: ProductDetailsSheetProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!product?.id || !open) return;

      setLoading(true);
      const result = await getProductWithDetails(product.id);

      if (result.success) {
        setVariants(result.data.variants);
        setAddons(result.data.addons);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [product?.id, open]);

  if (!product) return null;

  const category = categories.find((c) => c.id === product.category_id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </SheetTitle>
            <SheetDescription>
              View comprehensive product information
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            {/* Product Image */}
            <div className="rounded-lg border overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <div className="relative w-full h-56">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-muted/50 to-muted flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">No image available</p>
                </div>
              )}
            </div>

            {/* Product Name & Status */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold leading-tight flex-1">
                  {product.name}
                </h3>
                <Badge
                  variant={product.is_active ? "default" : "secondary"}
                  className={`shrink-0 ${
                    product.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Product Information */}
            <div className="space-y-4">
              {/* Base Price */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-background rounded-md">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Base Price</p>
                  <p className="text-base font-semibold">
                    ₮{Number(product.base_price).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-background rounded-md">
                  <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                  <p className="text-sm font-medium">
                    {category ? category.name : "Uncategorized"}
                  </p>
                </div>
              </div>

              {/* Display Order */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 bg-background rounded-md">
                  <ArrowUpDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Display Order</p>
                  <p className="text-sm font-medium">
                    {product.display_order ?? "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Variants */}
            {variants.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Variants</h4>
                  </div>
                  <div className="space-y-3 pl-6">
                    {variants.map((variant) => (
                      <div key={variant.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{variant.name}</p>
                          {variant.is_required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 pl-4">
                          {variant.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                • {option.name}
                              </span>
                              <span className="text-xs font-medium">
                                {option.price_modifier > 0 && "+"}
                                ₮{option.price_modifier.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Addons */}
            {addons.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">Add-ons</h4>
                  </div>
                  <div className="space-y-2 pl-6">
                    {addons.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">• {addon.name}</span>
                        <span className="text-xs font-medium">
                          ₮{Number(addon.price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Timeline</h4>
              </div>
              <div className="space-y-2 pl-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium text-xs">
                    {new Date(product.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium text-xs">
                    {new Date(product.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
