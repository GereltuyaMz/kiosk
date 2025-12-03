"use client";

import { Coffee, Home, ShoppingBag } from "lucide-react";
import { HamburgerIcon, ShoppingBagOpenIcon } from "@phosphor-icons/react";

type OrderTypeSelectionProps = {
  onSelect: (type: "eatIn" | "takeOut") => void;
};

export const OrderTypeSelection = ({ onSelect }: OrderTypeSelectionProps) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden  p-20">
      {/* Soft background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-100px] top-[10%] h-[500px] w-[500px] rounded-full bg-orange-200 opacity-25 blur-[140px]" />
        <div className="absolute right-[-100px] bottom-[10%] h-[450px] w-[450px] rounded-full bg-orange-300 opacity-30 blur-[200px]" />
      </div>

      {/* Brand Logo */}
      {/* <div className="relative mb-20 flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <Coffee className="h-20 w-20 text-white drop-shadow-xl" />
      </div> */}

      {/* Subtext */}
      {/* <p className="mb-24 text-6xl font-bold text-neutral-800">
        What would you like to eat today?
      </p> */}

      {/* Option buttons */}
      <div className="flex gap-16">
        {/* Eat In */}
        <button
          onClick={() => onSelect("eatIn")}
          className="group relative flex h-[380px] w-[380px] flex-col items-center justify-center gap-10 rounded-[3rem] bg-white  border border-orange-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] "
        >
          {/* <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 shadow-inner transition-all group-hover:bg-orange-100 group-hover:border-orange-400"> */}
          {/* <Home className="h-20 w-20 text-orange-500 drop-shadow-sm" /> */}
          <HamburgerIcon size={80} color="#cc0000" weight="bold" />
          {/* </div> */}
          <p className="text-5xl font-black text-orange-400">Eat In</p>
        </button>

        {/* Take Out */}
        <button
          onClick={() => onSelect("takeOut")}
          className="group relative flex h-[380px] w-[380px] flex-col items-center justify-center gap-10 rounded-[3rem] bg-white/80 backdrop-blur-md border border-orange-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all hover:scale-105 hover:shadow-[0_14px_50px_rgba(0,0,0,0.12)] active:scale-100"
        >
          {/* <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 shadow-inner transition-all group-hover:bg-orange-100 group-hover:border-orange-400"> */}
          <ShoppingBagOpenIcon size={80} color="#cc0000" weight="bold" />
          {/* </div> */}
          <p className="text-5xl font-black text-orange-400">Take Out</p>
        </button>
      </div>
    </div>
  );
};
