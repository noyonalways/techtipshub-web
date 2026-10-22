import { Skeleton } from "@heroui/skeleton";

interface IProps {}

const BlogCardSkeleton = ({}: IProps) => {
  return (
    <div className="border border-default/50 p-6 rounded-xl space-y-4 w-full">
      <div className="flex justify-between items-end">
        <div className="flex space-x-4 items-center">
          <Skeleton className="w-12 h-12 rounded-full" />{" "}
          {/* Placeholder for Avatar */}
          <div className="space-y-1">
            <Skeleton className="w-32 h-5 rounded" /> {/* Author Name */}
            <Skeleton className="w-24 h-4 rounded" />{" "}
            {/* Author Username and Date */}
          </div>
        </div>
        <Skeleton className="w-20 h-5 rounded-full" />{" "}
        {/* Premium Tag Placeholder */}
      </div>

      {/* Blog Title and Content Section */}
      <div className="flex flex-col-reverse lg:flex-row lg:items-start lg:space-x-4">
        <div className="lg:flex-1 space-y-1">
          <Skeleton className="w-full h-8 rounded" /> {/* Blog Title */}
          <Skeleton className="w-full h-5 rounded" />{" "}
          {/* Blog Content Preview */}
        </div>
        <div className="basis-full lg:basis-[28%] mb-3 lg:mb-0 rounded-xl">
          <Skeleton className="w-full h-32 rounded" />{" "}
        </div>
      </div>

      {/* Interaction Buttons Section */}
      <div className="flex flex-col items-end lg:flex-row lg:items-center justify-between space-y-2 lg:space-y-0">
        <div className="flex items-center space-x-1 lg:space-x-4">
          <div className={`flex space-x-2 items-center`}>
            <Skeleton className="w-[76px] lg:w-20 h-6 rounded" />
            <Skeleton className="w-[76px] lg:w-20 h-6 rounded" />
            <Skeleton className="w-[76px] lg:w-20 h-6 rounded" />
            <Skeleton className="w-[76px] lg:w-20 h-6 rounded" />
          </div>
        </div>
        <Skeleton className="w-24 h-6 rounded-full" />{" "}
      </div>
    </div>
  );
};

export default BlogCardSkeleton;