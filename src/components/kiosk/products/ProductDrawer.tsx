"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Loader2 } from "lucide-react";
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

      // Check cache first for instant display
      const cached = getCachedProduct(product.id);
      if (cached) {
        setProductDetails(cached);
        setLoading(false);

        // Set default variants
        const defaultVariants: Record<string, string> = {};
        cached.variants.forEach((variant: ProductVariant) => {
          if (variant.options.length > 0) {
            defaultVariants[variant.id] = variant.options[0].id;
          }
        });
        setSelectedVariants(defaultVariants);
        return;
      }

      // Not in cache, fetch with loading state
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
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          open && product ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 h-[70vh] transform rounded-t-[7rem] bg-white shadow-2xl transition-transform duration-300",
          open && product ? "translate-y-0" : "translate-y-full"
        )}
      >
        {product && (
          <div className="flex h-full flex-col">
            <div className="relative h-[30vh] w-full overflow-hidden rounded-t-[7rem] border-b-2 border-orange-200 bg-white">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-11 top-10 h-14 w-14 rounded-full border-2 border-orange-200 bg-white"
                onClick={onClose}
              >
                <X size={20} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-8">
              <div className="mb-8">
                <h2 className="mb-2 text-4xl font-bold text-neutral-900">
                  {product.name}
                </h2>
                <p className="text-2xl font-semibold text-orange-500">
                  {basePrice.toLocaleString()}₮
                </p>
              </div>

              {loading ? (
                <ProductDetailsSkeleton />
              ) : productDetails ? (
                <>
                  {productDetails?.variants.map((variant) => (
                    <div key={variant.id} className="my-8">
                      <h3 className="mb-4 text-xl font-bold text-neutral-900">
                        {variant.name}
                        {variant.is_required && (
                          <span className="ml-2 text-base text-red-500">*</span>
                        )}
                      </h3>
                      <div
                        className={cn(
                          "grid gap-3",
                          variant.options.length <= 3
                            ? "grid-cols-3"
                            : variant.options.length === 4
                            ? "grid-cols-4"
                            : "grid-cols-5"
                        )}
                      >
                        {variant.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [variant.id]: option.id,
                              }))
                            }
                            className={cn(
                              "rounded-xl border-2 py-3 text-base font-semibold transition-all",
                              selectedVariants[variant.id] === option.id
                                ? "border-orange-500 bg-orange-50 text-orange-600"
                                : "border-orange-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50"
                            )}
                          >
                            <div>{option.name}</div>
                            {option.price_modifier !== 0 && (
                              <span className="text-sm">
                                {option.price_modifier > 0 ? "+" : ""}
                                {option.price_modifier.toLocaleString()}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {productDetails && productDetails.addons.length > 0 && (
                    <div className="mb-8">
                      <h3 className="mb-4 text-xl font-bold text-neutral-900">
                        Add-ons
                      </h3>
                      <div className="space-y-3">
                        {productDetails.addons.map((addon) => (
                          <button
                            key={addon.id}
                            onClick={() => handleToggleAddon(addon.id)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl border-2 px-6 py-4 transition-all",
                              selectedAddons.includes(addon.id)
                                ? "border-orange-500 bg-orange-50"
                                : "border-orange-200 bg-white hover:border-orange-300 hover:bg-orange-50"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded border-2 transition-all",
                                  selectedAddons.includes(addon.id)
                                    ? "border-orange-500 bg-orange-500"
                                    : "border-orange-300 bg-white"
                                )}
                              >
                                {selectedAddons.includes(addon.id) && (
                                  <svg
                                    className="h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="text-lg font-semibold text-neutral-900">
                                {addon.name}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-orange-500">
                              +{addon.price.toLocaleString()}₮
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-bold text-neutral-900">
                  Quantity
                </h3>
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-14 w-14 rounded-full border-2 border-orange-300 bg-white hover:bg-orange-50"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <span className="w-16 text-center text-3xl font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-14 w-14 rounded-full border-2 border-orange-300 bg-white hover:bg-orange-50"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <Button
                className="mb-8 h-20 w-full rounded-2xl border-2 border-orange-500 bg-orange-500 text-2xl font-bold text-white shadow-sm hover:bg-orange-600"
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : `ADD TO CART — ${totalPrice.toLocaleString()}₮`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
