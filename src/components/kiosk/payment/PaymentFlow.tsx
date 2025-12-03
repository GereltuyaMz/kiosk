"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Loader2, CheckCircle2, XCircle, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePOSBridge } from "@/hooks/usePOSBridge";
import type { CartItem } from "@/types/kiosk";

type PaymentFlowProps = {
  open: boolean;
  onClose: () => void;
  total: number;
  cartItems: CartItem[];
  orderType: "eatIn" | "takeOut";
  onPaymentSuccess: (orderNumber: number) => void;
};

export const PaymentFlow = ({ open, onClose, total, cartItems, orderType, onPaymentSuccess }: PaymentFlowProps) => {
  const [receiptType, setReceiptType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");
  const [paymentType, setPaymentType] = useState<"qpay" | "card" | null>(null);
  const [qpayLoading, setQpayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { wsConnected, opcStatus, paymentState, result, processPurchase, cancelTransaction, resetPayment } =
    usePOSBridge();

  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    if (open && !orderId) {
      setOrderId(`ORD-${Date.now()}`);
    }
  }, [open, orderId]);

  useEffect(() => {
    if (paymentType === "card" && paymentState === "idle" && opcStatus.connected && open) {
      processPurchase({ amount: total, orderId });
    }
  }, [paymentType, paymentState, opcStatus.connected, total, orderId, processPurchase, open]);

  useEffect(() => {
    if (paymentState === "success" && result?.success) {
      handleCreateOrder();
    }
  }, [paymentState, result]);

  const handleCreateOrder = async () => {
    try {
      const response = await fetch("/api/kiosk/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dine_type: orderType === "eatIn" ? "EAT_IN" : "TAKE_OUT",
          receipt_type: receiptType,
          payment_method: "card",
          total_amount: total,
          items: cartItems,
        }),
      });

      const orderResult = await response.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create order");
      }

      onPaymentSuccess(orderResult.data.order_number);
    } catch (err) {
      console.error("Order creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create order");
    }
  };

  const handleQPayPayment = async () => {
    setQpayLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("/api/kiosk/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dine_type: orderType === "eatIn" ? "EAT_IN" : "TAKE_OUT",
          receipt_type: receiptType,
          payment_method: "qpay",
          total_amount: total,
          items: cartItems,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      onPaymentSuccess(result.data.order_number);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setQpayLoading(false);
    }
  };

  const handleCancel = () => {
    if (paymentType === "card" && (paymentState === "processing" || paymentState === "error")) {
      cancelTransaction();
    }
    setPaymentType(null);
    setError(null);
    resetPayment();
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  const isCardProcessing = paymentType === "card" && paymentState === "processing";
  const isCardSuccess = paymentType === "card" && paymentState === "success";
  const isCardError = paymentType === "card" && paymentState === "error";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={!isCardProcessing ? handleClose : undefined}
      />

      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[800px] -translate-x-1/2 transform rounded-3xl border-2 border-orange-200 bg-white p-12 shadow-2xl transition-all duration-300",
          open ? "-translate-y-1/2 opacity-100" : "-translate-y-[40%] opacity-0 pointer-events-none"
        )}
      >
        {!isCardProcessing && !isCardSuccess && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4 h-12 w-12 rounded-full border-2 border-orange-200 bg-white hover:bg-orange-50"
            onClick={handleClose}
          >
            <X className="h-6 w-6" />
          </Button>
        )}

        {isCardProcessing ? (
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="relative">
              <div className="h-32 w-32 animate-pulse rounded-full bg-blue-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="h-16 w-16 text-blue-500" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-neutral-900">Tap Your Card</h2>
              <p className="mt-3 text-xl text-neutral-600">Please tap or insert your card on the POS terminal</p>
              <p className="mt-6 text-4xl font-black text-orange-500">{total.toLocaleString()}₮</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={cn("h-2 w-2 rounded-full", wsConnected ? "bg-green-500" : "bg-red-500")} />
              <span className="text-neutral-500">Bridge: {wsConnected ? "Connected" : "Disconnected"}</span>
              <span className="mx-2 text-neutral-300">|</span>
              <span className={cn("h-2 w-2 rounded-full", opcStatus.connected ? "bg-green-500" : "bg-yellow-500")} />
              <span className="text-neutral-500">POS: {opcStatus.connected ? "Ready" : "Connecting..."}</span>
            </div>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="mt-4 rounded-xl border-2 px-8 py-6 text-lg font-bold"
            >
              Cancel Transaction
            </Button>
          </div>
        ) : isCardError ? (
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-20 w-20 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-neutral-900">Payment Failed</h2>
              <p className="mt-3 text-xl text-red-600">{result?.message || "Transaction failed"}</p>
              {result?.resultCode && (
                <p className="mt-2 text-sm text-neutral-500">Error Code: {result.resultCode}</p>
              )}
            </div>
            <div className="flex w-full gap-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 rounded-xl border-2 py-6 text-lg font-bold"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  resetPayment();
                  setPaymentType("card");
                }}
                className="flex-1 rounded-xl bg-orange-500 py-6 text-lg font-bold hover:bg-orange-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mb-8 text-center text-5xl font-black text-neutral-900">Payment</h2>

            <div className="mb-10">
              <h3 className="mb-4 text-2xl font-bold text-neutral-900">Receipt Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setReceiptType("INDIVIDUAL")}
                  disabled={qpayLoading || isCardProcessing}
                  className={cn(
                    "rounded-2xl border-2 py-6 text-xl font-bold transition-all",
                    receiptType === "INDIVIDUAL"
                      ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                      : "border-orange-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50",
                    (qpayLoading || isCardProcessing) && "cursor-not-allowed opacity-50"
                  )}
                >
                  Хувь хүн
                </button>
                <button
                  onClick={() => setReceiptType("ORGANIZATION")}
                  disabled={qpayLoading || isCardProcessing}
                  className={cn(
                    "rounded-2xl border-2 py-6 text-xl font-bold transition-all",
                    receiptType === "ORGANIZATION"
                      ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                      : "border-orange-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50",
                    (qpayLoading || isCardProcessing) && "cursor-not-allowed opacity-50"
                  )}
                >
                  Байгууллага
                </button>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="mb-4 text-2xl font-bold text-neutral-900">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentType("qpay")}
                  disabled={qpayLoading || isCardProcessing}
                  className={cn(
                    "rounded-2xl border-2 py-6 text-xl font-bold transition-all",
                    paymentType === "qpay"
                      ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                      : "border-orange-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50",
                    (qpayLoading || isCardProcessing) && "cursor-not-allowed opacity-50"
                  )}
                >
                  QPay
                </button>
                <button
                  onClick={() => setPaymentType("card")}
                  disabled={qpayLoading || isCardProcessing || !opcStatus.connected}
                  className={cn(
                    "rounded-2xl border-2 py-6 text-xl font-bold transition-all",
                    paymentType === "card"
                      ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm"
                      : "border-orange-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50",
                    (qpayLoading || isCardProcessing || !opcStatus.connected) && "cursor-not-allowed opacity-50"
                  )}
                >
                  <CreditCard className="mx-auto mb-2 h-8 w-8" />
                  Bank Card
                  {!opcStatus.connected && (
                    <div className="mt-1 flex items-center justify-center gap-1 text-xs text-red-500">
                      <WifiOff className="h-3 w-3" />
                      Not Ready
                    </div>
                  )}
                </button>
              </div>
            </div>

            {paymentType === "qpay" && (
              <>
                <div className="mb-8 rounded-2xl border-2 border-orange-200 bg-white p-8">
                  <div className="flex flex-col items-center gap-6">
                    <p className="text-xl font-bold text-neutral-900">Scan QR Code to Pay</p>
                    <div className="relative h-64 w-64 rounded-2xl border-2 border-orange-300 bg-orange-50 p-4">
                      <Image src="/qr-code.jpg" alt="QR Code" fill className="rounded-2xl object-contain p-4" />
                    </div>
                    <p className="text-3xl font-black text-orange-500">{total.toLocaleString()}₮</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-lg font-bold text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleQPayPayment}
                  disabled={qpayLoading}
                  className="h-20 w-full rounded-2xl border-2 border-orange-500 bg-orange-500 text-2xl font-black text-white shadow-sm hover:bg-orange-600 disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500"
                >
                  {qpayLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span>PROCESSING...</span>
                    </div>
                  ) : (
                    "CONFIRM PAYMENT"
                  )}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};
