"use client";

import Container from "@/components/ui/container";
import { Skeleton } from "@heroui/skeleton";

interface IProps {}

const DynamicBlogPageLoading: React.FC<IProps> = () => {
  return (
    <section className="pb-10">
      <Container>
        <div className="space-y-4">
          <div className="flex justify-center mt-4 w-full">
            <Skeleton className="w-full h-64 lg:h-96 rounded" />
          </div>
          <div className="space-y-14">
            <div className="space-y-4">
              <Skeleton className="w-full h-10 mx-auto max-w-xl rounded" />
              <div className="flex justify-center items-center space-x-2 lg:space-x-4 mx-auto w-full max-w-xl">
                <Skeleton className="size-10 lg:size-12 rounded-full" />
                <Skeleton className="h-6 w-32 rounded" />
                <Skeleton className="h-5 w-10 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>

              <div className={`flex justify-center items-center space-x-4`}>
                <Skeleton className="h-10 w-32 rounded" />
                <Skeleton className="h-10 w-32 rounded" />
              </div>
            </div>

            <Skeleton className="w-full h-32 rounded" />

            <div className="space-y-10">
              <div className="border border-default/50 py-2 px-2 rounded-full w-full max-w-fit mx-auto flex space-x-2 justify-center items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>

              <div className="flex items-center gap-2 justify-center w-full max-w-3xl flex-wrap mx-auto">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-24 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default DynamicBlogPageLoading;
