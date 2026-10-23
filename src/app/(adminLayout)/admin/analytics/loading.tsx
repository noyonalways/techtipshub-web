"use client";

import { Skeleton } from "@heroui/skeleton";

/** Route-level fallback: same panel order as the loaded screen, no fake numbers. */
const AnalyticsLoading = () => (
  <div aria-busy="true">
    <p className="sr-only" role="status">
      Loading analytics
    </p>

    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-3 w-80 max-w-full rounded" />
      </div>
    </div>
    <div className="grid grid-cols-2 divide-x divide-y divide-default/70 overflow-hidden rounded-[10px] border border-default/70 sm:grid-cols-4 sm:divide-y-0">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={`space-y-3 bg-background p-4 ${
            index >= 2 ? "border-t border-default/70 sm:border-t-0" : ""
          }`}
        >
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-7 w-20 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      ))}
    </div>

    <div className="mt-8 overflow-hidden rounded-xl border border-default/60 bg-content-1">
      <div className="flex items-center justify-between border-b border-default/60 px-4 py-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-44 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
        <Skeleton className="h-9 w-48 rounded-md" />
      </div>
      <div className="p-4">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-default/60 bg-content-1"
        >
          <div className="border-b border-default/60 px-4 py-3">
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((__, row) => (
              <Skeleton key={row} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AnalyticsLoading;
