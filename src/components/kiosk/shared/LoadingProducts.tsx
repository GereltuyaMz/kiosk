import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingProducts = () => {
  return (
    <div className="space-y-8">
      {/* Grid Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-[180px] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-24 mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
