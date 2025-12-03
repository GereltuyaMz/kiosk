"use client";

import { Coffee, ChevronRight } from "lucide-react";

type TouchToStartProps = {
  onStart: () => void;
};

export const TouchToStart = ({ onStart }: TouchToStartProps) => {
  return (
    <button
      onClick={onStart}
      className="group relative flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 overflow-hidden active:scale-[0.985] transition-all"
    >
      {/* Soft floating background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-100px] top-[10%] h-[500px] w-[500px] rounded-full bg-orange-200 opacity-20 blur-[120px]" />
        <div className="absolute right-[-100px] bottom-[10%] h-[450px] w-[450px] rounded-full bg-orange-300 opacity-20 blur-[160px]" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-28 flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-110 group-active:scale-105">
          <Coffee className="h-32 w-32 text-white drop-shadow-lg" />
        </div>

        {/* Welcome text */}
        <h1 className="mb-16 text-8xl font-extrabold text-neutral-900 tracking-tight drop-shadow-sm">
          Welcome
        </h1>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-6 rounded-full px-16 py-8 bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-orange-200 transition-all group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <p className="text-5xl font-bold text-orange-600">Touch to Start</p>
          <ChevronRight className="h-16 w-16 text-orange-600 animate-pulse" />
        </div>
      </div>
    </button>
  );
};
