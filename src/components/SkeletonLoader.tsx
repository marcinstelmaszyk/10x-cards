import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonLoader = () => {
  return (
    <div className="space-y-4 mt-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex justify-end space-x-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
