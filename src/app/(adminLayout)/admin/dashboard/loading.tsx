"use client";

import { Skeleton } from "@heroui/skeleton";

/**
 * Route-level skeleton. It mirrors the dashboard's real layout, so the frame
 * does not jump when the data arrives: the range control, the chart panel,
 * the recent list, then the rail of three panels.
 */
const AdminDashboardLoading = () => (
  <div className="space-y-8" role="status">
    <span className="sr-only">Loading the dashboard</span>

    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-default/70 overflow-hidden rounded-[10px] border border-default/70 sm:grid-cols-4 sm:divide-y-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3 p-4">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-2 h-3 w-72 rounded" />
    </div>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        <div className="min-w-0">
          <Skeleton className="mb-3 h-7 w-44 rounded-md" />
          <div className="min-w-0 rounded-[10px] border border-default/70 p-4 sm:p-5">
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="mt-2 h-3 w-64 rounded" />
            <Skeleton className="mt-5 h-64 w-full rounded-md" />
          </div>
        </div>
        <div className="rounded-[10px] border border-default/70 p-4">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
      <div className="min-w-0 space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[10px] border border-default/70 p-4"
          >
            <Skeleton className="h-4 w-28 rounded" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((__, row) => (
                <Skeleton key={row} className="h-8 w-full rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminDashboardLoading;
