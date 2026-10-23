"use client";

import { Skeleton } from "@heroui/skeleton";

/** Route-level fallback while the member page reads the `id` segment. */
const MemberDetailLoading = () => (
  <div aria-busy="true">
    <p className="sr-only" role="status">
      Loading this member
    </p>

    <Skeleton className="h-4 w-24 rounded" />

    <div className="mt-4 flex items-center gap-4">
      <Skeleton className="size-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-52 rounded" />
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    </div>

    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-default/60 bg-default/60 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2 bg-background p-4">
          <Skeleton className="h-7 w-16 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      ))}
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

export default MemberDetailLoading;
