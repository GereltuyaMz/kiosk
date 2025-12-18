"use client";

import { Coffee, ArrowRight } from "lucide-react";

type TouchToStartProps = {
  onStart: () => void;
};

export const TouchToStart = ({ onStart }: TouchToStartProps) => {
  return (
    <button
      onClick={onStart}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden"
    >
      {/* Animated background gradient orbs - Light theme */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-200px] top-[5%] h-[600px] w-[600px] rounded-full bg-amber-200/50 blur-[150px]"
          style={{ animation: "gradient-shift 12s ease-in-out infinite" }}
        />
        <div
          className="absolute right-[-150px] bottom-[15%] h-[500px] w-[500px] rounded-full bg-orange-200/40 blur-[120px]"
          style={{
            animation: "gradient-shift 15s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />
        <div
          className="absolute left-[30%] top-[40%] h-[400px] w-[400px] rounded-full bg-yellow-100/50 blur-[100px]"
          style={{
            animation: "gradient-shift 10s ease-in-out infinite",
            animationDelay: "-8s",
          }}
        />
      </div>

      {/* Floating decorative particles */}
      <FloatingParticles />

      {/* Subtle grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo with animated rings */}
        <div
          className="relative mb-32"
          style={{ animation: "scale-in 1s ease-out forwards" }}
        >
          {/* Outer rotating ring */}
          <div
            className="absolute -inset-8 rounded-full border border-amber-400/30"
            style={{ animation: "rotate-slow 30s linear infinite" }}
          >
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-500/70" />
          </div>

          {/* Pulsing glow ring */}
          <div
            className="absolute -inset-4 rounded-full border-2 border-amber-400/40"
            style={{ animation: "pulse-ring 3s ease-in-out infinite" }}
          />

          {/* Main logo container */}
          <div
            className="relative flex h-56 w-56 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105"
            style={{
              background:
                "linear-gradient(145deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
              animation: "glow-pulse 4s ease-in-out infinite",
            }}
          >
            {/* Inner highlight */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
            <Coffee className="relative h-24 w-24 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Editorial typography */}
        <div
          className="mb-6"
          style={{
            animation: "fade-up 0.8s ease-out forwards",
            animationDelay: "0.3s",
            opacity: 0,
          }}
        >
          <span className="font-body text-lg font-medium uppercase tracking-[0.4em] text-amber-600/90">
            Premium Ordering
          </span>
        </div>

        <h1
          className="mb-8 font-display text-[140px] font-semibold leading-none tracking-tight text-neutral-800"
          style={{
            animation: "fade-up 0.8s ease-out forwards",
            animationDelay: "0.5s",
            opacity: 0,
            textShadow: "0 4px 30px rgba(0,0,0,0.08)",
          }}
        >
          Welcome
        </h1>

        <p
          className="mb-20 max-w-md font-body text-2xl font-light leading-relaxed text-neutral-500"
          style={{
            animation: "fade-up 0.8s ease-out forwards",
            animationDelay: "0.7s",
            opacity: 0,
          }}
        >
          Experience exceptional cuisine at your fingertips
        </p>

        {/* Premium CTA button */}
        <div
          style={{
            animation: "fade-up 0.8s ease-out forwards",
            animationDelay: "0.9s",
            opacity: 0,
          }}
        >
          <div className="relative overflow-hidden rounded-full border-2 border-amber-400/50 bg-white/70 px-16 py-7 shadow-[0_8px_40px_rgba(194,120,50,0.15)] backdrop-blur-sm transition-all duration-300 group-hover:border-amber-500 group-hover:bg-white group-hover:shadow-[0_12px_50px_rgba(194,120,50,0.25)]">
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(251,191,36,0.15), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite",
              }}
            />

            <div className="relative flex items-center gap-5">
              <span className="font-body text-3xl font-semibold text-amber-700">
                Touch to Begin
              </span>
              <ArrowRight
                className="h-8 w-8 text-amber-600"
                style={{ animation: "bounce-right 1.5s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>

        {/* Decorative line */}
        <div
          className="mt-20 h-px w-32 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
          style={{
            animation: "fade-up 0.8s ease-out forwards",
            animationDelay: "1.1s",
            opacity: 0,
          }}
        />
      </div>
    </button>
  );
};

const FloatingParticles = () => {
  const particles = [
    { top: "8%", left: "12%", size: 6, delay: 0, duration: 8 },
    { top: "15%", left: "75%", size: 8, delay: 2, duration: 10 },
    { top: "25%", left: "88%", size: 4, delay: 4, duration: 7 },
    { top: "45%", left: "8%", size: 10, delay: 1, duration: 12 },
    { top: "55%", left: "92%", size: 5, delay: 3, duration: 9 },
    { top: "70%", left: "18%", size: 7, delay: 5, duration: 11 },
    { top: "78%", left: "82%", size: 6, delay: 2, duration: 8 },
    { top: "88%", left: "45%", size: 4, delay: 6, duration: 10 },
    { top: "35%", left: "5%", size: 3, delay: 4, duration: 9 },
    { top: "62%", left: "95%", size: 5, delay: 1, duration: 11 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-amber-500/30"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `float ${p.duration}s ease-in-out infinite, particle-in 0.6s ease-out forwards`,
            animationDelay: `${p.delay}s, ${0.2 + i * 0.1}s`,
            ["--particle-opacity" as string]: 0.3,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};
