"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/kiosk";

type KioskCartDrawerProps = {
  items: CartItem[];
  open: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearAll: () => void;
  onProceedToPayment: () => void;
};

export const KioskCartDrawer = ({
  items,
  open,
  onClose,
  onUpdateQuantity,
  onClearAll,
  onProceedToPayment,
}: KioskCartDrawerProps) => {
  const calculateItemPrice = (item: CartItem) => {
    const variantsPrice = item.variants.reduce(
      (sum, v) => sum + v.price_modifier,
      0
    );
    const addonsPrice = item.addons.reduce((sum, a) => sum + a.price, 0);
    return item.base_price + variantsPrice + addonsPrice;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemPrice(item) * item.quantity,
    0
  );
  const total = subtotal;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[580px] transform border-l border-amber-200/60 bg-gradient-to-b from-white to-amber-50/30 shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-200/60 bg-white/80 px-8 py-6 backdrop-blur-sm">
            <div>
              <h2 className="font-display text-3xl font-semibold text-neutral-800">
                Your Order
              </h2>
              <p className="mt-1 font-body text-sm text-neutral-500">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="rounded-full border border-amber-200/60 bg-white px-5 py-2.5 font-body text-sm font-medium text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-50"
                >
                  Clear All
                </button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full border border-amber-200/60 bg-white text-neutral-600 hover:bg-amber-50 hover:text-amber-700"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-amber-100/50">
                  <ShoppingBag className="h-16 w-16 text-amber-400" />
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-neutral-700">
                    Your cart is empty
                  </p>
                  <p className="mt-2 font-body text-base text-neutral-500">
                    Add some delicious items to get started!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-sm transition-all hover:shadow-md"
                    style={{
                      animation: "fade-up 0.4s ease-out forwards",
                      animationDelay: `${index * 0.05}s`,
                    }}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Image */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-amber-50">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <h3 className="font-body text-lg font-semibold text-neutral-800">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 0)}
                            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-body text-base font-medium text-amber-600">
                          {item.base_price.toLocaleString()}₮
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    {(item.variants.length > 0 || item.addons.length > 0) && (
                      <div className="mx-4 mb-3 space-y-2 rounded-xl bg-amber-50/50 p-3">
                        {item.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.variants.map((variant, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-amber-100 px-2.5 py-1 font-body text-xs font-medium text-amber-700"
                              >
                                {variant.option_name}
                                {variant.price_modifier !== 0 && (
                                  <span className="ml-1 text-amber-600">
                                    {variant.price_modifier > 0 ? "+" : ""}
                                    {variant.price_modifier.toLocaleString()}₮
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.addons.length > 0 && (
                          <div className="space-y-1">
                            {item.addons.map((addon, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between font-body text-xs text-neutral-600"
                              >
                                <span>+ {addon.name}</span>
                                <span className="font-medium text-amber-600">
                                  {addon.price.toLocaleString()}₮
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantity & Total */}
                    <div className="flex items-center justify-between border-t border-amber-100 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-white text-neutral-600 transition-all hover:border-amber-300 hover:bg-amber-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-body text-lg font-bold text-neutral-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-white text-neutral-600 transition-all hover:border-amber-300 hover:bg-amber-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-display text-xl font-semibold text-amber-600">
                        {(
                          calculateItemPrice(item) * item.quantity
                        ).toLocaleString()}
                        ₮
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-amber-200/60 bg-white/90 px-6 py-6 backdrop-blur-sm">
              {/* Summary */}
              <div className="mb-5 space-y-3 rounded-2xl border border-amber-200/60 bg-gradient-to-b from-amber-50/50 to-white p-5">
                <div className="flex justify-between font-body text-base text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString()}₮
                  </span>
                </div>
                <div className="h-px bg-amber-200/60" />
                <div className="flex justify-between">
                  <span className="font-display text-xl font-semibold text-neutral-800">
                    Total
                  </span>
                  <span className="font-display text-2xl font-bold text-amber-600">
                    {total.toLocaleString()}₮
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={onProceedToPayment}
                className="h-16 w-full gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-body text-xl font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                Proceed to Payment
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
