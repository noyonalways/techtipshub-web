"use client";

import { Skeleton } from "@heroui/skeleton";

const MessagesLoading = () => (
  <div className="space-y-6">
    <div className="space-y-2 border-b border-default/60 pb-5">
      <Skeleton className="h-8 w-44 rounded" />
      <Skeleton className="h-3 w-96 max-w-full rounded" />
    </div>

    <div className="overflow-hidden rounded-[10px] border border-default/60">
      <div className="grid lg:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)]">
        <div className="lg:border-r lg:border-default/60">
          <div className="flex items-center gap-2 border-b border-default/60 px-3 py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-14 rounded" />
            ))}
          </div>

          <div className="divide-y divide-default/60">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2 px-3.5 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
                <Skeleton className="h-3.5 w-4/5 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden space-y-4 p-6 lg:block">
          <Skeleton className="h-7 w-2/3 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
          <div className="space-y-2 pt-4">
            {["100%", "96%", "92%", "70%"].map((width, index) => (
              <Skeleton key={index} className="h-3 rounded" style={{ width }} />
            ))}
          </div>
        </div>
      </div>
    </div>

    <p className="sr-only" role="status">
      Loading the inbox
    </p>
  </div>
);

export default MessagesLoading;
