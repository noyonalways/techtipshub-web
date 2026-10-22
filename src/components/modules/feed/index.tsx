"use client";

import AdBanner from "@/components/adsense/ad-banner";
import BlogCard from "@/components/blog-card";
import BlogCardSkeleton from "@/components/blog-card/skeleton";
import { getAllPosts } from "@/services/post";
import { IPost } from "@/types";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface IProps {
  initialPosts: IPost[];
}

const FeedPosts = ({ initialPosts }: IProps) => {
  const searchParams = useSearchParams();

  const [page, setPage] = useState(2);
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // Function to load more posts
  const loadMorePosts = async () => {
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

    try {
      const data = await getAllPosts(params);
      const newPosts = data?.data || [];

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage((prevPage) => prevPage + 1);

      // Stop further fetching if fewer posts than the limit are returned
      if (newPosts.length < 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
      setHasMore(false);
    }
  };

  // A new server query (search/category/page) ships a new `initialPosts`.
  // Reset pagination from that, so infinite scroll starts clean instead of
  // appending a second copy of page 2.
  useEffect(() => {
    setPosts(initialPosts);
    setPage(2);
    setHasMore(initialPosts.length > 0);
  }, [initialPosts]);

  useEffect(() => {
    if (inView && hasMore) {
      loadMorePosts();
    }
  }, [inView, hasMore]);

  const categoryParam = searchParams.get("category");
  const searchTerm = searchParams.get("search");

  const heading = searchTerm
    ? `Results for “${searchTerm}”`
    : categoryParam
      ? categoryParam.replace(/-/g, " ")
      : "Latest";

  return (
    <div className="w-full">
      <header className="mb-6 border-b border-default/60 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        <p className="mt-1 text-sm text-default-500">
          {searchTerm || categoryParam
            ? "Articles matching your filters, newest first."
            : "New and noteworthy writing from the TechTips Hub community."}
        </p>
      </header>
      <div className="divide-y divide-default/60">
        {posts?.map((post, index) => (
          <Fragment key={post?._id}>
            <div className="py-6 first:pt-0">
              <BlogCard {...post} />
            </div>
            {posts.length > 4 && (index + 1) % 4 === 0 && (
              <div className="py-6">
                <AdBanner />
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="py-6 text-center text-sm text-default-500" ref={ref}>
        {hasMore ? (
          <div className="space-y-6">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : (
          posts.length > 0 && "You've reached the end of the feed."
        )}
      </div>
    </div>
  );
};

export default FeedPosts;
