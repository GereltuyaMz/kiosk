export const ProductDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Variants Skeleton */}
      <div>
        <div
          className="mb-3 h-6 w-24 rounded-lg bg-amber-100/60"
          style={{
            animation: "loading-shimmer 1.5s ease-in-out infinite",
            background:
              "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
            backgroundSize: "200% 100%",
          }}
        />
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl border border-amber-200/60 bg-amber-50/50"
              style={{
                animation: "loading-shimmer 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
                background:
                  "linear-gradient(90deg, rgba(251,191,36,0.05) 0%, rgba(251,191,36,0.12) 50%, rgba(251,191,36,0.05) 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
        </div>
      </div>

      {/* Addons Skeleton */}
      <div>
        <div
          className="mb-3 h-6 w-20 rounded-lg bg-amber-100/60"
          style={{
            animation: "loading-shimmer 1.5s ease-in-out infinite",
            animationDelay: "0.2s",
            background:
              "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
            backgroundSize: "200% 100%",
          }}
        />
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-amber-200/60 bg-white"
              style={{
                animation: "loading-shimmer 1.5s ease-in-out infinite",
                animationDelay: `${0.3 + i * 0.1}s`,
                background:
                  "linear-gradient(90deg, rgba(251,191,36,0.03) 0%, rgba(251,191,36,0.08) 50%, rgba(251,191,36,0.03) 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
