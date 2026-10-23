"use client";

import { Skeleton } from "@heroui/skeleton";

const ActivityLogLoading = () => (
  <div className="space-y-6">
    <div className="space-y-2 border-b border-default/60 pb-5">
      <Skeleton className="h-8 w-48 rounded" />
      <Skeleton className="h-3 w-96 max-w-full rounded" />
    </div>

    <div className="space-y-3 border-b border-default/60 pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-20 rounded" />
          ))}
        </div>
        <Skeleton className="hidden h-9 w-40 rounded-[6px] sm:block" />
      </div>
      <Skeleton className="h-3 w-72 max-w-full rounded" />
    </div>

    {Array.from({ length: 2 }).map((_, group) => (
      <div key={group} className="space-y-3">
        <Skeleton className="h-3 w-24 rounded" />
        {Array.from({ length: 3 }).map((_, row) => (
          <div key={row} className="flex items-start gap-3 py-2">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
            <Skeleton className="h-3 w-10 shrink-0 rounded" />
          </div>
        ))}
      </div>
    ))}

    <p className="sr-only" role="status">
      Loading the activity log
    </p>
  </div>
);

export default ActivityLogLoading;
