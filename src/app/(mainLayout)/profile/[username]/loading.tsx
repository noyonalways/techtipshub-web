"use client";

import Container from "@/components/ui/container";
import { Skeleton } from "@heroui/skeleton";

/**
 * Loading state for a member profile. Mirrors the real header block (identity,
 * statistics, facts) so the page does not jump when the data arrives.
 */
const UserLoadingPage = () => {
  return (
    <section className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-4xl">
          <div className="border-b border-default/60 pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                <Skeleton className="size-24 shrink-0 rounded-full lg:size-28" />
                <div className="space-y-3">
                  <Skeleton className="h-9 w-56 rounded-lg" />
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-4 w-full max-w-md rounded" />
                  <Skeleton className="h-4 w-3/4 max-w-sm rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            </div>

            <div className="mt-7 flex gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2 px-4 first:pl-0">
                  <Skeleton className="h-5 w-10 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-6 border-t border-default/60 pt-5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
          </div>

          <div className="mt-10 space-y-5">
            <Skeleton className="h-6 w-32 rounded" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex gap-4 border-b border-default/60 py-4">
                <Skeleton className="h-3 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-4/5 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default UserLoadingPage;
