"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderSuccessPageProps = {
  orderNumber: string;
  onRestart: () => void;
};

export const OrderSuccessPage = ({
  orderNumber,
  onRestart,
}: OrderSuccessPageProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-16 py-20">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-[150px] top-[10%] h-[500px] w-[500px] rounded-full bg-green-100/50 blur-[120px]"
          style={{ animation: "gradient-shift 12s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-[100px] bottom-[15%] h-[400px] w-[400px] rounded-full bg-emerald-100/40 blur-[100px]"
          style={{
            animation: "gradient-shift 15s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />
        <div
          className="absolute left-[40%] top-[50%] h-[300px] w-[300px] rounded-full bg-teal-50/50 blur-[80px]"
          style={{
            animation: "gradient-shift 10s ease-in-out infinite",
            animationDelay: "-8s",
          }}
        />
      </div>

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Success Icon with animations */}
        <div
          className="relative mb-16"
          style={{
            animation: showContent ? "scale-in 0.6s ease-out forwards" : "none",
            opacity: showContent ? 1 : 0,
          }}
        >
          {/* Outer pulsing ring */}
          <div
            className="absolute -inset-6 rounded-full border-2 border-green-300/40"
            style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
          />

          {/* Middle ring */}
          <div
            className="absolute -inset-3 rounded-full border border-green-400/30"
            style={{
              animation: "pulse-ring 2s ease-in-out infinite",
              animationDelay: "0.5s",
            }}
          />

          {/* Main icon container */}
          <div
            className="relative flex h-40 w-40 items-center justify-center rounded-full shadow-lg"
            style={{
              background:
                "linear-gradient(145deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
              boxShadow:
                "0 20px 50px rgba(34, 197, 94, 0.3), 0 8px 20px rgba(34, 197, 94, 0.2)",
            }}
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
            <CheckCircle2 className="relative h-20 w-20 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Success Text */}
        <div
          style={{
            animation: showContent
              ? "fade-up 0.6s ease-out 0.2s forwards"
              : "none",
            opacity: 0,
          }}
        >
          <p className="mb-3 font-body text-lg font-medium uppercase tracking-[0.3em] text-green-600/80">
            Order Confirmed
          </p>
          <h1 className="mb-4 font-display text-6xl font-semibold tracking-tight text-neutral-800">
            Thank You!
          </h1>
          <p className="font-body text-xl text-neutral-500">
            Your order has been successfully placed
          </p>
        </div>

        {/* Order Number Card */}
        <div
          className="mt-12 overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 p-10 shadow-lg backdrop-blur-sm"
          style={{
            animation: showContent
              ? "card-lift 0.6s ease-out 0.4s forwards"
              : "none",
            opacity: 0,
          }}
        >
          <p className="mb-2 font-body text-base font-medium text-neutral-500">
            Order Number
          </p>
          <p
            className="font-display text-7xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {orderNumber}
          </p>
          <p className="mt-3 font-body text-sm text-neutral-400">
            Please remember this number
          </p>
        </div>

        {/* Instructions */}
        <p
          className="mt-10 max-w-md font-body text-lg text-neutral-500"
          style={{
            animation: showContent
              ? "fade-up 0.6s ease-out 0.6s forwards"
              : "none",
            opacity: 0,
          }}
        >
          Your order will be ready shortly. Listen for your number to be called.
        </p>

        {/* Restart Button */}
        <div
          style={{
            animation: showContent
              ? "fade-up 0.6s ease-out 0.8s forwards"
              : "none",
            opacity: 0,
          }}
        >
          <Button
            onClick={onRestart}
            className="mt-12 h-16 gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-12 font-body text-xl font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <RotateCcw className="h-6 w-6" />
            New Order
          </Button>
        </div>

        {/* Decorative line */}
        <div
          className="mt-12 h-px w-32 bg-gradient-to-r from-transparent via-green-400/40 to-transparent"
          style={{
            animation: showContent
              ? "fade-up 0.6s ease-out 1s forwards"
              : "none",
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
};

const FloatingParticles = () => {
  const particles = [
    { top: "10%", left: "10%", size: 8, delay: 0 },
    { top: "15%", left: "80%", size: 6, delay: 1.5 },
    { top: "70%", left: "8%", size: 10, delay: 3 },
    { top: "75%", left: "85%", size: 7, delay: 2 },
    { top: "40%", left: "5%", size: 5, delay: 4 },
    { top: "45%", left: "92%", size: 8, delay: 2.5 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-green-400/30"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `soft-float 6s ease-in-out infinite, particle-in 0.5s ease-out forwards`,
            animationDelay: `${p.delay}s, ${0.3 + i * 0.1}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};
