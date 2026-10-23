"use client";

import { Skeleton } from "@heroui/skeleton";

const ModerationLoading = () => (
  <div className="space-y-6">
    <div className="space-y-2 border-b border-default/60 pb-5">
      <Skeleton className="h-8 w-44 rounded" />
      <Skeleton className="h-3 w-96 max-w-full rounded" />
    </div>

    <div className="grid gap-2 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, tile) => (
        <div
          key={tile}
          className="space-y-4 rounded-[10px] border border-default/60 p-4"
        >
          <Skeleton className="size-8 rounded-[6px]" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>

    <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, column) => (
        <div key={column} className="space-y-3">
          <div className="space-y-1.5 border-b border-default/60 pb-2">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-64 max-w-full rounded" />
          </div>
          {Array.from({ length: 4 }).map((_, row) => (
            <div key={row} className="flex gap-3 py-3">
              <Skeleton className="hidden size-12 shrink-0 rounded-[6px] sm:block" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>

    <p className="sr-only" role="status">
      Loading the moderation queue
    </p>
  </div>
);

export default ModerationLoading;
