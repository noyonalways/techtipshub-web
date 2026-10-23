"use client";

import { Skeleton } from "@heroui/skeleton";

/** Route-level fallback: the tab row and table frame the screen loads into. */
const TrashLoading = () => (
  <div aria-busy="true">
    <p className="sr-only" role="status">
      Loading the trash
    </p>

    <div className="overflow-hidden rounded-xl border border-default/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-default/60 p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <Skeleton className="h-9 w-48 rounded-md" />
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TrashLoading;
