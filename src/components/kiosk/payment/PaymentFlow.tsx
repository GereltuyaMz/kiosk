"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  X,
  CreditCard,
  Loader2,
  CheckCircle2,
  XCircle,
  WifiOff,
  QrCode,
  User,
  Building2,
} from "lucide-react";
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

export const PaymentFlow = ({
  open,
  onClose,
  total,
  cartItems,
  orderType,
  onPaymentSuccess,
}: PaymentFlowProps) => {
  const [receiptType, setReceiptType] = useState<"INDIVIDUAL" | "ORGANIZATION">(
    "INDIVIDUAL"
  );
  const [paymentType, setPaymentType] = useState<"qpay" | "card" | null>(null);
  const [qpayLoading, setQpayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    wsConnected,
    opcStatus,
    paymentState,
    result,
    processPurchase,
    cancelTransaction,
    resetPayment,
  } = usePOSBridge();

  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    if (open && !orderId) {
      setOrderId(`ORD-${Date.now()}`);
    }
  }, [open, orderId]);

  useEffect(() => {
    if (
      paymentType === "card" &&
      paymentState === "idle" &&
      opcStatus.connected &&
      open
    ) {
      processPurchase({ amount: total, orderId });
    }
  }, [
    paymentType,
    paymentState,
    opcStatus.connected,
    total,
    orderId,
    processPurchase,
    open,
  ]);

  useEffect(() => {
    if (paymentState === "success" && result?.success) {
      handleCreateOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(
        err instanceof Error ? err.message : "Payment failed. Please try again."
      );
    } finally {
      setQpayLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      paymentType === "card" &&
      (paymentState === "processing" || paymentState === "error")
    ) {
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
  const isCardError = paymentType === "card" && paymentState === "error";

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={!isCardProcessing ? handleClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[750px] -translate-x-1/2 transform rounded-3xl border border-amber-200/60 bg-gradient-to-b from-white to-amber-50/30 p-10 shadow-2xl transition-all duration-300",
          open
            ? "-translate-y-1/2 opacity-100"
            : "pointer-events-none -translate-y-[40%] opacity-0"
        )}
      >
        {/* Close Button */}
        {!isCardProcessing && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4 h-10 w-10 rounded-full border border-amber-200/60 bg-white text-neutral-600 hover:bg-amber-50 hover:text-amber-700"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Card Processing State */}
        {isCardProcessing ? (
          <div className="flex flex-col items-center gap-8 py-8">
            <div className="relative">
              <div
                className="h-28 w-28 rounded-full bg-gradient-to-b from-blue-100 to-blue-50"
                style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="h-14 w-14 text-blue-500" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-semibold text-neutral-800">
                Tap Your Card
              </h2>
              <p className="mt-2 font-body text-base text-neutral-500">
                Please tap or insert your card on the POS terminal
              </p>
              <p className="mt-6 font-display text-3xl font-bold text-amber-600">
                {total.toLocaleString()}₮
              </p>
            </div>
            <div className="flex items-center gap-3 font-body text-sm">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  wsConnected ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span className="text-neutral-500">
                Bridge: {wsConnected ? "Connected" : "Disconnected"}
              </span>
              <span className="text-neutral-300">|</span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  opcStatus.connected ? "bg-green-500" : "bg-amber-500"
                )}
              />
              <span className="text-neutral-500">
                POS: {opcStatus.connected ? "Ready" : "Connecting..."}
              </span>
            </div>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="mt-2 rounded-xl border-2 border-neutral-200 px-8 py-5 font-body text-base font-medium hover:bg-neutral-50"
            >
              Cancel Transaction
            </Button>
          </div>
        ) : isCardError ? (
          /* Card Error State */
          <div className="flex flex-col items-center gap-8 py-8">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-semibold text-neutral-800">
                Payment Failed
              </h2>
              <p className="mt-2 font-body text-base text-red-600">
                {result?.message || "Transaction failed"}
              </p>
              {result?.resultCode && (
                <p className="mt-1 font-body text-sm text-neutral-500">
                  Error Code: {result.resultCode}
                </p>
              )}
            </div>
            <div className="flex w-full gap-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 rounded-xl border-2 py-5 font-body text-base font-medium"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  resetPayment();
                  setPaymentType("card");
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-5 font-body text-base font-medium text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          /* Default Payment Selection */
          <>
            <h2 className="mb-8 text-center font-display text-3xl font-semibold text-neutral-800">
              Payment
            </h2>

            {/* Receipt Type */}
            <div className="mb-8">
              <h3 className="mb-3 font-body text-lg font-semibold text-neutral-800">
                Receipt Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setReceiptType("INDIVIDUAL")}
                  disabled={qpayLoading || isCardProcessing}
                  className={cn(
                    "flex items-center justify-center gap-3 rounded-xl border-2 py-5 font-body text-base font-medium transition-all",
                    receiptType === "INDIVIDUAL"
                      ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white text-amber-700 shadow-sm"
                      : "border-amber-200/60 bg-white text-neutral-600 hover:border-amber-300 hover:bg-amber-50/50",
                    (qpayLoading || isCardProcessing) &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <User className="h-5 w-5" />
                  Individual
                </button>
                <button
                  onClick={() => setReceiptType("ORGANIZATION")}
                  disabled={qpayLoading || isCardProcessing}
                  className={cn(
                    "flex items-center justify-center gap-3 rounded-xl border-2 py-5 font-body text-base font-medium transition-all",
                    receiptType === "ORGANIZATION"
                      ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white text-amber-700 shadow-sm"
                      : "border-amber-200/60 bg-white text-neutral-600 hover:border-amber-300 hover:bg-amber-50/50",
                    (qpayLoading || isCardProcessing) &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <Building2 className="h-5 w-5" />
                  Organization
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h3 className="mb-3 font-body text-lg font-semibold text-neutral-800">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentType("qpay")}
                  disabled={qpayLoading || isCardProcessing}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-6 font-body text-base font-medium transition-all",
                    paymentType === "qpay"
                      ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white text-amber-700 shadow-sm"
                      : "border-amber-200/60 bg-white text-neutral-600 hover:border-amber-300 hover:bg-amber-50/50",
                    (qpayLoading || isCardProcessing) &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <QrCode className="h-8 w-8" />
                  QPay
                </button>
                <button
                  onClick={() => setPaymentType("card")}
                  disabled={qpayLoading || isCardProcessing || !opcStatus.connected}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-6 font-body text-base font-medium transition-all",
                    paymentType === "card"
                      ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white text-amber-700 shadow-sm"
                      : "border-amber-200/60 bg-white text-neutral-600 hover:border-amber-300 hover:bg-amber-50/50",
                    (qpayLoading || isCardProcessing || !opcStatus.connected) &&
                      "cursor-not-allowed opacity-50"
                  )}
                >
                  <CreditCard className="h-8 w-8" />
                  Bank Card
                  {!opcStatus.connected && (
                    <div className="flex items-center gap-1 text-xs text-red-500">
                      <WifiOff className="h-3 w-3" />
                      Not Ready
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* QPay Flow */}
            {paymentType === "qpay" && (
              <>
                <div className="mb-6 rounded-2xl border border-amber-200/60 bg-gradient-to-b from-amber-50/50 to-white p-6">
                  <div className="flex flex-col items-center gap-5">
                    <p className="font-body text-base font-medium text-neutral-700">
                      Scan QR Code to Pay
                    </p>
                    <div className="relative h-56 w-56 overflow-hidden rounded-2xl border-2 border-amber-200 bg-white p-3">
                      <Image
                        src="/qr-code.jpg"
                        alt="QR Code"
                        fill
                        className="object-contain p-3"
                      />
                    </div>
                    <p className="font-display text-2xl font-bold text-amber-600">
                      {total.toLocaleString()}₮
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                    <p className="font-body text-sm font-medium text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleQPayPayment}
                  disabled={qpayLoading}
                  className="h-14 w-full gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-body text-lg font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:from-neutral-300 disabled:to-neutral-400"
                >
                  {qpayLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Confirm Payment"
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
