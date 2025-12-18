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
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[150px] top-[10%] h-[400px] w-[400px] rounded-full bg-amber-100/40 blur-[100px]" />
        <div className="absolute -right-[100px] bottom-[20%] h-[350px] w-[350px] rounded-full bg-orange-100/30 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex h-24 items-center justify-between border-b border-amber-200/60 bg-white/80 px-12 backdrop-blur-sm">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-md transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(145deg, #f59e0b 0%, #d97706 100%)",
          }}
        >
          <Coffee className="h-9 w-9 text-white" />
        </div>

        <div className="flex gap-2 rounded-xl border border-amber-200/60 bg-white/80 p-1.5 backdrop-blur-sm">
          <button
            onClick={() => setLanguage("EN")}
            className={cn(
              "flex h-11 w-20 items-center justify-center gap-2 rounded-lg font-body text-base font-semibold transition-all",
              language === "EN"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-amber-50 hover:text-amber-700"
            )}
          >
            <Globe className="h-4 w-4" />
            EN
          </button>
          <button
            onClick={() => setLanguage("MN")}
            className={cn(
              "flex h-11 w-20 items-center justify-center gap-2 rounded-lg font-body text-base font-semibold transition-all",
              language === "MN"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-amber-50 hover:text-amber-700"
            )}
          >
            <Globe className="h-4 w-4" />
            MN
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Category Sidebar */}
        <div className="flex w-[200px] flex-col gap-4 border-r border-amber-200/60 bg-white/60 p-5 backdrop-blur-sm">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "group flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-5 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                selectedCategory === category.id
                  ? "border-amber-400 bg-gradient-to-b from-amber-50 to-white text-amber-700 shadow-sm"
                  : "border-amber-200/60 bg-white/80 text-neutral-600 hover:border-amber-300 hover:bg-white"
              )}
              style={{
                animation: "fade-up 0.4s ease-out forwards",
                animationDelay: `${index * 0.05}s`,
              }}
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
                  <Coffee
                    className={cn(
                      "h-10 w-10",
                      selectedCategory === category.id
                        ? "text-amber-600"
                        : "text-neutral-400"
                    )}
                  />
                </div>
              )}
              <span className="text-center font-body text-sm font-semibold leading-tight">
                {category.name}
              </span>
            </button>
          ))}
        </div>

        {/* Products Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-12 py-10 pb-40">
            {categories.map((category) => {
              const categoryProducts = productsByCategory[category.id] || [];
              if (categoryProducts.length === 0) return null;

              return (
                <div
                  key={category.id}
                  ref={(el) => {
                    categoryRefs.current[category.id] = el;
                  }}
                  className="mb-14"
                >
                  <h2 className="mb-6 font-display text-4xl font-semibold capitalize text-neutral-800">
                    {category.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-8">
                    {categoryProducts.map((product, index) => {
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
                          className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-amber-200/60 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-amber-300 hover:shadow-lg active:scale-[0.98]"
                          style={{
                            animation: "card-lift 0.5s ease-out forwards",
                            animationDelay: `${index * 0.08}s`,
                          }}
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-amber-50/50 to-white">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Subtle overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </div>

                          <div className="flex flex-col items-center gap-3 border-t border-amber-200/60 p-6">
                            <h3 className="text-balance text-center font-body text-xl font-semibold leading-tight text-neutral-800 transition-colors group-hover:text-amber-700">
                              {product.name}
                            </h3>
                            <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 font-body text-lg font-bold text-white shadow-sm transition-all group-hover:shadow-md">
                              <span className="text-xl">+</span>
                              {Number(product.base_price).toLocaleString()}₮
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

      {/* Bottom Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-amber-200/60 bg-white/90 px-12 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50">
              <ShoppingCart className="h-7 w-7 text-amber-600" />
            </div>

            {/* Cart Badge */}
            {cartItemCount > 0 && (
              <div
                className={cn(
                  "absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-amber-500 to-amber-600 font-body text-sm font-bold text-white shadow-sm transition-transform duration-300",
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
                <div className="absolute inset-0 -m-2 animate-[ripple_0.8s_ease-out] rounded-full border-4 border-amber-400 opacity-0" />
                <div className="absolute inset-0 -m-4 animate-[ripple_0.8s_ease-out_0.2s] rounded-full border-4 border-amber-300 opacity-0" />
              </>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-body text-sm font-medium text-neutral-500">
              Total
            </span>
            <span className="font-display text-2xl font-semibold text-neutral-800">
              {total.toLocaleString()}₮
            </span>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => setCartDrawerOpen(true)}
          disabled={cartItemCount === 0}
          className={cn(
            "h-14 gap-3 rounded-xl px-8 font-body text-base font-semibold shadow-sm transition-all",
            cartItemCount > 0
              ? "border-2 border-amber-500 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-md"
              : "border border-neutral-200 bg-neutral-100 text-neutral-400"
          )}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>View Cart</span>
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
