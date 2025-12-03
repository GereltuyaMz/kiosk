"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, Trash2 } from "lucide-react";
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
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[600px] transform border-l-2 border-orange-200 bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b-2 border-orange-200 bg-white px-10 py-8">
            <h2 className="text-4xl font-black text-neutral-900">YOUR ORDER</h2>
            <div className="flex items-center gap-4">
              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="rounded-full border-2 border-orange-200 bg-white px-6 py-3 text-xl font-bold text-orange-600 transition-all hover:bg-orange-50"
                >
                  Clear All
                </button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-14 w-14 rounded-full border-2 border-orange-200 bg-white text-neutral-700 hover:bg-orange-50"
                onClick={onClose}
              >
                <X className="h-12 w-12" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white px-10 py-8">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="text-8xl">🛒</div>
                <p className="text-3xl font-bold text-neutral-700">
                  Your cart is empty
                </p>
                <p className="text-xl text-neutral-500">
                  Add some delicious items to get started!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border-2 border-orange-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-4 flex gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-orange-200">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <h3 className="text-2xl font-bold text-neutral-900">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 0)}
                            className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {item.variants.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2 text-lg text-neutral-600">
                        {item.variants.map((variant, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border-2 border-orange-200 bg-orange-50 px-4 py-1 font-semibold text-orange-600"
                          >
                            {variant.option_name}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.addons.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {item.addons.map((addon, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-lg text-neutral-700"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-orange-500">✓</span>
                              <span className="font-semibold">
                                {addon.name}
                              </span>
                            </div>
                            <span className="font-bold text-orange-500">
                              +₮{addon.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          size="icon"
                          className="h-12 w-12 rounded-full border-2 border-orange-300 bg-white text-orange-600 hover:bg-orange-50"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-6 w-6" />
                        </Button>
                        <span className="w-12 text-center text-3xl font-black text-neutral-900">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          className="h-12 w-12 rounded-full border-2 border-orange-300 bg-white text-orange-600 hover:bg-orange-50"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="text-3xl font-black text-orange-500">
                        ₮
                        {(
                          calculateItemPrice(item) * item.quantity
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t-2 border-orange-200 bg-white px-10 py-8">
              <div className="mb-6 space-y-4 rounded-2xl border-2 border-orange-200 bg-white p-6">
                <div className="flex justify-between text-2xl font-semibold text-neutral-700">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString()}₮</span>
                </div>
                <div className="h-px bg-orange-200" />
                <div className="flex justify-between text-3xl font-black text-neutral-900">
                  <span>TOTAL:</span>
                  <span className="text-orange-500">
                    {total.toLocaleString()}₮
                  </span>
                </div>
              </div>

              <Button
                onClick={onProceedToPayment}
                className="h-20 w-full rounded-xl border-2 border-orange-500 bg-orange-500 text-3xl font-black text-white shadow-sm hover:bg-orange-600"
              >
                PROCEED TO PAYMENT →
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
