"use client";

import { Skeleton } from "@heroui/react";

const AdminDashboardLoading = () => (
  <div className="space-y-6">
    <div className="space-y-2 border-b border-default/60 pb-5">
      <Skeleton className="h-3 w-16 rounded" />
      <Skeleton className="h-7 w-48 rounded" />
      <Skeleton className="h-3 w-72 rounded" />
    </div>
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-default/60 bg-default/60 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 bg-background p-4">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-7 w-16 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-default/60 p-5">
      <Skeleton className="h-56 w-full rounded-lg" />
    </div>
  </div>
);

export default AdminDashboardLoading;
