import { Skeleton } from "@heroui/skeleton";

const BlogCardSkeleton = () => {
  return (
    <div className="w-full py-1">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-4/5 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        <div className="shrink-0 sm:w-40 lg:w-44">
          <Skeleton className="aspect-[16/10] w-full rounded-lg" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3.5 w-20 rounded" />
      </div>
    </div>
  );
};

export default BlogCardSkeleton;
