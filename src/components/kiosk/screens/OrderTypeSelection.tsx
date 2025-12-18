"use client";

import { UtensilsCrossed, ShoppingBag, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type OrderTypeSelectionProps = {
  onSelect: (type: "eatIn" | "takeOut") => void;
};

export const OrderTypeSelection = ({ onSelect }: OrderTypeSelectionProps) => {
  const router = useRouter();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-16 py-20">
      {/* Subtle warm gradient background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-[150px] top-[10%] h-[500px] w-[500px] rounded-full bg-amber-200/40 blur-[100px]"
          style={{ animation: "gradient-shift 15s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-[100px] bottom-[15%] h-[400px] w-[400px] rounded-full bg-orange-200/30 blur-[120px]"
          style={{
            animation: "gradient-shift 12s ease-in-out infinite",
            animationDelay: "-6s",
          }}
        />
        <div
          className="absolute left-[40%] top-[50%] h-[300px] w-[300px] rounded-full bg-yellow-100/40 blur-[80px]"
          style={{
            animation: "gradient-shift 18s ease-in-out infinite",
            animationDelay: "-10s",
          }}
        />
      </div>

      {/* Decorative floating elements */}
      <FloatingDecorations />

      {/* Back button */}
      <button
        onClick={() => router.push("/kiosk")}
        className="absolute left-12 top-12 flex items-center gap-3 rounded-full bg-white/80 px-6 py-3 font-body text-lg font-medium text-neutral-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
        style={{
          animation: "fade-up 0.6s ease-out forwards",
        }}
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </button>

      {/* Header section */}
      <div className="relative z-10 mb-20 text-center">
        <p
          className="mb-4 font-body text-lg font-medium uppercase tracking-[0.3em] text-amber-600/80"
          style={{
            animation: "fade-up 0.6s ease-out forwards",
            animationDelay: "0.1s",
            opacity: 0,
          }}
        >
          Choose Your Experience
        </p>
        <h1
          className="font-display text-7xl font-semibold tracking-tight text-neutral-800"
          style={{
            animation: "fade-up 0.6s ease-out forwards",
            animationDelay: "0.2s",
            opacity: 0,
          }}
        >
          Where would you
          <br />
          like to dine?
        </h1>
      </div>

      {/* Option cards */}
      <div className="relative z-10 flex gap-12">
        {/* Eat In Card */}
        <button
          onClick={() => onSelect("eatIn")}
          className="group relative flex h-[420px] w-[400px] flex-col items-center justify-center gap-8 overflow-hidden rounded-[2.5rem] border-2 border-amber-200/60 bg-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-amber-400/80 hover:bg-white hover:shadow-[0_16px_60px_rgba(194,120,50,0.12)] active:scale-[0.98]"
          style={{
            animation: "card-lift 0.7s ease-out forwards",
            animationDelay: "0.3s",
            opacity: 0,
          }}
        >
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/0 via-amber-50/0 to-amber-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Icon container with animation */}
          <div className="relative">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
              style={{
                boxShadow:
                  "inset 0 2px 10px rgba(194, 120, 50, 0.1), 0 4px 20px rgba(194, 120, 50, 0.08)",
              }}
            >
              <UtensilsCrossed className="h-16 w-16 text-amber-600 transition-transform duration-300 group-hover:scale-110" />
            </div>
            {/* Decorative ring */}
            <div className="absolute -inset-3 rounded-[2rem] border border-amber-300/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="relative text-center">
            <h3 className="mb-2 font-display text-4xl font-semibold text-neutral-800 transition-colors group-hover:text-amber-700">
              Dine In
            </h3>
            <p className="font-body text-lg text-neutral-500 transition-colors group-hover:text-neutral-600">
              Enjoy your meal here
            </p>
          </div>

          {/* Bottom accent bar */}
          <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-t-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 group-hover:w-24" />
        </button>

        {/* Take Out Card */}
        <button
          onClick={() => onSelect("takeOut")}
          className="group relative flex h-[420px] w-[400px] flex-col items-center justify-center gap-8 overflow-hidden rounded-[2.5rem] border-2 border-amber-200/60 bg-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-amber-400/80 hover:bg-white hover:shadow-[0_16px_60px_rgba(194,120,50,0.12)] active:scale-[0.98]"
          style={{
            animation: "card-lift 0.7s ease-out forwards",
            animationDelay: "0.45s",
            opacity: 0,
          }}
        >
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/0 via-amber-50/0 to-amber-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Icon container */}
          <div className="relative">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
              style={{
                boxShadow:
                  "inset 0 2px 10px rgba(194, 120, 50, 0.1), 0 4px 20px rgba(194, 120, 50, 0.08)",
              }}
            >
              <ShoppingBag className="h-16 w-16 text-amber-600 transition-transform duration-300 group-hover:scale-110" />
            </div>
            {/* Decorative ring */}
            <div className="absolute -inset-3 rounded-[2rem] border border-amber-300/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="relative text-center">
            <h3 className="mb-2 font-display text-4xl font-semibold text-neutral-800 transition-colors group-hover:text-amber-700">
              Take Away
            </h3>
            <p className="font-body text-lg text-neutral-500 transition-colors group-hover:text-neutral-600">
              Grab and go
            </p>
          </div>

          {/* Bottom accent bar */}
          <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-t-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 group-hover:w-24" />
        </button>
      </div>

      {/* Decorative bottom line */}
      <div
        className="mt-20 h-px w-48 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
        style={{
          animation: "fade-up 0.6s ease-out forwards",
          animationDelay: "0.6s",
          opacity: 0,
        }}
      />
    </div>
  );
};

const FloatingDecorations = () => {
  const decorations = [
    { top: "12%", left: "8%", size: 8, delay: 0 },
    { top: "18%", right: "12%", size: 6, delay: 1.5 },
    { top: "75%", left: "10%", size: 10, delay: 3 },
    { top: "80%", right: "8%", size: 7, delay: 2 },
    { top: "45%", left: "5%", size: 5, delay: 4 },
    { top: "50%", right: "6%", size: 8, delay: 2.5 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      {decorations.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-400/25"
          style={{
            top: d.top,
            left: d.left,
            right: d.right,
            width: d.size,
            height: d.size,
            animation: `soft-float 6s ease-in-out infinite, particle-in 0.5s ease-out forwards`,
            animationDelay: `${d.delay}s, ${0.3 + i * 0.1}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};
