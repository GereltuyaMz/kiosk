"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { Coffee, ShoppingCart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { KioskProductDrawer } from "../products/ProductDrawer";
import { KioskCartDrawer } from "../cart/CartDrawer";
import { PaymentFlow } from "../payment/PaymentFlow";
import { Button } from "@/components/ui/button";
import { useProductDetailsCache } from "@/hooks/useProductDetailsCache";
import type { Category } from "@/lib/admin/categories/types";
import type { Product } from "@/lib/admin/products/types";
import type { CartItem } from "@/types/kiosk";

type KioskMainLayoutProps = {
  orderType: "eatIn" | "takeOut" | null;
  categories: Category[];
  products: Product[];
  onOrderSuccess: (orderNumber: string) => void;
};

export const KioskMainLayout = ({
  categories,
  products,
  orderType,
  onOrderSuccess,
}: KioskMainLayoutProps) => {
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.id || ""
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [paymentFlowOpen, setPaymentFlowOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [language, setLanguage] = useState<"EN" | "MN">("EN");
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);
  const [cartBadgePulse, setCartBadgePulse] = useState(false);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const cartIdCounter = useRef(0);
  const { prefetchProduct, fetchProductDetails, getCachedProduct } =
    useProductDetailsCache();

  const productsByCategory = useMemo(() => {
    return products.reduce((acc, product) => {
      const categoryId = product.category_id || "uncategorized";
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [products]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => {
    const variantsPrice = item.variants.reduce(
      (vSum, v) => vSum + v.price_modifier,
      0
    );
    const addonsPrice = item.addons.reduce((aSum, a) => aSum + a.price, 0);
    return (
      sum + (item.base_price + variantsPrice + addonsPrice) * item.quantity
    );
  }, 0);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const element = categoryRefs.current[categoryId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setProductDrawerOpen(true);
  };

  const handleAddToCart = useCallback((item: Omit<CartItem, "id">) => {
    cartIdCounter.current += 1;
    const newItem: CartItem = {
      ...item,
      id: `cart-${cartIdCounter.current}-${Date.now()}`,
    };
    setCartItems((prev) => [...prev, newItem]);
    setProductDrawerOpen(false);

    setShowSuccessCheck(true);
    setCartBadgePulse(true);

    setTimeout(() => {
      setShowSuccessCheck(false);
    }, 1500);

    setTimeout(() => {
      setCartBadgePulse(false);
    }, 600);
  }, []);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleClearAll = () => {
    setCartItems([]);
  };

  const handleProceedToPayment = () => {
    setCartDrawerOpen(false);
    setPaymentFlowOpen(true);
  };

  const handlePaymentSuccess = (orderNumber: number) => {
    onOrderSuccess(String(orderNumber));
    setCartItems([]);
    setPaymentFlowOpen(false);
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white">
      <div className="flex h-24 items-center justify-between border-b-2 border-orange-200 bg-white px-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-md">
          <Coffee className="h-9 w-9 text-white" />
        </div>

        <div className="flex gap-3 rounded-xl border-2 border-orange-200 bg-white p-2">
          <button
            onClick={() => setLanguage("EN")}
            className={cn(
              "flex h-12 w-24 items-center justify-center gap-2 rounded-lg text-lg font-bold transition-all",
              language === "EN"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-neutral-600 hover:bg-orange-50 hover:text-orange-600"
            )}
          >
            <Globe className="h-5 w-5" />
            EN
          </button>
          <button
            onClick={() => setLanguage("MN")}
            className={cn(
              "flex h-12 w-24 items-center justify-center gap-2 rounded-lg text-lg font-bold transition-all",
              language === "MN"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-neutral-600 hover:bg-orange-50 hover:text-orange-600"
            )}
          >
            <Globe className="h-5 w-5" />
            MN
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-[200px] flex-col gap-5 border-r-2 border-orange-200 bg-white p-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 transition-all duration-200",
                "hover:scale-105 active:scale-95",
                selectedCategory === category.id
                  ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                  : "border-orange-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50"
              )}
            >
              {category.image_url ? (
                <div className="relative h-10 w-10 transition-transform group-hover:scale-110">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="transition-transform group-hover:scale-110">
                  <Coffee className="h-10 w-10" />
                </div>
              )}
              <span className="text-center text-base font-bold leading-tight">
                {category.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-16 py-12 pb-[160px]">
            {categories.map((category) => {
              const categoryProducts = productsByCategory[category.id] || [];
              if (categoryProducts.length === 0) return null;

              return (
                <div
                  key={category.id}
                  ref={(el) => {
                    categoryRefs.current[category.id] = el;
                  }}
                  className="mb-16"
                >
                  <h2 className="mb-8 text-5xl font-black capitalize text-neutral-900">
                    {category.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-10">
                    {categoryProducts.map((product) => {
                      const imageUrl =
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : "/placeholder.svg";

                      return (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          onMouseEnter={() => prefetchProduct(product.id)}
                          onTouchStart={() => prefetchProduct(product.id)}
                          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-orange-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:border-orange-400 hover:shadow-lg active:scale-[0.98]"
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-white">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>

                          <div className="flex flex-col items-center gap-4 border-t-2 border-orange-200 p-8">
                            <h3 className="text-balance text-center text-2xl font-bold leading-tight text-neutral-900">
                              {product.name}
                            </h3>
                            <div className="h-14 gap-2 rounded-full border-2 border-orange-500 bg-orange-500 px-8 text-xl font-black text-white shadow-sm flex items-center justify-center">
                              <span className="text-2xl">+</span> {Number(product.base_price).toLocaleString()}₮
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t-2 border-orange-200 bg-white px-16 py-6 shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <ShoppingCart className="h-12 w-12 text-orange-500 transition-transform duration-300" />

            {/* Cart Badge with Animation */}
            {cartItemCount > 0 && (
              <div
                className={cn(
                  "absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-sm font-black text-white shadow-sm transition-transform duration-300",
                  cartBadgePulse &&
                    "animate-[badgePop_0.6s_cubic-bezier(0.68,-0.55,0.265,1.55)]"
                )}
              >
                {cartItemCount}
              </div>
            )}

            {/* Ripple Effect */}
            {showSuccessCheck && (
              <>
                <div className="absolute inset-0 -m-2 animate-[ripple_0.8s_ease-out] rounded-full border-4 border-orange-400 opacity-0" />
                <div className="absolute inset-0 -m-4 animate-[ripple_0.8s_ease-out_0.2s] rounded-full border-4 border-orange-300 opacity-0" />
              </>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-neutral-600">Total</span>
            <span className="text-2xl font-black text-neutral-900">{total.toLocaleString()}₮</span>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => setCartDrawerOpen(true)}
          disabled={cartItemCount === 0}
          className="h-16 gap-3 rounded-xl border-2 border-orange-500 bg-white px-10 text-lg font-bold text-orange-600 shadow-sm hover:bg-orange-50 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          <ShoppingCart className="h-6 w-6" />
          <span>CART</span>
        </Button>
      </div>

      <KioskProductDrawer
        product={selectedProduct}
        open={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        onAddToCart={handleAddToCart}
        fetchProductDetails={fetchProductDetails}
        getCachedProduct={getCachedProduct}
      />

      <KioskCartDrawer
        items={cartItems}
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onClearAll={handleClearAll}
        onProceedToPayment={handleProceedToPayment}
      />

      <PaymentFlow
        open={paymentFlowOpen}
        onClose={() => setPaymentFlowOpen(false)}
        total={total}
        cartItems={cartItems}
        orderType={orderType || "eatIn"}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
