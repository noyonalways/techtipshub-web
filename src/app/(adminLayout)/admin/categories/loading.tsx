"use client";

import { Skeleton } from "@heroui/skeleton";

/** Route-level fallback: same frames as the loaded screen, no fake rows. */
const CategoriesLoading = () => (
  <div aria-busy="true">
    <p className="sr-only" role="status">
      Loading categories
    </p>

    <Skeleton className="h-4 w-72 rounded" />

    <div className="mt-4 overflow-hidden rounded-xl border border-default/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-default/60 p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-56 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-64 rounded" />
            </div>
            <Skeleton className="h-4 w-10 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CategoriesLoading;
