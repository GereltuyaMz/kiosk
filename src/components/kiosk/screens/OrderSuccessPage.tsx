"use client";

import { Coffee, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderSuccessPageProps = {
  orderNumber: string;
  onRestart: () => void;
};

export const OrderSuccessPage = ({ orderNumber, onRestart }: OrderSuccessPageProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-20">
      <div className="relative mb-12">
        <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-green-300 bg-gradient-to-br from-green-400 to-green-500 shadow-2xl">
          <CheckCircle2 className="h-28 w-28 text-white" />
        </div>
      </div>

      <h1 className="mb-6 text-8xl font-black text-neutral-900">Order Success!</h1>
      <p className="mb-4 text-4xl font-bold text-neutral-600">Захиалга амжилттай баталгаажлаа</p>

      <div className="mb-16 flex flex-col items-center gap-4 rounded-3xl border-4 border-orange-300 bg-white p-12 shadow-xl">
        <p className="text-2xl font-semibold text-neutral-600">Order Number</p>
        <p className="text-7xl font-black text-orange-500">{orderNumber}</p>
        <p className="text-xl font-medium text-neutral-500">Захиалгын дугаар</p>
      </div>

      <Button
        onClick={onRestart}
        className="h-24 gap-4 rounded-2xl border-4 border-orange-500 bg-orange-500 px-16 text-4xl font-black text-white shadow-xl hover:bg-orange-600"
      >
        <Coffee className="h-12 w-12" />
        Шинэчлэх
      </Button>

      <p className="mt-8 text-2xl font-semibold text-neutral-500">Thank you for your order!</p>
    </div>
  );
};
