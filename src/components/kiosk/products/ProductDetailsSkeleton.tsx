export const ProductDetailsSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Variants Skeleton */}
      <div className="mb-8">
        <div className="mb-4 h-7 w-32 rounded-lg bg-neutral-200" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl border-2 border-orange-200 bg-orange-50"
            />
          ))}
        </div>
      </div>

      {/* Addons Skeleton */}
      <div className="mb-8">
        <div className="mb-4 h-7 w-28 rounded-lg bg-neutral-200" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl border-2 border-orange-200 bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
