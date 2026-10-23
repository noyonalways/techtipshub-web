"use client";

import { AdSlot } from "@/components/adsense";
import BlogCard from "@/components/blog-card";
import { getFollowingUsersBlogs } from "@/services/blog";
import { IBlog } from "@/types";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface IProps {
  initialBlogs: IBlog[];
}

const FollowingFeedBlogs = ({ initialBlogs }: IProps) => {
  const searchParams = useSearchParams();

  const [page, setPage] = useState(2);
  const [blogs, setBlogs] = useState<IBlog[]>(initialBlogs);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // Function to load more blogs
  const loadMoreBlogs = async () => {
    if (!hasMore) return;

    const params: { page: string; limit: string; [key: string]: string } = {
      page: page.toString(),
      limit: "5",
    };

    // Add searchTerm and category only if they are truthy
    const searchTerm = searchParams.get("search");
    const category = searchParams.get("category");
    if (searchTerm) params.searchTerm = searchTerm;
    if (category) params.category = category;

    const data = await getFollowingUsersBlogs(params);
    const newBlogs = data?.data || [];

    if(data.success && newBlogs.length > 0) {
      setBlogs((prevBlogs) => [...prevBlogs, ...newBlogs]);
      setPage((prevPage) => prevPage + 1);
    }

    // Stop further fetching if fewer blogs than the limit are returned
    if (newBlogs.length < 5) {
      setHasMore(false);
    }
  };

  // Watch for changes in searchParams to reset blogs and refetch
  useEffect(() => {
    setBlogs(initialBlogs);
    setPage(2);
    setHasMore(true);
  }, [searchParams]);

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreBlogs();
    }
  }, [inView, hasMore]);

  return (
    <div className="space-y-6 flex-1 w-full">
      {blogs?.map((blog, index) => (
        <Fragment key={blog?._id}>
          <BlogCard {...blog} />
          {/* Same density as the main feed: one unit per four cards, after
              the fourth card, never on a feed shorter than five blogs. */}
          {blogs.length > 4 && (index + 1) % 4 === 0 && (
            <AdSlot
              placement="following-feed-inline"
              className="mt-0 rounded-[10px] border border-default/60 bg-default-50/30 px-3 pb-3"
            />
          )}
        </Fragment>
      ))}
      <div className="text-center" ref={ref}>
        {hasMore ? "Loading..." : "No more blogs available."}
      </div>
    </div>
  );
};

export default FollowingFeedBlogs;
