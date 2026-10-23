"use client";

import Container from "@/components/ui/container";
import { Skeleton } from "@heroui/skeleton";

/**
 * Loading state for an article.
 *
 * It traces the published page's actual first screen, in the same centred
 * reading column with the same rhythm: back link, category label, display
 * headline, the ruled byline row (portrait + name on the left, Follow on the
 * right), the read-time and views line, then the cover at its real aspect
 * ratio. Boxy, pill-shaped or differently spaced placeholders would make the
 * swap to the real article feel like a jump, so each block matches the
 * element it stands in for.
 */
const DynamicBlogPageLoading = () => {
  return (
    <section className="pb-16" aria-busy="true" aria-live="polite">
      <Container>
        <div className="mx-auto max-w-read pt-6">
          <Skeleton className="h-4 w-24 rounded-md" />

          <Skeleton className="mt-5 h-3.5 w-20 rounded" />

          <div className="mt-3 space-y-3">
            {/* Two lines from sm up (the headline sets on one or two lines),
                one line below sm where the scaled-down type wraps. */}
            <Skeleton className="h-[2.1rem] w-full rounded-md sm:h-[2.65rem] lg:h-[3.05rem]" />
            <Skeleton className="h-[2.1rem] w-3/5 rounded-md sm:h-[2.65rem] lg:h-[3.05rem]" />
          </div>

          <div className="mt-6 border-y border-default/60 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-11 w-[5.5rem] rounded-lg" />
            </div>

            <div className="mt-3 flex items-center gap-4">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-3 w-14 rounded-md" />
            </div>
          </div>

          <Skeleton className="mt-8 aspect-[16/9] w-full rounded-[10px] sm:aspect-[2/1]" />

          <div className="mt-10 space-y-3.5">
            {["w-full", "w-11/12", "w-full", "w-4/5", "w-full", "w-2/3"].map(
              (width, index) => (
                <Skeleton key={index} className={`h-4 rounded-md ${width}`} />
              ),
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default DynamicBlogPageLoading;
