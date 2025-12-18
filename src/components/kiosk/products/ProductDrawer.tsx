"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Check, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductDetailsSkeleton } from "./ProductDetailsSkeleton";
import type { CartItem, ProductVariant } from "@/types/kiosk";
import type { Product } from "@/lib/admin/products/types";
import type { ProductDetails } from "@/types/kiosk";

type ProductDrawerProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  fetchProductDetails: (productId: string) => Promise<ProductDetails | null>;
  getCachedProduct: (productId: string) => ProductDetails | null;
};

export const KioskProductDrawer = ({
  product,
  open,
  onClose,
  onAddToCart,
  fetchProductDetails,
  getCachedProduct,
}: ProductDrawerProps) => {
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProductDetails = async () => {
      if (!product || !open) return;

      const cached = getCachedProduct(product.id);
      if (cached) {
        setProductDetails(cached);
        setLoading(false);

        const defaultVariants: Record<string, string> = {};
        cached.variants.forEach((variant: ProductVariant) => {
          if (variant.options.length > 0) {
            defaultVariants[variant.id] = variant.options[0].id;
          }
        });
        setSelectedVariants(defaultVariants);
        return;
      }

      setLoading(true);
      try {
        const details = await fetchProductDetails(product.id);

        if (details) {
          setProductDetails(details);

          const defaultVariants: Record<string, string> = {};
          details.variants.forEach((variant: ProductVariant) => {
            if (variant.options.length > 0) {
              defaultVariants[variant.id] = variant.options[0].id;
            }
          });
          setSelectedVariants(defaultVariants);
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [product, open, fetchProductDetails, getCachedProduct]);

  useEffect(() => {
    if (!open) {
      setSelectedAddons([]);
      setQuantity(1);
    }
  }, [open]);

  const basePrice = product ? Number(product.base_price) : 0;

  const variantsPrice =
    productDetails?.variants.reduce((sum, variant) => {
      const selectedOptionId = selectedVariants[variant.id];
      const option = variant.options.find((opt) => opt.id === selectedOptionId);
      return sum + (option?.price_modifier || 0);
    }, 0) || 0;

  const addonsPrice = selectedAddons.reduce((sum, addonId) => {
    const addon = productDetails?.addons.find((a) => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);

  const totalPrice = (basePrice + variantsPrice + addonsPrice) * quantity;
  const imageUrl =
    product?.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder.svg";

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleAddToCart = () => {
    if (!product || !productDetails) return;

    const requiredVariants = productDetails.variants.filter(
      (v) => v.is_required
    );
    const hasAllRequired = requiredVariants.every(
      (v) => selectedVariants[v.id]
    );

    if (!hasAllRequired) {
      alert("Please select all required options");
      return;
    }

    const basePrice = Number(product.base_price);
    const imageUrl =
      product.images && product.images.length > 0
        ? product.images[0]
        : "/placeholder.svg";

    const cartVariants = productDetails.variants
      .filter((variant) => selectedVariants[variant.id])
      .map((variant) => {
        const selectedOptionId = selectedVariants[variant.id];
        const option = variant.options.find(
          (opt) => opt.id === selectedOptionId
        );
        return {
          variant_id: variant.id,
          variant_name: variant.name,
          option_id: option!.id,
          option_name: option!.name,
          price_modifier: option!.price_modifier,
        };
      });

    const cartAddons = selectedAddons.map((addonId) => {
      const addon = productDetails.addons.find((a) => a.id === addonId)!;
      return {
        addon_id: addon.id,
        name: addon.name,
        price: addon.price,
      };
    });

    onAddToCart({
      product_id: product.id,
      name: product.name,
      image: imageUrl,
      base_price: basePrice,
      quantity,
      variants: cartVariants,
      addons: cartAddons,
    });

    setSelectedAddons([]);
    setQuantity(1);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity duration-300",
          open && product ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 h-[72vh] transform rounded-t-[4rem] border-t border-amber-200/60 bg-gradient-to-b from-white to-amber-50/20 shadow-2xl transition-transform duration-300 ease-out",
          open && product ? "translate-y-0" : "translate-y-full"
        )}
      >
        {product && (
          <div className="flex h-full flex-col">
            {/* Image Header */}
            <div className="relative h-[32vh] w-full overflow-hidden rounded-t-[4rem] bg-gradient-to-b from-amber-50 to-white">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
              {/* Close button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-8 top-8 h-12 w-12 rounded-full border border-amber-200/60 bg-white/90 text-neutral-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-amber-700"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-10 py-6">
              {/* Product Info */}
              <div className="mb-6">
                <h2 className="mb-2 font-display text-3xl font-semibold text-neutral-800">
                  {product.name}
                </h2>
                <p className="font-body text-xl font-medium text-amber-600">
                  {basePrice.toLocaleString()}₮
                </p>
              </div>

              {loading ? (
                <ProductDetailsSkeleton />
              ) : productDetails ? (
                <>
                  {/* Variants */}
                  {productDetails?.variants.map((variant) => (
                    <div key={variant.id} className="mb-6">
                      <h3 className="mb-3 font-body text-lg font-semibold text-neutral-800">
                        {variant.name}
                        {variant.is_required && (
                          <span className="ml-2 text-sm text-red-500">*</span>
                        )}
                      </h3>
                      <div
                        className={cn(
                          "grid gap-2.5",
                          variant.options.length <= 3
                            ? "grid-cols-3"
                            : variant.options.length === 4
                            ? "grid-cols-4"
                            : "grid-cols-5"
                        )}
                      >
                        {variant.options.map((option) => {
                          const isSelected =
                            selectedVariants[variant.id] === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [variant.id]: option.id,
                                }))
                              }
                              className={cn(
                                "relative rounded-xl border-2 py-3 font-body text-sm font-medium transition-all",
                                isSelected
                                  ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white text-amber-700 shadow-sm"
                                  : "border-amber-200/60 bg-white text-neutral-600 hover:border-amber-300 hover:bg-amber-50/50"
                              )}
                            >
                              {isSelected && (
                                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                              <div>{option.name}</div>
                              {option.price_modifier !== 0 && (
                                <span className="text-xs text-amber-600">
                                  {option.price_modifier > 0 ? "+" : ""}
                                  {option.price_modifier.toLocaleString()}₮
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Addons */}
                  {productDetails && productDetails.addons.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 font-body text-lg font-semibold text-neutral-800">
                        Add-ons
                      </h3>
                      <div className="space-y-2.5">
                        {productDetails.addons.map((addon) => {
                          const isSelected = selectedAddons.includes(addon.id);
                          return (
                            <button
                              key={addon.id}
                              onClick={() => handleToggleAddon(addon.id)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 transition-all",
                                isSelected
                                  ? "border-amber-500 bg-gradient-to-r from-amber-50 to-white"
                                  : "border-amber-200/60 bg-white hover:border-amber-300 hover:bg-amber-50/50"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all",
                                    isSelected
                                      ? "border-amber-500 bg-amber-500"
                                      : "border-amber-300 bg-white"
                                  )}
                                >
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <span className="font-body text-base font-medium text-neutral-800">
                                  {addon.name}
                                </span>
                              </div>
                              <span className="font-body text-base font-semibold text-amber-600">
                                +{addon.price.toLocaleString()}₮
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="mb-3 font-body text-lg font-semibold text-neutral-800">
                  Quantity
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-amber-200 bg-white text-neutral-600 transition-all hover:border-amber-300 hover:bg-amber-50"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-12 text-center font-display text-2xl font-semibold text-neutral-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-amber-200 bg-white text-neutral-600 transition-all hover:border-amber-300 hover:bg-amber-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="mb-6 h-16 w-full gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-body text-xl font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:from-neutral-300 disabled:to-neutral-400"
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    <ShoppingCart className="h-6 w-6" />
                    Add to Cart — {totalPrice.toLocaleString()}₮
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
