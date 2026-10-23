"use client";

import { Skeleton } from "@heroui/skeleton";

const ManageCommentsLoading = () => (
  <div className="space-y-4">
    <div className="space-y-2 border-b border-default/60 pb-5">
      <Skeleton className="h-8 w-40 rounded" />
      <Skeleton className="h-3 w-80 max-w-full rounded" />
    </div>

    <div className="overflow-hidden rounded-[10px] border border-default/60">
      <div className="flex items-center justify-between gap-3 border-b border-default/60 p-2.5">
        <Skeleton className="h-9 w-56 rounded-[6px]" />
        <Skeleton className="hidden h-9 w-52 rounded-[6px] sm:block" />
      </div>

      <div className="divide-y divide-default/50">
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="flex items-start gap-4 px-4 py-3.5">
            <Skeleton className="mt-0.5 size-7 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-3 w-full max-w-md rounded" />
            </div>
            <Skeleton className="hidden h-3 w-28 rounded lg:block" />
            <Skeleton className="hidden h-3 w-14 rounded sm:block" />
          </div>
        ))}
      </div>
    </div>

    <p className="sr-only" role="status">
      Loading comments
    </p>
  </div>
);

export default ManageCommentsLoading;
