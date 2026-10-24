"use client";

import { AdSlot } from "@/components/adsense";
import BlogCard from "@/components/blog-card";
import BlogCardSkeleton from "@/components/blog-card/skeleton";
import { getAllBlogs } from "@/services/blog";
import { IBlog } from "@/types";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface IProps {
  initialBlogs: IBlog[];
  /** Set by `/categories/<name>`: the filter is in the URL, not a query. */
  category?: string;
  /** Set by `/search`: the term is in the URL, not a query. */
  searchTerm?: string;
}

const FeedBlogs = ({ initialBlogs, category, searchTerm }: IProps) => {
  const searchParams = useSearchParams();

  const [page, setPage] = useState(2);
  const [blogs, setBlogs] = useState<IBlog[]>(initialBlogs);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // The page that rendered this list owns the filter; the query string is only
  // consulted when it did not supply one.
  const activeSearch = searchTerm || searchParams.get("search") || undefined;
  const activeCategory = category || searchParams.get("category") || undefined;

  // Function to load more blogs
  const loadMoreBlogs = async () => {
    if (!hasMore) return;

    const params: { page: string; limit: string; [key: string]: string } = {
      page: page.toString(),
      limit: "5",
    };

    // Add searchTerm and category only if they are truthy
    if (activeSearch) params.searchTerm = activeSearch;
    if (activeCategory) params.category = activeCategory;

    try {
      const data = await getAllBlogs(params);
      const newBlogs = data?.data || [];

      setBlogs((prevBlogs) => [...prevBlogs, ...newBlogs]);
      setPage((prevPage) => prevPage + 1);

      // Stop further fetching if fewer blogs than the limit are returned
      if (newBlogs.length < 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more blogs:", error);
      setHasMore(false);
    }
  };

  // A new server query (search/category/page) ships a new `initialBlogs`.
  // Reset pagination from that, so infinite scroll starts clean instead of
  // appending a second copy of page 2.
  useEffect(() => {
    setBlogs(initialBlogs);
    setPage(2);
    setHasMore(initialBlogs.length > 0);
  }, [initialBlogs]);

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreBlogs();
    }
  }, [inView, hasMore]);

  const categoryParam = activeCategory;
  const searchTermParam = activeSearch;

  const heading = searchTermParam
    ? `Results for "${searchTermParam}"`
    : categoryParam
      ? categoryParam.replace(/-/g, " ")
      : "Latest";

  return (
    <div className="w-full">
      <header className="mb-6 border-b border-default/60 pb-4">
        <h1 className="font-[family-name:var(--type-editorial)] text-3xl font-semibold leading-[1.1] tracking-[-0.01em]">{heading}</h1>
        <p className="mt-1 text-sm text-default-600">
          {searchTermParam || categoryParam
            ? "Articles matching your filters, newest first."
            : "New and noteworthy writing from the TechTipsHub community."}
        </p>
      </header>
      <div className="divide-y divide-default/60">
        {blogs?.map((blog, index) => (
          <Fragment key={blog?._id}>
            <div className="py-6 first:pt-0">
              <BlogCard {...blog} />
            </div>
            {/* One unit per four cards, after the fourth card. The leading
                `blogs.length > 4` check keeps a short feed ad free. */}
            {blogs.length > 4 && (index + 1) % 4 === 0 && (
              <div className="pb-6">
                <AdSlot
                  placement="feed-inline"
                  className="mt-0 rounded-[10px] border border-default/60 bg-default-50/30 px-3 pb-3"
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="py-6 text-center text-sm text-default-600" ref={ref}>
        {hasMore ? (
          <div className="space-y-6">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : (
          blogs.length > 0 && "You've reached the end of the feed."
        )}
      </div>
    </div>
  );
};

export default FeedBlogs;
